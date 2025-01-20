# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Middleware
    class ResponseWrapperTest < Minitest::Test

      AuthorizerStub = Class.new
      Instrumenter   = Instrumenters::Noop

      def setup
        @authzd_request = Authzd::Proto::Request.new
        @batch_request = Authzd::Proto::BatchRequest.new(requests: [@authzd_request])
        @authorizer = AuthorizerStub.new

        options = {}
        @middleware = Middleware::ResponseWrapper.new(**options).tap do |middleware|
          middleware.request = @authorizer
        end
      end

      def test_result_wraps_error
        err = StandardError.new
        expected_metadata = {}
        decision = Authzd::Proto::Decision.indeterminate(reason: "StandardError")
        @authorizer.expects(:perform).once.with(@authzd_request, expected_metadata).raises(err)
        Instrumenter.expects(:instrument).once.with("authzd.client.request.authorize",
                                                    { middleware: "request",
                                                    operation: "authorize",
                                                    response: Authzd::Response.from_error(err),
                                                    authz_request: @authzd_request })

        response = @middleware.perform(@authzd_request)
        assert_predicate response, :error?
        assert_predicate response, :deny?
        refute_predicate response, :allow?
        assert_equal err, response.error
        assert_equal decision, response.decision
      end

      def test_results_wraps_allow_decision
        decision = Authzd::Proto::Decision.allow
        expected_metadata = {}
        @authorizer.expects(:perform).once.with(@authzd_request, expected_metadata).returns(decision)
        Instrumenter.expects(:instrument).once.with("authzd.client.request.authorize",
                                                    { middleware: "request",
                                                    operation: "authorize",
                                                    response: Authzd::Response.from_decision(decision),
                                                    authz_request: @authzd_request })

        response = @middleware.perform(@authzd_request)
        assert_predicate response, :allow?
        refute_predicate response, :deny?
        refute_predicate response, :error?
        assert_equal "Allowed", response.reason
        assert_nil response.error
        assert_equal decision, response.decision
      end

      def test_result_wraps_dont_allow_decision
        %i(deny not_applicable indeterminate).each do |not_allow|
          decision = Authzd::Proto::Decision.send(not_allow, reason: "wadus")
          expected_metadata = {}
          @authorizer.expects(:perform).once.with(@authzd_request, expected_metadata).returns(decision)
          Instrumenter.expects(:instrument).once.with("authzd.client.request.authorize",
                                                      { middleware: "request",
                                                      operation: "authorize",
                                                      response: Authzd::Response.from_decision(decision),
                                                      authz_request: @authzd_request })

          response = @middleware.perform(@authzd_request)
          assert_predicate response, :deny?
          refute_predicate response, :allow?
          refute_predicate response, :error?
          assert_equal "wadus", response.reason
          assert_nil response.error
          assert_equal decision, response.decision
        end
      end

      def test_catches_errors_while_wrapping_decisions
        err = StandardError.new
        decision = Authzd::Proto::Decision.allow
        @authorizer.expects(:perform).once.with(@authzd_request, {}).returns(decision)
        Authzd::Response.stubs(:from_decision).raises(err)

        response = @middleware.perform(@authzd_request)
        assert_equal true, response.error?
        assert_equal err, response.error
        assert_equal false, response.batch?
      end

      def test_instruments_w_batch_authorize
        batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.allow])
        batch_result = Authzd::BatchResponse.new(@batch_request, batch_decision, nil)
        Authzd::BatchResponse.stubs(:from_decision).returns(batch_result)

        @authorizer.expects(:perform).once.with(@batch_request, {}).returns(batch_decision)
        Instrumenter.expects(:instrument).once.with("authzd.client.request.batch_authorize",
                                                    { middleware: 'request',
                                                    operation: 'batch_authorize',
                                                    error: nil,
                                                    response: batch_result,
                                                    authz_request: @batch_request })

        response = @middleware.perform(@batch_request)
        assert_equal batch_decision, response.batch_decision
      end

      def test_batch_response_w_error
        err = StandardError.new
        expected_metadata = {}
        batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.allow])
        batch_result = Authzd::BatchResponse.new(@batch_request, batch_decision, err)
        Authzd::BatchResponse.stubs(:from_error).returns(batch_result)

        @authorizer.expects(:perform).once.with(@batch_request, expected_metadata).raises(err)
        Instrumenter.expects(:instrument).once.with("authzd.client.request.batch_authorize",
                                                    { middleware: 'request',
                                                    operation: 'batch_authorize',
                                                    error: err,
                                                    response: batch_result,
                                                    authz_request: @batch_request })

        response = @middleware.perform(@batch_request)
        assert_equal true, response.error?
        assert_equal true, response.batch?
      end

      def test_catches_errors_while_wrapping_batches
        err = StandardError.new("hi")
        batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.allow])
        Authzd::BatchResponse.stubs(:from_decision).raises(err)
        @authorizer.expects(:perform).once.with(@batch_request, {}).returns(batch_decision)

        response = @middleware.perform(@batch_request)
        assert_equal true, response.error?
        assert_equal err, response.error
        assert_equal true, response.batch?
      end
    end
  end
end
