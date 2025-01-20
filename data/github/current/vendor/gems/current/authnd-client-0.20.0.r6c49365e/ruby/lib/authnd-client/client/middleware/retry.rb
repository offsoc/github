# frozen_string_literal: true

require_relative "base"

# instrumentation available from this middleware:
# - authnd.client.retry.tried (payload: { method_name:, attempt: })
# - authnd.client.retry.succeeded (payload: { method_name:, attempt: })
# - authnd.client.retry.waited  (payload: { method_name:, attempt:, wait_seconds:, error: })
# - authnd.client.retry.failed (payload: { method_name:, attempt:, error: })

module Authnd
  module Client
    module Middleware
      class Retry < Base
        DEFAULT_MAX_ATTEMPTS = 2
        DEFAULT_RETRYABLE_ERRORS = [StandardError].freeze

        # used to change Faraday timeout by this factor for the provided request
        # it won't be forwarded as a header
        METADATA_TIMEOUT_FACTOR = "__timeout_factor__"

        # Intializes a new instance of the middleware
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
          super()
          @instrumenter = instrumenter
          @max_attempts = max_attempts
          @retryable_errors = Array(retryable_errors)
          @options = options
          @wait_seconds = options.delete(:wait_seconds)&.to_f
          @retry_factor = options.delete(:retry_factor)
        end

        # Applies retry logic to request execution
        def perform(*args, headers: {}, **kwargs)
          method_name = original_method_name || "unknown"

          attempt ||= 1
          instrument("tried", attempt: attempt, method_name: method_name)

          headers[METADATA_TIMEOUT_FACTOR] = attempt if @retry_factor
          res = request.perform(*args, **kwargs, headers: headers)

          instrument("succeeded", attempt: attempt, method_name: method_name)
          res
        rescue *@retryable_errors => e
          if attempt == @max_attempts
            instrument("failed", attempt: attempt, method_name: method_name, error: e)
            raise
          end
          if @wait_seconds
            sleep @wait_seconds
            instrument("waited", attempt: attempt, wait_seconds: @wait_seconds, method_name: method_name, error: e)
          end
          attempt += 1
          retry
        rescue StandardError => e
          instrument("failed", attempt: attempt, method_name: method_name, error: e)
          raise
        end

        protected

        def middleware_name
          :retry
        end
      end
    end
  end
end
