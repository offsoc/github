# frozen_string_literal: true

require_relative "../authnd_server_helper"

module Authnd
  module Client
    class AuthenticatorIntegrationTest < Minitest::Test
      SERVER_ADDR = "127.0.0.1:18081"
      TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"
      NOT_TWIRP_URL = "http://#{SERVER_ADDR}"
      UNREACHABLE_TWIRP_URL = "http://127.0.0.1:8001/twirp/"
      TEST_CATALOG_SERVICE = "github/test-service"

      @http_server = start_server(SERVER_ADDR)

      Minitest.after_run do
        stop_server
      end

      def test_bad_route_error
        conn = Faraday.new(url: NOT_TWIRP_URL) do |f|
          f.adapter(:net_http)
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)

        ex = assert_raises Authnd::Proto::Error do
          authenticator.authenticate(Authnd::Proto::AuthenticateRequest.new)
        end

        assert_equal "bad_route: bad_route", ex.message
        assert_equal :bad_route, ex.twirp_error.code
      end

      def test_authenticate_no_hmac
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.adapter(:net_http)
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        request = Authnd::Proto::AuthenticateRequest.new

        ex = assert_raises Authnd::Proto::Error do
          authenticator.authenticate(request)
        end
        assert_equal "unauthenticated: no Request-HMAC provided", ex.message
        assert_equal :unauthenticated, ex.twirp_error.code
      end

      def test_authenticate_bad_hmac
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "not_good"
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345, tenant_shortcode: "abcdef"
          f.adapter(:net_http)
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        request = Authnd::Proto::AuthenticateRequest.new

        ex = assert_raises Authnd::Proto::Error do
          authenticator.authenticate(request)
        end
        assert_match(/unauthenticated: HMAC .* is invalid/, ex.message)
        assert_equal :unauthenticated, ex.twirp_error.code
      end

      def test_authenticate_invalid_request
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345, tenant_shortcode: "abcdef"
          f.adapter(:net_http)
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        request = Authnd::Proto::AuthenticateRequest.new

        ex = assert_raises Authnd::Proto::Error do
          authenticator.authenticate(request)
        end
        assert_equal "invalid_argument: credentials is required", ex.message
        assert_equal :invalid_argument, ex.twirp_error.code
      end

      def test_all_middleware_smoke_test_for_authenticate
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345, tenant_shortcode: "abcdef"
          f.adapter(:net_http)
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE) do |a|
          a.use :authenticate, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop),
          ]
        end
        request = Authnd::Proto::AuthenticateRequest.new

        # verify retries by expecting instrumentation triggered by the middleware
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 1, method_name: "authenticate"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 2, method_name: "authenticate"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.failed", has_entries(middleware: "retry", operation: "failed", attempt: 2, method_name: "authenticate"))

        ex = assert_raises Authnd::Proto::Error do
          authenticator.authenticate(request)
        end
        assert_equal "invalid_argument: credentials is required", ex.message
        assert_equal :invalid_argument, ex.twirp_error.code
      end

      def test_all_middleware_smoke_test_for_credential_manager
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345, tenant_shortcode: "abcdef"
          f.adapter(:net_http)
        end
        credential_manager = Authnd::Client::CredentialManager.new(conn, catalog_service: TEST_CATALOG_SERVICE) do |client|
          client.use :find_credentials, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop),
          ]
        end

        # verify retries by expecting instrumentation triggered by the middleware
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 1, method_name: "find_credentials"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 2, method_name: "find_credentials"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.failed", has_entries(middleware: "retry", operation: "failed", attempt: 2, method_name: "find_credentials"))

        ex = assert_raises ArgumentError do
          credential_manager.find_credentials(1, { "actor.id" => "123" })
        end
        assert_equal "type must be a string", ex.message
      end

      def test_all_middleware_smoke_test_for_mobile_device_manager
        conn = Faraday.new(url: TWIRP_ADDR) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345, tenant_shortcode: "abcdef"
          f.adapter(:net_http)
        end
        mdm = Authnd::Client::MobileDeviceManager.new(conn, catalog_service: TEST_CATALOG_SERVICE) do |client|
          client.use :find_device_auth_key_registrations, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop),
          ]
          client.use :find_device_auth_key_registration, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop),
          ]
          client.use :get_device_auth_status, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop),
          ]
          client.use :find_active_device_auth, with: [
            Authnd::Client::Middleware::Retry.new(instrumenter: Authnd::Client::Middleware::Instrumenters::Noop),
          ]
        end

        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 1, method_name: "find_device_auth_key_registrations"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 2, method_name: "find_device_auth_key_registrations"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.failed", has_entries(middleware: "retry", operation: "failed", attempt: 2, method_name: "find_device_auth_key_registrations"))

        assert_raises Authnd::Proto::Error do
          mdm.find_device_auth_key_registrations(1)
        end

        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 1, method_name: "find_device_auth_key_registration"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 2, method_name: "find_device_auth_key_registration"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.failed", has_entries(middleware: "retry", operation: "failed", attempt: 2, method_name: "find_device_auth_key_registration"))
        assert_raises Authnd::Proto::Error do
          mdm.find_device_auth_key_registration(1, 2)
        end

        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 1, method_name: "get_device_auth_status"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 2, method_name: "get_device_auth_status"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.failed", has_entries(middleware: "retry", operation: "failed", attempt: 2, method_name: "get_device_auth_status"))
        assert_raises Authnd::Proto::Error do
          mdm.get_device_auth_status(1, 2)
        end

        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 1, method_name: "find_active_device_auth"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.tried", has_entries(middleware: "retry", operation: "tried", attempt: 2, method_name: "find_active_device_auth"))
        Authnd::Client::Middleware::Instrumenters::Noop.expects(:instrument).with("authnd.client.retry.failed", has_entries(middleware: "retry", operation: "failed", attempt: 2, method_name: "find_active_device_auth"))
        assert_raises Authnd::Proto::Error do
          mdm.find_active_device_auth(1, 2)
        end
      end

      def test_timeout_error
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
          f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345, tenant_shortcode: "abcdef"
          f.adapter(:net_http)
          f.options[:timeout] = 0.01
          f.options[:open_timeout] = 0.01
        end
        authenticator = Authnd::Client::Authenticator.new(conn, catalog_service: TEST_CATALOG_SERVICE)

        assert_raises Faraday::ConnectionFailed do
          authenticator.authenticate(Authnd::Proto::AuthenticateRequest.new)
        end
      end
    end
  end
end
