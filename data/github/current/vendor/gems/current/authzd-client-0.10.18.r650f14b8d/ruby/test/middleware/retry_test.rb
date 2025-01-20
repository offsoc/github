# frozen_string_literal: true

require_relative "../test_helper"

module Authzd
  module Middleware
    class RetryTest < Minitest::Test

      AuthorizerStub         = Class.new
      RetryableError         = Class.new(StandardError)
      AnotherRetryableError  = Class.new(StandardError)
      NonRetryableError      = Class.new(StandardError)
      Instrumenter           = Authzd::Middleware::Instrumenters::Noop

      def setup
        @authzd_request = Authzd::Proto::Request.new
        @authorizer = AuthorizerStub.new

        options = {
            max_attempts: 3,
            retryable_errors: [RetryableError, AnotherRetryableError],
        }
        @middleware = Middleware::Retry.new(**options).tap do |middleware|
          middleware.request = @authorizer
        end
      end

      def test_retry_max_attempts_and_bubble_up_error
        retryable_error = RetryableError.new
        @authorizer.expects(:perform).times(3).with(@authzd_request, {}).raises(retryable_error)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.failed", { middleware: "retry", operation: "failed", attempt: 3, authz_request: @authzd_request, error: retryable_error, rpc: "authorize", indeterminates: {} }).in_sequence(instrumentation_sequence)

        assert_raises(RetryableError)  do
          @middleware.perform(@authzd_request)
        end
      end

      def test_retry_and_on_success_return_result
        fail_and_succeed = sequence("fail and succeed")
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(fail_and_succeed).raises(AnotherRetryableError)
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(fail_and_succeed).returns(Authzd::Proto::Decision.allow)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.succeeded", { middleware: "retry", operation: "succeeded", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)

        assert @middleware.perform(@authzd_request).allow?
      end

      def test_doesnt_retry_if_error_isnt_retryable
        error = NonRetryableError.new
        @authorizer.expects(:perform).with(@authzd_request, {}).once.raises(error)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.failed", { middleware: "retry", operation: "failed", attempt: 1, authz_request: @authzd_request, error: error, rpc: "authorize" }).in_sequence(instrumentation_sequence)

        assert_raises(NonRetryableError)  do
          @middleware.perform(@authzd_request)
        end
      end

      def test_wait_between_retries_if_option_provided
        fail_and_succeed = sequence("fail and succeed")
        retryable_error = RetryableError.new
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(fail_and_succeed).raises(retryable_error)
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(fail_and_succeed).returns(Authzd::Proto::Decision.allow)

        @middleware = Middleware::Retry.new(wait_seconds: 0.1).tap do |middleware|
          middleware.request = @authorizer
        end
        @middleware.stubs(:sleep).once.with(0.1)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.waited", { middleware: "retry", operation: "waited", attempt: 1, authz_request: @authzd_request, wait_seconds: 0.1, error: retryable_error, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.succeeded", { middleware: "retry", operation: "succeeded", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)

        assert @middleware.perform(@authzd_request).allow?
      end

      def test_retries_for_indeterminate_error
        indeterminate_and_succeed = sequence("indeterminate and succeed")
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(indeterminate_and_succeed).returns(Authzd::Proto::Decision.indeterminate)
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(indeterminate_and_succeed).returns(Authzd::Proto::Decision.indeterminate)
        @authorizer.expects(:perform).with(@authzd_request, {}).in_sequence(indeterminate_and_succeed).returns(Authzd::Proto::Decision.allow)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.succeeded", { middleware: "retry", operation: "succeeded", attempt: 3, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)

        assert @middleware.perform(@authzd_request).allow?
      end

      def test_max_retries_w_indeterminate_raises
        @authorizer.expects(:perform).with(@authzd_request, {}).times(3).returns(Authzd::Proto::Decision.indeterminate(reason: "a failure"))

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)

        assert_raises(Authzd::IndeterminateError)  do
          @middleware.perform(@authzd_request)
        end
      end

      def test_max_retries_w_wait
        @middleware = Middleware::Retry.new(wait_seconds: 0.1, max_attempts: 3).tap do |middleware|
          middleware.request = @authorizer
        end
        @middleware.stubs(:sleep).times(2).with(0.1)
        @authorizer.expects(:perform).with(@authzd_request, {}).times(3).returns(Authzd::Proto::Decision.indeterminate(reason: "lol"))

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: @authzd_request, rpc: "authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)

        assert_raises(Authzd::IndeterminateError)  do
          @middleware.perform(@authzd_request)
        end
      end

      def test_batch_authorize_with_retry
        batch_request = Authzd::Proto::BatchRequest.new
        fail_and_succeed = sequence("fail and succeed")
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_and_succeed).raises(AnotherRetryableError)
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_and_succeed).returns(Authzd::Proto::BatchDecision.new)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.succeeded", { middleware: "retry", operation: "succeeded", attempt: 2, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)

        assert_equal Authzd::Proto::BatchDecision, @middleware.perform(batch_request).class
      end

      def test_retries_indeterminate_in_batch
        req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", nil)])
        req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", nil)])
        req3 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("3", nil)])
        req4 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("4", nil)])

        batch_request = Authzd::Proto::BatchRequest.new(requests: [req1, req2, req3, req4])
        batch_with_indeterminate = Authzd::Proto::BatchDecision.new(decisions: [
            Authzd::Proto::Decision.allow, Authzd::Proto::Decision.indeterminate, Authzd::Proto::Decision.not_applicable, Authzd::Proto::Decision.indeterminate])

        retry1_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2, req4])
        retry1_batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.indeterminate, Authzd::Proto::Decision.allow])

        retry2_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2])
        retry2_batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.deny])

        fail_and_succeed = sequence("fail, fail and succeed")
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_and_succeed).returns(batch_with_indeterminate)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_and_succeed).returns(retry1_batch_decision)
        @authorizer.expects(:perform).with(retry2_batch_request, {}).in_sequence(fail_and_succeed).returns(retry2_batch_decision)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: retry1_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: retry2_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.succeeded", { middleware: "retry", operation: "succeeded", attempt: 3, authz_request: retry2_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)

        batch_decision = @middleware.perform(batch_request)
        assert_equal batch_decision.decisions[0].result, :ALLOW
        assert_equal batch_decision.decisions[1].result, :DENY
        assert_equal batch_decision.decisions[2].result, :NOT_APPLICABLE
        assert_equal batch_decision.decisions[3].result, :ALLOW
      end

      def test_retries_indeterminate_in_and_gives_up
        req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", true)])
        req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", true)])
        req3 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("3", false)])
        req4 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("4", false)])

        batch_request = Authzd::Proto::BatchRequest.new(requests: [req1, req2, req3, req4])
        batch_with_indeterminate = Authzd::Proto::BatchDecision.new(decisions: [
            Authzd::Proto::Decision.allow, Authzd::Proto::Decision.indeterminate, Authzd::Proto::Decision.not_applicable, Authzd::Proto::Decision.indeterminate])

        retry1_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2, req4])
        retry1_batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.indeterminate, Authzd::Proto::Decision.allow])

        retry2_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2])
        retry2_batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.indeterminate])

        fail_fail_fail = sequence("fail, fail and fail")
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_fail_fail).returns(batch_with_indeterminate)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).returns(retry1_batch_decision)
        @authorizer.expects(:perform).with(retry2_batch_request, {}).in_sequence(fail_fail_fail).returns(retry2_batch_decision)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: retry1_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: retry2_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)

        batch_decision = @middleware.perform(batch_request)
        assert_equal batch_decision.decisions[0].result, :ALLOW
        assert_equal batch_decision.decisions[1].result, :INDETERMINATE
        assert_equal batch_decision.decisions[2].result, :NOT_APPLICABLE
        assert_equal batch_decision.decisions[3].result, :ALLOW
      end

      def test_mix_of_indeterminate_and_exceptions_for_batch
        req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", 1)])
        req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", 2)])
        req3 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("3", 3)])
        req4 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("4", 4)])

        batch_request = Authzd::Proto::BatchRequest.new(requests: [req1, req2, req3, req4])
        batch_with_indeterminate = Authzd::Proto::BatchDecision.new(decisions: [
            Authzd::Proto::Decision.allow, Authzd::Proto::Decision.indeterminate, Authzd::Proto::Decision.not_applicable, Authzd::Proto::Decision.indeterminate])

        retry1_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2, req4])
        retry1_batch_decision = Authzd::Proto::BatchDecision.new(decisions: [Authzd::Proto::Decision.allow, Authzd::Proto::Decision.indeterminate])
        fail_fail_fail = sequence("fail, fail and fail")
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_fail_fail).returns(batch_with_indeterminate)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).raises(AnotherRetryableError.new)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).returns(retry1_batch_decision)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: retry1_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: retry1_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)

        batch_decision = @middleware.perform(batch_request)
        assert_equal :ALLOW, batch_decision.decisions[0].result
        assert_equal :ALLOW, batch_decision.decisions[1].result
        assert_equal :NOT_APPLICABLE, batch_decision.decisions[2].result
        assert_equal :INDETERMINATE, batch_decision.decisions[3].result
      end

      def test_failed_batch_returns_the_best_we_have
        req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", "1")])
        req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", "2")])
        req3 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("3", "3")])
        req4 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("4", "4")])

        batch_request = Authzd::Proto::BatchRequest.new(requests: [req1, req2, req3, req4])
        batch_with_indeterminate = Authzd::Proto::BatchDecision.new(decisions: [
            Authzd::Proto::Decision.allow, Authzd::Proto::Decision.indeterminate, Authzd::Proto::Decision.not_applicable, Authzd::Proto::Decision.indeterminate])

        retry1_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2, req4])
        error = AnotherRetryableError.new

        fail_fail_fail = sequence("fail, fail and fail")
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_fail_fail).returns(batch_with_indeterminate)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).raises(error)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).raises(error)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 1, authz_request: batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 2, authz_request: retry1_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", attempt: 3, authz_request: retry1_batch_request, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).in_sequence(instrumentation_sequence)

        batch_decision = @middleware.perform(batch_request)
        assert_equal :ALLOW, batch_decision.decisions[0].result
        assert_equal :INDETERMINATE, batch_decision.decisions[1].result
        assert_equal :NOT_APPLICABLE, batch_decision.decisions[2].result
        assert_equal :INDETERMINATE, batch_decision.decisions[3].result
      end

      def test_batch_never_succeeds
        error = AnotherRetryableError.new
        batch_request = Authzd::Proto::BatchRequest.new(requests: [Authzd::Proto::Request.new])
        @authorizer.expects(:perform).with(batch_request, {}).times(3).raises(error)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", authz_request: batch_request, attempt: 1, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", authz_request: batch_request, attempt: 2, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", authz_request: batch_request, attempt: 3, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.failed", { middleware: "retry", operation: "failed", authz_request: batch_request, attempt: 3, :error => error, rpc: "batch_authorize", indeterminates: {} }).in_sequence(instrumentation_sequence)

        assert_raises(AnotherRetryableError) do
          @middleware.perform(batch_request)
        end
      end

      def test_batch_with_duplicate_requests
        req1 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", nil)])
        req2 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", nil)])
        req3 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("1", nil)])
        req4 = Authzd::Proto::Request.new(attributes: [Authzd::Proto::Attribute.wrap("2", nil)])

        batch_request = Authzd::Proto::BatchRequest.new(requests: [req1, req2, req3, req4])
        ## because req2 == req4, and req4 is evaluated the last, its decision prevails over req2's decision
        batch_with_indeterminate = Authzd::Proto::BatchDecision.new(decisions: [
            Authzd::Proto::Decision.allow,
            Authzd::Proto::Decision.indeterminate,
            Authzd::Proto::Decision.allow,
            Authzd::Proto::Decision.indeterminate])

        # because req2 == req4, only req2 is retried
        retry1_batch_request = Authzd::Proto::BatchRequest.new(requests: [req2])
        error = AnotherRetryableError.new

        fail_fail_fail = sequence("fail, fail and fail")
        @authorizer.expects(:perform).with(batch_request, {}).in_sequence(fail_fail_fail).returns(batch_with_indeterminate)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).raises(error)
        @authorizer.expects(:perform).with(retry1_batch_request, {}).in_sequence(fail_fail_fail).raises(error)

        instrumentation_sequence = sequence("instrumentation")
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", authz_request: batch_request, attempt: 1, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.dupe_requests_in_batch", { middleware: "retry", authz_request: batch_request, operation: "dupe_requests_in_batch", count: 2 }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", authz_request: retry1_batch_request, attempt: 2, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.tried", { middleware: "retry", operation: "tried", authz_request: retry1_batch_request, attempt: 3, rpc: "batch_authorize" }).in_sequence(instrumentation_sequence)
        Instrumenter.expects(:instrument).with("authzd.client.retry.failed", { middleware: "retry", operation: "failed", authz_request: retry1_batch_request, attempt: 3, :error => error, rpc: "batch_authorize", indeterminates: {req2 => Authzd::Proto::Decision.indeterminate} }).in_sequence(instrumentation_sequence)

        batch_decision = @middleware.perform(batch_request)
        assert_equal :ALLOW, batch_decision.decisions[0].result
        assert_equal :INDETERMINATE, batch_decision.decisions[1].result
        assert_equal :ALLOW, batch_decision.decisions[2].result
        assert_equal :INDETERMINATE, batch_decision.decisions[3].result
      end

      def test_retry_with_factor
        retryable_error = RetryableError.new

        authorizer_sequence = sequence("authorizer")
        @authorizer.expects(:perform).with(@authzd_request, {'__timeout_factor__' => 1}).raises(retryable_error).in_sequence(authorizer_sequence)
        @authorizer.expects(:perform).with(@authzd_request, {'__timeout_factor__' => 2}).raises(retryable_error).in_sequence(authorizer_sequence)
        @authorizer.expects(:perform).with(@authzd_request, {'__timeout_factor__' => 3}).raises(retryable_error).in_sequence(authorizer_sequence)

        options = {
            max_attempts: 3,
            retryable_errors: [RetryableError, AnotherRetryableError],
            retry_factor: true,
        }
        @middleware = Middleware::Retry.new(**options).tap do |middleware|
          middleware.request = @authorizer
        end

        assert_raises(RetryableError)  do
          @middleware.perform(@authzd_request)
        end
      end
    end
  end
end
