# frozen_string_literal: true

require "resilient/circuit_breaker"
require_relative "base"

module Authzd
  module Middleware
    class CircuitBreaker < Base
      CircuitOpenError = Class.new(Authzd::Error)
      DEFAULT_CIRCUIT_NAME = "authzd"

      attr_accessor :request

      # Initializes a new instance of the middleware
      # - circuit_name will be used to determine the circuit breaker name
      # which by default will be DEFAULT_CIRCUIT_NAME
      # - options, a Hash of options to pass when building the circuit breaker
      #
      def initialize(instrumenter: Instrumenters::Noop, circuit_name: DEFAULT_CIRCUIT_NAME, **options)
        @instrumenter = instrumenter
        @options = options
        @circuit_name = circuit_name
      end

      # Applies circuit breakers to request.perform
      def perform(req, metadata = {})
        rpc = req.rpc_name
        unless circuit.allow_request?
          instrument("open", authz_request: req, rpc: rpc)
          raise CircuitOpenError
        end

        begin
          request.perform(req, metadata).tap do
            instrument("success", authz_request: req, rpc: rpc)
            circuit.success
          end
        rescue => e
          instrument("failure", authz_request: req, rpc: rpc, error: e)
          circuit.failure
          raise
        end
      end

      protected

      def middleware_name
        :circuit_breaker
      end

      private

      def circuit
        @circuit ||= Resilient::CircuitBreaker.get(@circuit_name, @options)
      end
    end
  end
end
