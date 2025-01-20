# frozen_string_literal: true

require_relative "../test_helper"

module Authnd
  module Client
    class CredentialManagerTest < Minitest::Test
      include ServiceClientTestHelpers

      def test_initialize_with_string
        ex = assert_raises ArgumentError do
          Authnd::Client::CredentialManager.new("not_a_faraday_connection", catalog_service: TEST_CATALOG_SERVICE)
        end
        assert_equal "connection is not a Faraday::Connection", ex.message
      end

      def test_issue_token_forwards_request_to_twirp
        credential_manager = Authnd::Client::CredentialManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::IssueTokenRequest.new(
          type: "test-token-type",
          attributes: [Authnd::Proto::Attribute.new(id: "actor.id", value: Authnd::Proto::Value.wrap("test-actor-id"))],
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::IssueTokenResponse.new(result: :RESULT_SUCCESS, token: "c0ffeecafe", token_id: 42), nil)
        stub_twirp_client credential_manager, :issue_token, expected_req, expected_resp

        actual_resp = credential_manager.issue_token("test-token-type", { "actor.id": "test-actor-id" })
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal "c0ffeecafe", actual_resp.token
        assert_equal 42, actual_resp.token_id
      end

      def test_issue_token_includes_expiry_time_if_provided
        time = Time.now

        credential_manager = Authnd::Client::CredentialManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::IssueTokenRequest.new(
          type: "test-token-type",
          attributes: [Authnd::Proto::Attribute.new(id: "actor.id", value: Authnd::Proto::Value.wrap("test-actor-id"))],
          expires_at_time: Google::Protobuf::Timestamp.new(seconds: time.utc.tv_sec),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::IssueTokenResponse.new(result: :RESULT_SUCCESS, token: "c0ffeecafe", token_id: 42), nil)
        stub_twirp_client credential_manager, :issue_token, expected_req, expected_resp

        actual_resp = credential_manager.issue_token("test-token-type", { "actor.id": "test-actor-id" }, expires_at: time)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal "c0ffeecafe", actual_resp.token
        assert_equal 42, actual_resp.token_id
      end

      def test_issue_token_raises_on_twirp_error
        credential_manager = Authnd::Client::CredentialManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::IssueTokenRequest.new(
          type: "test-token-type",
          attributes: [Authnd::Proto::Attribute.new(id: "actor.id", value: Authnd::Proto::Value.wrap("test-actor-id"))],
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client credential_manager, :issue_token, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          credential_manager.issue_token("test-token-type", { "actor.id": "test-actor-id" })
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
            stub.post("/twirp/github.authentication.v0.CredentialManager/IssueToken") do |env|
              provided_hmac = env.request_headers["Request-HMAC"]

              [500, {}, "test"]
            end
          end
        end

        service = Authnd::Client::CredentialManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)

        assert_raises Authnd::Proto::Error do
          service.issue_token("test-token-type", { "actor.id": "test-actor-id" })
        end

        refute_nil provided_hmac

        timestamp, hmac = provided_hmac.split(".")
        digest = OpenSSL::Digest.new("SHA256")
        expected_hmac = OpenSSL::HMAC.new(hmac_key, digest)
        expected_hmac << timestamp
        assert_equal expected_hmac.to_s, hmac
      end

      def test_issue_token_uses_provided_connection
        provided_req = nil
        provided_catalog_service = nil
        provided_user_agent = nil
        expected_resp = Authnd::Proto::IssueTokenResponse.new(result: :RESULT_SUCCESS, token: "c0ffeecafe", token_id: 42)
        conn = Faraday.new(url: UNREACHABLE_TWIRP_URL) do |f|
          f.adapter :test do |stub|
            stub.post("/twirp/github.authentication.v0.CredentialManager/IssueToken") do |env|
              provided_req = Authnd::Proto::IssueTokenRequest.decode(env.body)
              provided_catalog_service = env.request_headers["Catalog-Service"]
              provided_user_agent = env.request_headers["User-Agent"]
              [
                200,
                { "Content-Type" => "application/protobuf" },
                Authnd::Proto::IssueTokenResponse.encode(expected_resp),
              ]
            end
          end
        end
        service = Authnd::Client::CredentialManager.new(conn, catalog_service: TEST_CATALOG_SERVICE)
        resp = service.issue_token("test-token-type", { "actor.id": "test-actor-id" })

        assert_predicate resp, :success?
        assert_equal :RESULT_SUCCESS, resp.result
        assert_equal "c0ffeecafe", resp.token
        assert_equal 42, resp.token_id

        refute_nil provided_req
        assert_equal "test-token-type", provided_req.type
        assert_equal [Authnd::Proto::Attribute.new(id: "actor.id", value: Authnd::Proto::Value.wrap("test-actor-id"))], provided_req.attributes

        assert_equal TEST_CATALOG_SERVICE, provided_catalog_service
        assert_equal "authnd-ruby/#{Authnd::VERSION}", provided_user_agent
      end

      def test_verify_credentails_validates_candidates
        credential_manager = Authnd::Client::CredentialManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        assert_raises ArgumentError do
          credential_manager.verify_credentials("") # not an array
          credential_manager.verify_credentials([""])
        end
      end
    end
  end
end
