# frozen_string_literal: true

require "resilient/circuit_breaker"
require "faraday_middleware/instrumenters/noop"

module FaradayMiddleware
  class CircuitBreaker
    CircuitOpenError = Class.new(StandardError)
    DEFAULT_CIRCUIT_NAME = "group_syncer"

    # Consider any non-500 response a successful service response.
    SUCCESS_STATUS_CODES = (200..500-1)

    # Intializes a new instance of the middleware
    # - circuit_name will be used to determine the circuit breaker name
    #   which by default will be DEFAULT_CIRCUIT_NAME
    # - options, a Hash of options to pass when building the circuit breaker
    #
    def initialize(app, options = {})
      @app = app
      @instrumenter = options.delete(:instrumenter) || Instrumenters::Noop
      @circuit_name = options.delete(:circuit_name) || DEFAULT_CIRCUIT_NAME
      @options = options
      @options[:instrumenter] = @instrumenter
    end

    def call(env)
      unless circuit.allow_request?
        instrument("open")
        raise CircuitOpenError
      end

      @app.call(env).on_complete do |response_env|
        if SUCCESS_STATUS_CODES.include?(response_env.status)
          instrument("success")
          circuit.success
        else
          instrument("failure")
          circuit.failure
        end
      end
    rescue => e
      instrument("failure", error: e)
      circuit.failure
      raise
    end

    private

    def circuit
      Resilient::CircuitBreaker.get(@circuit_name, @options)
    end

    def instrument(op, payload = {}, &block)
      payload = {middleware: "group_syncer.circuit_breaker", operation: op.to_s}.merge(payload)
      @instrumenter.instrument("group_syncer.circuit_breaker.%s" % op, payload, &block)
    end
  end
end
