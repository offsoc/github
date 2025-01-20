# frozen_string_literal: true

require_relative "base"

# instrumentation available from this middleware:
# - authnd.client.timing.request (payload: { method_name:, duration_ms:, error: })

module Authnd
  module Client
    module Middleware
      class Timing < Base
        def initialize(instrumenter: Instrumenters::Noop)
          super()
          @instrumenter = instrumenter
        end

        def perform(*args, headers: {}, **kwargs)
          method_name = original_method_name || "unknown"
          start = Time.now
          rescued_err = nil
          request.perform(*args, **kwargs, headers: headers)
        rescue StandardError => e
          rescued_err = e
          raise
        ensure
          duration_ms = (Time.now - start) * 1_000
          instrument("request", method_name: method_name, duration_ms: duration_ms, error: rescued_err)
        end

        protected

        def middleware_name
          :timing
        end
      end
    end
  end
end
