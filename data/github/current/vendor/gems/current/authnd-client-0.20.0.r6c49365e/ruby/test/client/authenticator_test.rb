# frozen_string_literal: true

require_relative "../test_helper"
require "json"

module Authnd
  module Client
    class AuthenticatorTest < Minitest::Test
      include ServiceClientTestHelpers

      RetryableError = Class.new(StandardError)

      def setup
        @empty_request = Authnd::Proto::AuthenticateRequest.new
        @mock_success_response = Twirp::ClientResp.new(
          Authnd::Proto::AuthenticateResponse.new(result: :RESULT_SUCCESS, attributes: []),
          nil,
        )
      end

      def test_initialize_with_string
        ex = assert_raises ArgumentError do
          Authnd::Client::Authenticator.new("not_a_faraday_connection", catalog_service: TEST_CATALOG_SERVICE)
        end
        assert_equal "connection is not a Faraday::Connection", ex.message
      end

      def test_authenticate_forwards_request_to_twirp
        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = @empty_request
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::AuthenticateResponse.new(result: :RESULT_FAILED_GENERIC), nil)
        stub_twirp_client authenticator, :authenticate, expected_req, expected_resp

        actual_resp = authenticator.authenticate(expected_req)
        assert_equal :RESULT_FAILED_GENERIC, actual_resp.result
        assert_empty actual_resp.attributes
        refute actual_resp.success?
      end

      def test_authenticate_returns_response_attributes
        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = @empty_request

        # response_unwrapping_test does a full set of tests on a variety of value types.
        attributes = [
          Authnd::Proto::Attribute.new(id: "actor.id", value: Authnd::Proto::Value.new(integer_value: 42)),
          Authnd::Proto::Attribute.new(id: "actor.login", value: Authnd::Proto::Value.new(string_value: "monalisa")),
        ]
        expected_resp = Twirp::ClientResp.new(
          Authnd::Proto::AuthenticateResponse.new(result: :RESULT_SUCCESS, attributes: attributes),
          nil,
        )
        stub_twirp_client authenticator, :authenticate, expected_req, expected_resp

        actual_resp = authenticator.authenticate(expected_req)
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_predicate actual_resp, :success?
        assert_equal 42, actual_resp.attributes.delete("actor.id")
        assert_equal "monalisa", actual_resp.attributes.delete("actor.login")
        assert_empty actual_resp.attributes
      end

      def test_authenticate_raises_on_twirp_error
        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = @empty_request
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client authenticator, :authenticate, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          authenticator.authenticate(expected_req)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_client_adds_request_hmac_to_request_when_providing_faraday_hmac_middleware
        hmac_key = "a-test-key"
        provided_hmac = nil

        test_connection = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: hmac_key
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345
          f.adapter :test do |stub|
            stub.post("/twirp/github.authentication.v0.Authenticator/Authenticate") do |env|
              provided_hmac = env.request_headers["Request-HMAC"]

              [500, {}, "test"]
            end
          end
        end

        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)

        assert_raises Authnd::Proto::Error do
          authenticator.authenticate(@empty_request)
        end

        refute_nil provided_hmac

        timestamp, hmac = provided_hmac.split(".")
        digest = OpenSSL::Digest.new("SHA256")
        expected_hmac = OpenSSL::HMAC.new(hmac_key, digest)
        expected_hmac << timestamp
        assert_equal expected_hmac.to_s, hmac
      end

      def test_authenticate_uses_provided_connection
        provided_creds = nil
        provided_catalog_service = nil
        provided_user_agent = nil
        expected_resp = Authnd::Proto::AuthenticateResponse.new(result: :RESULT_FAILED_CREDENTIAL_INVALID)
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.adapter :test do |stub|
            stub.post("/twirp/github.authentication.v0.Authenticator/Authenticate") do |env|
              req = Authnd::Proto::AuthenticateRequest.decode(env.body)
              provided_creds = req.credentials
              provided_catalog_service = env.request_headers["Catalog-Service"]
              provided_user_agent = env.request_headers["User-Agent"]
              [
                200,
                { "Content-Type" => "application/protobuf" },
                Authnd::Proto::AuthenticateResponse.encode(expected_resp),
              ]
            end
          end
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        resp = authenticator.authenticate(Authnd::Proto::AuthenticateRequest.new(credentials: Authnd::Proto::Credentials.ssh_key("ssh-rsa abc")))

        refute_predicate resp, :success?
        assert_equal :RESULT_FAILED_CREDENTIAL_INVALID, resp.result
        assert_equal "ssh-rsa abc", provided_creds.ssh_public_key.key
        assert_equal TEST_CATALOG_SERVICE, provided_catalog_service
        assert_equal "authnd-ruby/#{Authnd::VERSION}", provided_user_agent
      end

      def test_restores_faraday_timeout_on_factor
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 5
          f.options[:open_timeout] = 6
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        stub_twirp_client authenticator, :authenticate, @empty_request, @mock_success_response
        authenticator.authenticate(@empty_request, headers: { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 2 })
        assert_equal 5, conn.options[:timeout]
        assert_equal 6, conn.options[:open_timeout]
      end

      def test_timeout_factor_ignored_if_no_timeout
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL)
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        stub_twirp_client authenticator, :authenticate, @empty_request, @mock_success_response
        authenticator.authenticate(@empty_request, headers: { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 2 })
        assert_nil conn.options[:timeout]
        assert_nil conn.options[:open_timeout]
      end

      def test_removes_internal_metadata
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL)
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        headers = { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 2 }
        stub_twirp_client authenticator, :authenticate, @empty_request, @mock_success_response
        authenticator.authenticate(@empty_request, headers: headers)
        assert_empty headers
      end

      def test_restores_timeout_on_exception
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.adapter(:net_http)
          f.options[:timeout] = 5
          f.options[:open_timeout] = 6
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        Authnd::Proto::AuthenticatorClient
          .any_instance.expects(:authenticate)
          .raises(StandardError.new)
        assert_raises(StandardError) do
          authenticator.authenticate(@empty_request, headers: { Authnd::Client::Middleware::Retry::METADATA_TIMEOUT_FACTOR => 2 })
        end
        assert_equal 5, conn.options[:timeout]
        assert_equal 6, conn.options[:open_timeout]
      end

      # verify the timing middleware works as expected
      def test_timing
        test_instr = Authnd::Client::Middleware::Instrumenters::Noop

        # make sure the dimensions are correct
        # just make sure duration_ms exists - not need to assert against the actual value here
        dimensions_matcher = all_of(has_entries(middleware: "timing", operation: "request", method_name: "authenticate"), has_key(:duration_ms))
        test_instr.expects(:instrument).with("authnd.client.timing.request", dimensions_matcher).once

        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE) do |client|
          client.use :authenticate, with: [
            Authnd::Client::Middleware::Timing.new(instrumenter: test_instr),
          ]
        end
        expected_req = @empty_request
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::AuthenticateResponse.new(result: :RESULT_FAILED_GENERIC), nil)
        stub_twirp_client authenticator, :authenticate, expected_req, expected_resp

        actual_resp = authenticator.authenticate(expected_req)
        assert_equal :RESULT_FAILED_GENERIC, actual_resp.result
        assert_empty actual_resp.attributes
        refute actual_resp.success?
      end

      # verify the timing middleware works as expected when it's combined with retry middleware
      # (just as if we were implementing the client in dotcom, for example - https://cs.github.com/?q=client.use%20%3Aauthenticate%20repo%3Agithub%2Fgithub&scopeName=All%20repos&scope=)
      def test_timing_with_retry
        test_instr = Authnd::Client::Middleware::Instrumenters::Noop

        # make sure the dimensions are correct
        # just make sure duration_ms exists - not need to assert against the actual value here
        timing_dimensions_matcher = all_of(has_entries(middleware: "timing", operation: "request", method_name: "authenticate"), has_key(:duration_ms))
        test_instr.expects(:instrument).with("authnd.client.timing.request", timing_dimensions_matcher).once
        retry_dimensions_matcher = all_of(middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticate")
        test_instr.expects(:instrument).with("authnd.client.retry.tried", retry_dimensions_matcher).once
        retry_dimensions_matcher = all_of(middleware: "retry", operation: "succeeded", attempt: 1, method_name: "authenticate")
        test_instr.expects(:instrument).with("authnd.client.retry.succeeded", retry_dimensions_matcher).once

        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE) do |client|
          client.use :authenticate, with: [
            Authnd::Client::Middleware::Timing.new(instrumenter: test_instr),
            Authnd::Client::Middleware::Retry.new(instrumenter: test_instr),
          ]
        end
        expected_req = @empty_request
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::AuthenticateResponse.new(result: :RESULT_FAILED_GENERIC), nil)
        stub_twirp_client authenticator, :authenticate, expected_req, expected_resp

        actual_resp = authenticator.authenticate(expected_req)
        assert_equal :RESULT_FAILED_GENERIC, actual_resp.result
        assert_empty actual_resp.attributes
        refute actual_resp.success?
      end

      def test_timing_with_retry_raises
        test_instr = Authnd::Client::Middleware::Instrumenters::Noop

        attempts = 3
        retry_options = {
          max_attempts: attempts,
          retryable_errors: [StandardError],
        }
        authenticator = Authnd::Client::Authenticator.new(test_connection, catalog_service: TEST_CATALOG_SERVICE) do |client|
          client.use :authenticate, with: [
            Authnd::Client::Middleware::Timing.new(instrumenter: test_instr),
            Authnd::Client::Middleware::Retry.new(instrumenter: test_instr, **retry_options),
          ]
        end

        instrumentation_sequence = sequence("instrumentation")

        expected_req = @empty_request
        raises_with = StandardError.new
        # expect a call to the twirp client for each attempt, and raise an error for each
        (1..attempts).each do |attempt|
          stub_twirp_client_with_raise authenticator, :authenticate, expected_req, raises_with

          retry_dimensions_matcher = all_of(middleware: "retry", operation: "tried", attempt: attempt, method_name: "authenticate")
          test_instr.expects(:instrument).with("authnd.client.retry.tried", retry_dimensions_matcher).once.in_sequence(instrumentation_sequence)
        end
        retry_dimensions_matcher = all_of(middleware: "retry", operation: "failed", attempt: attempts, method_name: "authenticate", error: raises_with)
        test_instr.expects(:instrument).with("authnd.client.retry.failed", retry_dimensions_matcher).once
        timing_dimensions_matcher = all_of(has_entries(middleware: "timing", operation: "request", method_name: "authenticate", error: raises_with), has_key(:duration_ms))
        test_instr.expects(:instrument).with("authnd.client.timing.request", timing_dimensions_matcher).once.in_sequence(instrumentation_sequence)

        assert_raises(StandardError) do
          authenticator.authenticate(expected_req)
        end
      end

      def test_retry_request_hedging
        allowed_attempts = 20
        # purposefully use different values for "timeout" and "open_timeout" for coverage across the two options
        initial_connection_timeout = 0.01
        initial_connection_open_timeout = 0.02
        requests = []

        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.adapter :test do |stub|
            stub.post("/twirp/github.authentication.v0.Authenticator/Authenticate") do |env|
              requests.append(env.request)
              [500, {}, "authnd-error"]
            end
          end
          f.options[:timeout] = initial_connection_timeout
          f.options[:open_timeout] = initial_connection_open_timeout
        end
        retry_options = {
          max_attempts: allowed_attempts,
          retryable_errors: [Authnd::Proto::Error],
          retry_factor: true,
        }
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE) do |a|
          a.use :authenticate, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop, **retry_options),
          ]
        end

        assert_raises Authnd::Proto::Error do
          authenticator.authenticate(@empty_request)
        end

        # restores the connection timeout options
        assert_equal initial_connection_timeout, conn.options[:timeout]
        assert_equal initial_connection_open_timeout, conn.options[:open_timeout]

        # timeout options should be extended multiplied by the request attempt
        assert_equal allowed_attempts, requests.length
        (1..allowed_attempts).each do |i|
          assert_equal initial_connection_timeout * i, requests[i - 1][:timeout]
          assert_equal initial_connection_open_timeout * i, requests[i - 1][:open_timeout]
        end
      end

      def test_retry_request_hedging_noop_if_no_timeout_options
        allowed_attempts = 3
        requests = []

        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.adapter :test do |stub|
            stub.post("/twirp/github.authentication.v0.Authenticator/Authenticate") do |env|
              requests.append(env.request)
              [500, {}, "authnd-error"]
            end
          end
        end
        retry_options = {
          max_attempts: allowed_attempts,
          retryable_errors: [Authnd::Proto::Error],
          retry_factor: true,
        }
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE) do |a|
          a.use :authenticate, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop, **retry_options),
          ]
        end

        assert_raises Authnd::Proto::Error do
          authenticator.authenticate(@empty_request)
        end

        # no timeout options should exist on the connection
        refute conn.options[:timeout]
        refute conn.options[:open_timeout]

        # no timeout options should exist on any of the collected requests
        assert_equal allowed_attempts, requests.length
        (1..allowed_attempts).each do |i|
          refute requests[i - 1][:timeout]
          refute requests[i - 1][:open_timeout]
        end
      end
    end
  end
end
