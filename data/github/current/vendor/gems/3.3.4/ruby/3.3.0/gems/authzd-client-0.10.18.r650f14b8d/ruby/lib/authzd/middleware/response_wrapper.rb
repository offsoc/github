# frozen_string_literal: true

require_relative "base"

module Authzd
  module Middleware
    class ResponseWrapper < Base

      # Initializes a new instance of the middleware
      #
      def initialize(instrumenter: Instrumenters::Noop, **_)
        @instrumenter = instrumenter
      end

      # Wraps the response returned from the next middleware into a
      # Authzd::Proto::Result object
      def perform(req, metadata = {})
        if !req.batch?
          perform_authorize(req, metadata)
        else
          perform_batch_authorize(req, metadata)
        end
      end

      protected

      def middleware_name
        :request
      end

      def perform_authorize(req, metadata)
        decision = request.perform(req, metadata)
        response = Authzd::Response.from_decision(decision)
      rescue StandardError => err
        response = Authzd::Response.from_error(err)
      ensure
        instrument("authorize", response: response, authz_request: req)
      end

      def perform_batch_authorize(batch_req, metadata)
        batch_decision = request.perform(batch_req, metadata)
        response = Authzd::BatchResponse.from_decision(batch_req, batch_decision)
      rescue StandardError => err
        response = Authzd::BatchResponse.from_error(batch_req, err)
      ensure
        instrument("batch_authorize", error: response.error, response: response, authz_request: batch_req)
      end
    end
  end
end
