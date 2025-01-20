# frozen_string_literal: true

require_relative "../authnd_server_helper"

module Authnd
  module Client
    class MobileDeviceManagerTest < Minitest::Test
      SERVER_ADDR = "127.0.0.1:18081"
      TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"
      NOT_TWIRP_URL = "http://#{SERVER_ADDR}"
      UNREACHABLE_TWIRP_URL = "http://127.0.0.1:8001/twirp/"
      TEST_CATALOG_SERVICE = "github/test-service"

      @http_server = start_server(SERVER_ADDR)

      Minitest.after_run do
        stop_server
      end

      # The server we start has no database connected, so we just test a simple error case.
      def mobile_device_manager
        @mobile_device_manager ||= begin
          conn = Faraday.new(url: TWIRP_ADDR) do |f|
            f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
            f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345
            f.adapter(:net_http)
          end
          Authnd::Client::MobileDeviceManager.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        end
      end

      def test_register_device_auth_key_with_error
        # The server we start has no database connected, so we just test a simple error case (invalid public_key format for argument).
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.register_device_key(:auth, 456, 789, "deviceName", "deviceModel", "iOS", true, "aPubKey")
        end
        assert_equal "invalid_argument: PublicKey Could not parse public key to create fingerprint", ex.message
        assert_equal :invalid_argument, ex.twirp_error.code
      end

      def test_register_device_recovery_key_with_error
        # The server we start has no database connected, so we just test a simple error case (no verification args for recovery key).
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.register_device_key(:recovery, 456, 789, "deviceName", "deviceModel", "iOS", true, "aPubKey")
        end
        assert_equal "invalid_argument: PublicKeyVerificationSignature is required", ex.message
        assert_equal :invalid_argument, ex.twirp_error.code
      end

      def test_revoke_device_auth_key_by_oauth_access_id_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.revoke_device_auth_key_by_oauth_access_id(0)
        end
        assert_equal "invalid_argument: OauthAccessId is required", ex.message
        assert_equal :invalid_argument, ex.twirp_error.code
      end

      def test_revoke_device_keys_by_user_id_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.revoke_device_keys_by_user_id(1)
        end
        assert_equal :internal, ex.twirp_error.code
      end

      def test_request_device_auth_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.request_device_auth(1)
        end
        assert_equal :internal, ex.twirp_error.code
      end

      def test_get_device_auth_status_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.get_device_auth_status(1, 2)
        end
        assert_equal :internal, ex.twirp_error.code
      end

      def test_find_active_device_auth_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.find_active_device_auth(1, 2)
        end
        assert_equal :internal, ex.twirp_error.code
      end

      def test_approve_device_auth_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.approve_device_auth(1, 2, 3, "sig", 1)
        end
        assert_equal :internal, ex.twirp_error.code
      end

      def test_reject_device_auth_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.reject_device_auth(1, 2, 3)
        end
        assert_equal :internal, ex.twirp_error.code
      end

      def test_find_device_auth_key_registrations_with_error
        # The server we start has no database connected, so we just test a simple error case.
        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.find_device_auth_key_registrations(1)
        end
        assert_equal :internal, ex.twirp_error.code
      end
    end
  end
end
