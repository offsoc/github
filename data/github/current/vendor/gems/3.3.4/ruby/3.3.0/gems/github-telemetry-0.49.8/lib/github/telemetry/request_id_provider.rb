# frozen_string_literal: true

module GitHub
  module Telemetry
    # Provides access to the GitHub Request ID used for legacy correlation.
    class RequestIdProvider
      # Creates an updated context with the current request id.
      # This method will extract the request-id from the supplied Rack Environment, if none is present it will
      # generate a new v4 UUID request id for use in downstream service calls and log correlation.
      #
      # @param env [Hash] that optionally contains an `X-GitHub-Request-Id` generated upstream
      # @yield block to execute with current context information
      def using_request_id_from_baggage_or(env:, &block)
        # prefer request id from baggage, if it exists
        request_id = request_id_from_baggage || request_id_from_rack(env: env)
        context = new_context_from(request_id: request_id)
        OpenTelemetry::Context.with_current(context, &block)
      end

      # @return [String] Request ID stored in the current `Baggage` entry or generate a new v4 UUID
      #   if the baggage entry could not be found
      def find_or_generate_request_id
        request_id_from_baggage || new_request_id
      end

      # @return [String, nil] Request ID stored in the current `Baggage` entry or nil
      #   if the baggage entry could not be found
      def request_id_from_baggage
        OpenTelemetry::Baggage.value(REQUEST_ID_BAGGAGE_KEY)
      end

      # Creates a `OpenTelemetry::Context` with updated `Baggage` that includes a Request ID.
      #
      # @param request_id [String] that optionally contains a `X-GitHub-Request-Id` generated upstream
      # @return [OpenTelemetry::Context]
      def new_context_from(request_id:)
        OpenTelemetry::Baggage.set_value(GitHub::Telemetry::REQUEST_ID_BAGGAGE_KEY, request_id || new_request_id)
      end

      private

      # @return [String, nil] Request ID from the legacy HTTP request headers or nil
      # if it is missing
      def request_id_from_rack(env:)
        env[RACK_REQUEST_ID_HEADER]
      end

      # @return [String] v4 UUID
      def new_request_id
        SecureRandom.uuid
      end
    end
  end
end
