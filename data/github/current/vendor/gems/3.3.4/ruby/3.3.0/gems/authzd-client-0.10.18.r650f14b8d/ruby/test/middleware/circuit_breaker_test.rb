# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Middleware
    class CircuitBreakerTest < Minitest::Test

      AuthorizerStub = Class.new
      Instrumenter   = Instrumenters::Noop

      def setup
        ::Resilient::CircuitBreaker::Registry.default.reset

        @authzd_request = Authzd::Proto::Request.new
        @batch_request = Authzd::Proto::BatchRequest.new
        @authorizer = AuthorizerStub.new

        options = {
          request_volume_threshold: 1,  # second bad request in the window, opens the circuit
          sleep_window_seconds: 5       # wait 5 seconds to close the circuit again
        }
        @middleware = Middleware::CircuitBreaker.new(**options).tap do |middleware|
          middleware.request = @authorizer
        end

        @circuit = @middleware.send(:circuit)
      end

      def test_circuit_closed_success_keeps_it_closed
        expected_metadata = {}
        Instrumenter.expects(:instrument).with("authzd.client.circuit_breaker.success", { middleware: "circuit_breaker", operation: "success", authz_request: @authzd_request, rpc: "authorize" })
        @authorizer.expects(:perform).once.with(@authzd_request, expected_metadata).returns(Authzd::Proto::Decision.allow)
        assert_predicate @middleware.perform(@authzd_request), :allow?
        refute @circuit.open
      end

      def test_circuit_close_second_try_opened
        expected_metadata = {}
        error = StandardError.new
        @authorizer.expects(:perform).once.with(@authzd_request, expected_metadata).raises(error)

       instrumentation_sequence = sequence("instrumentation")
       Instrumenter.expects(:instrument).with("authzd.client.circuit_breaker.failure",
                                              { middleware: "circuit_breaker",
                                              operation: "failure",
                                              error: error,
                                              authz_request: @authzd_request,
                                              rpc: "authorize" }
       ).in_sequence(instrumentation_sequence)

       Instrumenter.expects(:instrument).with("authzd.client.circuit_breaker.open",
                                              { middleware: "circuit_breaker",
                                              operation: "open",
                                              authz_request: @authzd_request,
                                              rpc: "authorize" }
       ).in_sequence(instrumentation_sequence)

        assert_raises(StandardError)  do
          @middleware.perform(@authzd_request)
        end

        assert_raises(Middleware::CircuitBreaker::CircuitOpenError)  do
          @middleware.perform(@authzd_request)
        end
        assert @circuit.open
      end

      def test_circuit_opens_with_batch_authorize
        expected_metadata = {}
        @batch_request = Authzd::Proto::BatchRequest.new
        error = StandardError.new
        @authorizer.expects(:perform).once.with(@batch_request, expected_metadata).raises(error)

       instrumentation_sequence = sequence("instrumentation")
       Instrumenter.expects(:instrument).with("authzd.client.circuit_breaker.failure",
                                              { middleware: "circuit_breaker",
                                              operation: "failure",
                                              error: error,
                                              authz_request: @batch_request,
                                              rpc: "batch_authorize" }
       ).in_sequence(instrumentation_sequence)

       Instrumenter.expects(:instrument).with("authzd.client.circuit_breaker.open",
                                              {middleware: "circuit_breaker",
                                              operation: "open",
                                              authz_request: @batch_request,
                                              rpc: "batch_authorize"}
       ).in_sequence(instrumentation_sequence)

        assert_raises(StandardError)  do
          @middleware.perform(@batch_request)
        end

        assert_raises(Middleware::CircuitBreaker::CircuitOpenError)  do
          @middleware.perform(@batch_request)
        end
        assert @circuit.open
      end

      def test_batch_auth_success_keeps_circuit_closed
        expected_metadata = {}
        Instrumenter.expects(:instrument).with("authzd.client.circuit_breaker.success",
                                               { middleware: "circuit_breaker",
                                               operation: "success",
                                               authz_request: @batch_request,
                                               rpc: "batch_authorize" })
        @authorizer.expects(:perform).once.with(@batch_request, expected_metadata).returns(Authzd::Proto::BatchDecision.new)
        assert_equal Authzd::Proto::BatchDecision, @middleware.perform(@batch_request).class
        refute @circuit.open
      end
    end
  end
end
