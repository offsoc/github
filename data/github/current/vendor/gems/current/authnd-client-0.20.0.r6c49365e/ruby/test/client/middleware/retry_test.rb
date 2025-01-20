# frozen_string_literal: true

module Authnd
  module Client
    module Middleware
      class RetryTest < Minitest::Test
        AuthenticatorStub      = Class.new
        RetryableError         = Class.new(StandardError)
        AnotherRetryableError  = Class.new(StandardError)
        NonRetryableError      = Class.new(StandardError)
        TestInstrumenter       = Authnd::Client::Middleware::Instrumenters::Noop

        def setup
          @empty_authnd_request = Authnd::Proto::AuthenticateRequest.new
          @authenticator = AuthenticatorStub.new

          retry_middleware_options = {
            max_attempts: 3,
            retryable_errors: [RetryableError, AnotherRetryableError],
          }
          @middleware = Middleware::Retry.new(**retry_middleware_options).tap do |middleware|
            # tapping into this middleware to mimic the behavior of the Decoratable::Adapter
            middleware.request = @authenticator
            middleware.original_method_name = "authenticator"
          end
          @mock_authnd_success_response = Twirp::ClientResp.new(
            Authnd::Proto::AuthenticateResponse.new(result: :RESULT_SUCCESS, attributes: []),
            nil,
          )
        end

        def test_retry_max_attempts_and_bubble_up_error
          retryable_error = RetryableError.new
          @authenticator.expects(:perform).times(3).with(@empty_authnd_request, headers: {}).raises(retryable_error)

          instrumentation_sequence = sequence("instrumentation")
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 2, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 3, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.failed", middleware: "retry", operation: "failed", attempt: 3, method_name: "authenticator", error: retryable_error).in_sequence(instrumentation_sequence)

          assert_raises(RetryableError) do
            @middleware.perform(@empty_authnd_request)
          end
        end

        def test_retry_and_on_success_return_result
          fail_and_succeed = sequence("fail and succeed")
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: {}).in_sequence(fail_and_succeed).raises(AnotherRetryableError)
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: {}).in_sequence(fail_and_succeed).returns(@mock_authnd_success_response)

          instrumentation_sequence = sequence("instrumentation")
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 2, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.succeeded", middleware: "retry", operation: "succeeded", attempt: 2, method_name: "authenticator").in_sequence(instrumentation_sequence)

          response = @middleware.perform(@empty_authnd_request)
          assert_nil response.error
          refute_nil response.data
          assert_equal :RESULT_SUCCESS, response.data.result
        end

        def test_doesnt_retry_if_error_isnt_retryable
          error = NonRetryableError.new
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: {}).once.raises(error)

          instrumentation_sequence = sequence("instrumentation")
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.failed", middleware: "retry", operation: "failed", attempt: 1, method_name: "authenticator", error: error).in_sequence(instrumentation_sequence)

          assert_raises(NonRetryableError)  do
            @middleware.perform(@empty_authnd_request)
          end
        end

        def test_wait_between_retries_if_option_provided
          fail_and_succeed = sequence("fail and succeed")
          retryable_error = RetryableError.new
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: {}).in_sequence(fail_and_succeed).raises(retryable_error)
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: {}).in_sequence(fail_and_succeed).returns(@mock_authnd_success_response)

          @middleware = Middleware::Retry.new(wait_seconds: 0.1).tap do |middleware|
            # tapping into this middleware to mimic the behavior of the Decoratable::Adapter
            middleware.request = @authenticator
            middleware.original_method_name = "authenticator"
          end
          @middleware.stubs(:sleep).once.with(0.1)

          instrumentation_sequence = sequence("instrumentation")
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.waited", middleware: "retry", operation: "waited", attempt: 1, method_name: "authenticator", wait_seconds: 0.1, error: retryable_error).in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 2, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.succeeded", middleware: "retry", operation: "succeeded", attempt: 2, method_name: "authenticator").in_sequence(instrumentation_sequence)

          response = @middleware.perform(@empty_authnd_request)
          assert_nil response.error
          refute_nil response.data
          assert_equal :RESULT_SUCCESS, response.data.result
        end

        def test_max_retries_w_wait
          retryable_error = RetryableError.new
          @middleware = Middleware::Retry.new(wait_seconds: 0.1, max_attempts: 3).tap do |middleware|
            # tapping into this middleware to mimic the behavior of the Decoratable::Adapter
            middleware.request = @authenticator
            middleware.original_method_name = "authenticator"
          end
          @middleware.stubs(:sleep).times(2).with(0.1)
          @authenticator.expects(:perform).times(3).with(@empty_authnd_request, headers: {}).raises(retryable_error)

          instrumentation_sequence = sequence("instrumentation")
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 2, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).with("authnd.client.retry.tried", middleware: "retry", operation: "tried", attempt: 3, method_name: "authenticator").in_sequence(instrumentation_sequence)
          TestInstrumenter.expects(:instrument).in_sequence(instrumentation_sequence)

          assert_raises(RetryableError) do
            @middleware.perform(@empty_authnd_request)
          end
        end

        def test_retry_with_factor
          retryable_error = RetryableError.new

          instrumentation_sequence = sequence("instrumentation")
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 1 }).raises(retryable_error).in_sequence(instrumentation_sequence)
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 2 }).raises(retryable_error).in_sequence(instrumentation_sequence)
          @authenticator.expects(:perform).with(@empty_authnd_request, headers: { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 3 }).raises(retryable_error).in_sequence(instrumentation_sequence)

          options = {
            max_attempts: 3,
            retryable_errors: [RetryableError, AnotherRetryableError],
            retry_factor: true,
          }
          @middleware = Middleware::Retry.new(**options).tap do |middleware|
            # tapping into this middleware to mimic the behavior of the Decoratable::Adapter
            middleware.request = @authenticator
            middleware.original_method_name = "authenticator"
          end

          assert_raises(RetryableError) do
            @middleware.perform(@empty_authnd_request)
          end
        end
      end
    end
  end
end
