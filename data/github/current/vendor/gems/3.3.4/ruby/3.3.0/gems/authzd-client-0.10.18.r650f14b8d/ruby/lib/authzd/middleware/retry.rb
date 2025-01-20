# frozen_string_literal: true

require_relative "base"

module Authzd
  module Middleware
    class Retry < Base

      DEFAULT_MAX_ATTEMPTS = 2
      DEFAULT_RETRYABLE_ERRORS = [StandardError]
      INTERNAL_METADATA_TIMEOUT_FACTOR = "__timeout_factor__"

      # Initializes a new instance of the middleware
      # - max_attempts an integer representing how many times the middleware
      # will retry the request, in case it keeps failing.
      # - retryable_errors, an array of exception classes to rescue and retry
      # - options, a Hash of options to pass when building the Retry middleware
      # - options[:instrumenter] an object responding to `instrument` for the purpose of
      #  having observability about the events happening in the middelware.
      # - options[:wait_seconds] a float representing the time to wait (by calling
      # `sleep`) between tries
      #
      def initialize(instrumenter: Instrumenters::Noop, max_attempts: DEFAULT_MAX_ATTEMPTS, retryable_errors: DEFAULT_RETRYABLE_ERRORS, **options)
        @instrumenter = instrumenter
        @max_attempts = max_attempts
        @retryable_errors = Array(retryable_errors)
        # always retry on indeterminate
        @retryable_errors << Authzd::IndeterminateError
        @options = options
        @wait_seconds = options.delete(:wait_seconds)&.to_f
        @retry_factor = options.delete(:retry_factor)
      end

      # Applies retry logic to request execution
      def perform(req, metadata = {})
        original_request ||= req
        attempt ||= 1
        rpc = req.batch? ? "batch_authorize" : "authorize"
        instrument("tried", attempt: attempt, authz_request: req, rpc: rpc)

        metadata[INTERNAL_METADATA_TIMEOUT_FACTOR] = attempt if @retry_factor
        res = request.perform(req, metadata)

        if res.batch?
          original_mapped_batch ||= begin
            mapping = res.map_to_requests(req)
            if mapping.size != req.requests.size
              instrument("dupe_requests_in_batch", count: (req.requests.size - mapping.size), authz_request: req)
            end
            mapping
          end
          merge_and_raise(original_mapped_batch, req, res)
        else
          raise Authzd::IndeterminateError.new(res.reason) if res&.indeterminate?
        end

        instrument("succeeded", attempt: attempt, authz_request: req, rpc: rpc)
        if res.batch?
          return map_to_batch_decision(original_mapped_batch, original_request)
        end
        res
      rescue *@retryable_errors => err
        if attempt == @max_attempts
          instrument("failed", attempt: attempt, authz_request: req, error: err, rpc: rpc, indeterminates: get_batch_indeterminates(original_mapped_batch))
          if req.batch? && !original_mapped_batch.nil?
            return map_to_batch_decision(original_mapped_batch, original_request)
          end
          raise
        end
        if @wait_seconds
          sleep @wait_seconds
          instrument("waited", attempt: attempt, wait_seconds: @wait_seconds, authz_request: req, error: err, rpc: rpc)
        end
        attempt += 1
        req = request_to_retry(req, err)
        retry
      rescue => err
        instrument("failed", attempt: attempt, authz_request: req, error: err, rpc: rpc)
        raise
      end

      protected

      def middleware_name
        :retry
      end

      private

      # updates the map representing the original BatchRequest with the intermediate BatchRequest and BatchResponse
      # that result from retrying. If there are indeterminate Decisions, it raises an exception
      # that carries new BatchRequest to retry.
      def merge_and_raise(original_mapped_batch, req, res)
        map = res.map_to_requests(req)
        merge_decisions(original_mapped_batch, map)
        batch_for_retry = batch_for_indeterminates(map)
        raise Authzd::BatchError.new(batch_request: batch_for_retry) if batch_for_retry.requests.any?
      end

      # given a target map of Request to Decision, it merges the decisions from the source map
      # into the target map. This is done by match map keys.
      def merge_decisions(target, source)
        if target != source
          source.each do |key, value|
            target[key] = value
          end
        end
      end

      # given a map of Request to Decision, and a reference BatchRequest,
      # it creates a BatchDecision containing the decisions from the map, but
      # respecting the order of the reference BatchRequest
      def map_to_batch_decision(batch_map, original_request)
        result = []
        original_request.requests.each do |r|
          result << batch_map[r]
        end
        Authzd::Proto::BatchDecision.new(decisions: result)
      end

      # given a map of Request to Decision, it returns a BatchRequest containing
      # the requests for those decisions that are INDETERMINATE and need to be retried
      def batch_for_indeterminates(map)
        requests_for_retry = map.select {|_, value| value.indeterminate?}.keys
        Authzd::Proto::BatchRequest.new(requests: requests_for_retry)
      end

      # Returns a batch request that contains only elements that failed
      # in the previous batch request: we don't want to retry what succeeded.
      #
      # if the request is not a batch, it is returned as-is
      def request_to_retry(req, err)
        if err.is_a? Authzd::BatchError
          return err.request
        end
        req
      end

      def get_batch_indeterminates(mapped_batch)
        return {} if mapped_batch.nil?
        mapped_batch.select {|_, v| v.indeterminate?}
      end
    end
  end
end
