# frozen_string_literal: true

require_relative "../authnd_server_helper"

module Authnd
  module Client
    class CredentialManagerTest < Minitest::Test
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
      def credential_manager
        @credential_manager ||= begin
          conn = Faraday.new(url: TWIRP_ADDR) do |f|
            f.use Authnd::Client::FaradayMiddleware::HMACAuth, hmac_key: "octocat"
            f.use Authnd::Client::FaradayMiddleware::TenantContext, tenant_id: 12_345
            f.adapter(:net_http)
          end
          Authnd::Client::CredentialManager.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        end
      end

      def test_issue_token_with_error
        resp = credential_manager.issue_token("ProgrammaticAccessToken", {})
        assert_equal :RESULT_INVALID_ATTRIBUTES, resp.result
        # The server we start has no database connected, so we just test a simple error case.
      end

      def test_revoke_unsupported_credentials_with_error
        creds = [
          Authnd::Proto::Credentials.access_token("gh0_c0ffeecafe"),
        ]
        resp = credential_manager.revoke_credentials("dont want", creds)
        resp.responses.each do |cred|
          assert_equal :RESULT_FAILED_NOT_SUPPORTED, cred.result
        end
        # The server we start has no database connected, so we just test a simple error case.
      end

      def test_revoke_credentials_with_error
        creds = [
          Authnd::Proto::Credentials.access_token("gh1_c0ffeecafe"),
        ]
        resp = credential_manager.revoke_credentials("dont want", creds)
        resp.responses.each do |cred|
          assert_equal :RESULT_FAILED_CREDENTIAL_INVALID, cred.result
        end
        # The server we start has no database connected, so we just test a simple error case.
      end

      def test_revoke_credentials_by_id_with_error
        resp = credential_manager.revoke_credentials_by_id("dont want", "ProgrammaticAccessToken", [])
        resp.responses.each do |cred|
          assert_equal :RESULT_NOT_FOUND, cred.result
        end
        # The server we start has no database connected, so we just test a simple error case.
      end

      def test_find_credential_with_error
        resp = credential_manager.find_credentials("ProgrammaticAccessToken", {})
        assert_equal :RESULT_FAILED_INVALID_ATTRIBUTES, resp.result
        # The server we start has no database connected, so we just test a simple error case.
      end

      def test_verify_credentials_with_error
        creds = [
          Authnd::Proto::Credentials.access_token("gh0_c0ffeecafe"),
        ]
        resp = credential_manager.verify_credentials(creds)
        resp.responses.each do |cred|
          assert_equal false, cred.is_verified
        end
        # The server we start has no database connected, so we just test a simple error case.
      end
    end
  end
end
