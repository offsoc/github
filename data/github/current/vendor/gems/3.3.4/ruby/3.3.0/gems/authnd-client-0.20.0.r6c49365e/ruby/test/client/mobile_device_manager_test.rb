# frozen_string_literal: true

require_relative "../test_helper"

module Authnd
  module Client
    class MobileDeviceManagerTest < Minitest::Test
      include ServiceClientTestHelpers

      def test_initialize_with_string
        ex = assert_raises ArgumentError do
          Authnd::Client::MobileDeviceManager.new("not_a_faraday_connection", catalog_service: TEST_CATALOG_SERVICE)
        end
        assert_equal "connection is not a Faraday::Connection", ex.message
      end

      def test_register_device_key_requires_valid_type
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:notvalid, 1, 2, "", "", "", false, "")
        end
        assert_equal "type must be :auth or :recovery", ex.message
      end

      def test_register_device_key_requires_user_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, "not_an_integer", 2, "", "", "", false, "")
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_register_device_key_requires_oauth_access_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, "not_an_integer", "", "", "", false, "")
        end
        assert_equal "oauth_access_id must be an integer", ex.message
      end

      def test_register_device_key_requires_device_name_as_non_empty_string
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, 3, "", "", false, "")
        end
        assert_equal "device_name must be a string", ex.message
      end

      def test_register_device_key_requires_device_model_as_non_empty_string
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, "deviceName", 3, "", false, "")
        end
        assert_equal "device_model must be a string", ex.message
      end

      def test_register_device_key_requires_device_os_as_non_empty_string
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, "deviceName", "deviceModel", 3, false, "")
        end
        assert_equal "device_os must be a non empty string", ex.message

        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, "deviceName", "deviceModel", "", false, "")
        end
        assert_equal "device_os must be a non empty string", ex.message
      end

      def test_register_device_key_requires_is_hardware_backed_as_boolean
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, "deviceName", "deviceModel", "deviceOs", "notABool", "")
        end
        assert_equal "is_hardware_backed must be a boolean", ex.message
      end

      def test_register_device_key_requires_public_key_as_non_empty_string
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, "deviceName", "deviceModel", "deviceOs", false, 1)
        end
        assert_equal "public_key must be a non empty string", ex.message

        ex = assert_raises ArgumentError do
          mobile_device_manager.register_device_key(:auth, 1, 2, "deviceName", "deviceModel", "deviceOs", false, "")
        end
        assert_equal "public_key must be a non empty string", ex.message
      end

      def test_register_device_key_forwards_auth_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          auth_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "deviceName",
            device_model: "deviceModel",
            device_os: "deviceOs",
            is_hardware_backed: false,
            public_key: "aPubKey",
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RegisterDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.register_device_key(:auth, 456, 789, "deviceName", "deviceModel", "deviceOs", false, "aPubKey")
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_register_device_key_forwards_auth_request_to_twirp_nil_device_details
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          auth_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "",
            device_model: "",
            device_os: "deviceOs",
            is_hardware_backed: false,
            public_key: "aPubKey",
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RegisterDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.register_device_key(:auth, 456, 789, nil, nil, "deviceOs", false, "aPubKey")
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_register_device_key_forwards_auth_request_to_twirp_with_verification
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          auth_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "deviceName",
            device_model: "deviceModel",
            device_os: "deviceOs",
            is_hardware_backed: false,
            public_key: "aPubKey",
            public_key_verification_signature: "aSig",
            public_key_verification_message: "aMsg",
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RegisterDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.register_device_key(:auth, 456, 789, "deviceName", "deviceModel", "deviceOs", false, "aPubKey", public_key_verification_signature: "aSig", public_key_verification_message: "aMsg")
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_register_device_key_forwards_recovery_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          recovery_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "deviceName",
            device_model: "deviceModel",
            device_os: "deviceOs",
            is_hardware_backed: false,
            public_key: "aPubKey",
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RegisterDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.register_device_key(:recovery, 456, 789, "deviceName", "deviceModel", "deviceOs", false, "aPubKey")
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_register_device_key_forwards_recovery_request_to_twirp_with_verification
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          recovery_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "deviceName",
            device_model: "deviceModel",
            device_os: "deviceOs",
            is_hardware_backed: false,
            public_key: "aPubKey",
            public_key_verification_signature: "aSig",
            public_key_verification_message: "aMsg",
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RegisterDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.register_device_key(:recovery, 456, 789, "deviceName", "deviceModel", "deviceOs", false, "aPubKey", public_key_verification_signature: "aSig", public_key_verification_message: "aMsg")
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_register_device_key_forwards_request_to_twirp_with_hardware_backed_device
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          auth_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "deviceName",
            device_model: "deviceModel",
            device_os: "deviceOs",
            is_hardware_backed: true,
            public_key: "aPubKey",
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RegisterDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.register_device_key(:auth, 456, 789, "deviceName", "deviceModel", "deviceOs", true, "aPubKey")
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_register_device_key_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RegisterDeviceKeyRequest.new(
          auth_key_request: Authnd::Proto::DeviceKeyRequest.new(
            user_id: 456,
            oauth_access_id: 789,
            device_name: "deviceName",
            device_model: "deviceModel",
            device_os: "deviceOs",
            is_hardware_backed: true,
            public_key: "aPubKey",
          ),
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :register_device_key, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.register_device_key(:auth, 456, 789, "deviceName", "deviceModel", "deviceOs", true, "aPubKey")
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_revoke_device_auth_key_by_oauth_access_id_requires_oauth_access_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.revoke_device_auth_key_by_oauth_access_id("not_an_integer")
        end
        assert_equal "oauth_access_id must be an integer", ex.message
      end

      def test_revoke_device_auth_key_by_oauth_access_id_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RevokeDeviceKeyRequest.new(
          revoke_auth_key_request: Authnd::Proto::RevokeDeviceAuthKeyRequest.new(
            oauth_access_id: 1234,
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RevokeDeviceKeyResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :revoke_device_key, expected_req, expected_resp

        actual_resp = mobile_device_manager.revoke_device_auth_key_by_oauth_access_id(1234)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_revoke_device_auth_key_by_oauth_access_id_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RevokeDeviceKeyRequest.new(
          revoke_auth_key_request: Authnd::Proto::RevokeDeviceAuthKeyRequest.new(
            oauth_access_id: 1234,
          ),
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :revoke_device_key, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.revoke_device_auth_key_by_oauth_access_id(1234)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_revoke_device_keys_by_user_id_requires_user_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.revoke_device_keys_by_user_id("not_an_integer")
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_revoke_device_keys_by_oauth_access_ids_requires_array_of_integers
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.revoke_device_keys_by_oauth_access_ids(["not_an_integer"])
        end
        assert_equal "oauth_access_ids must be an array of integers", ex.message
      end

      def test_revoke_device_keys_by_ids_requires_array_of_integers
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.revoke_device_keys_by_ids(["not_an_integer"])
        end
        assert_equal "ids must be an array of integers", ex.message
      end

      def test_revoke_device_keys_by_user_id_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_auth_keys_request: Authnd::Proto::RevokeDeviceAuthKeysRequest.new(
            user_id: 123,
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RevokeDeviceKeysResponse.new(result: :RESULT_SUCCESS), nil)

        stub_twirp_client mobile_device_manager, :revoke_device_keys, expected_req, expected_resp

        actual_resp = mobile_device_manager.revoke_device_keys_by_user_id(123)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal 0, actual_resp.oauth_access_ids.length
      end

      def test_revoke_device_keys_by_oauth_access_ids_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)

        expected_req = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_all_device_keys_by_oauth_accesses_request: Authnd::Proto::RevokeAllDeviceKeysByOauthAccessesRequest.new(
            oauth_access_ids: [123],
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RevokeDeviceKeysResponse.new(result: :RESULT_SUCCESS), nil)

        stub_twirp_client mobile_device_manager, :revoke_device_keys, expected_req, expected_resp

        actual_resp = mobile_device_manager.revoke_device_keys_by_oauth_access_ids([123])
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_revoke_device_keys_by_ids_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)

        expected_req = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_all_device_keys_by_ids_request: Authnd::Proto::RevokeAllDeviceKeysByIdsRequest.new(
            ids: [123],
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RevokeDeviceKeysResponse.new(result: :RESULT_SUCCESS), nil)

        stub_twirp_client mobile_device_manager, :revoke_device_keys, expected_req, expected_resp

        actual_resp = mobile_device_manager.revoke_device_keys_by_ids([123])
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_revoke_device_keys_by_user_id_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_auth_keys_request: Authnd::Proto::RevokeDeviceAuthKeysRequest.new(
            user_id: 123,
          ),
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :revoke_device_keys, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.revoke_device_keys_by_user_id(123)
        end

        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_request_device_auth_requires_user_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.request_device_auth("not_an_integer")
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_request_device_auth_requires_skip_challenge_as_bool
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.request_device_auth(1, skip_challenge: "not_a_bool")
        end
        assert_equal "skip_challenge must be a boolean", ex.message
      end

      def test_request_device_auth_with_no_type
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RequestDeviceAuthRequest.new(
          user_id: 123,
          skip_challenge: false,
          type: "2fa_login",
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RequestDeviceAuthResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :request_device_auth, expected_req, expected_resp

        actual_resp = mobile_device_manager.request_device_auth(123, skip_challenge: false)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_request_device_auth_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RequestDeviceAuthRequest.new(
          user_id: 123,
          skip_challenge: false,
          type: "2fa_login",
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RequestDeviceAuthResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :request_device_auth, expected_req, expected_resp

        actual_resp = mobile_device_manager.request_device_auth(123)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_request_device_auth_forwards_request_to_twirp_with_skip_challenge
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RequestDeviceAuthRequest.new(
          user_id: 123,
          skip_challenge: true,
          type: "2fa_login",
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::RequestDeviceAuthResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :request_device_auth, expected_req, expected_resp

        actual_resp = mobile_device_manager.request_device_auth(123, skip_challenge: true)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_request_device_auth_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::RequestDeviceAuthRequest.new(
          user_id: 123,
          skip_challenge: false,
          type: "2fa_login",
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :request_device_auth, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.request_device_auth(123)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_get_device_auth_status_requires_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.get_device_auth_status("not_an_integer", 1)
        end
        assert_equal "id must be an integer", ex.message
      end

      def test_get_device_auth_status_requires_user_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.get_device_auth_status(1, "not_an_integer")
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_get_device_auth_status_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::GetDeviceAuthStatusRequest.new(
          id: 123,
          user_id: 456,
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::GetDeviceAuthStatusResponse.new(result: :RESULT_SUCCESS, status: :STATUS_ACTIVE), nil)
        stub_twirp_client mobile_device_manager, :get_device_auth_status, expected_req, expected_resp

        actual_resp = mobile_device_manager.get_device_auth_status(123, 456)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal :STATUS_ACTIVE, actual_resp.status
      end

      def test_get_device_auth_status_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::GetDeviceAuthStatusRequest.new(
          id: 123,
          user_id: 456,
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :get_device_auth_status, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.get_device_auth_status(123, 456)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_find_active_device_auth_requires_user_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.find_active_device_auth("not_an_integer", 1)
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_find_active_device_auth_requires_oauth_access_id_as_integer
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.find_active_device_auth(1, "not_an_integer")
        end
        assert_equal "oauth_access_id must be an integer", ex.message
      end

      def test_find_active_device_auth_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::FindActiveDeviceAuthRequest.new(
          user_id: 123,
          oauth_access_id: 456,
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::FindActiveDeviceAuthResponse.new(result: :RESULT_SUCCESS, payload: "aPayload", challenge_required: true, type: "2fa_login"), nil)

        stub_twirp_client mobile_device_manager, :find_active_device_auth, expected_req, expected_resp
        actual_resp = mobile_device_manager.find_active_device_auth(123, 456)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal "aPayload", actual_resp.payload
        assert actual_resp.challenge_required
        assert_equal "2fa_login", actual_resp.type
      end

      def test_find_active_device_auth_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::FindActiveDeviceAuthRequest.new(
          user_id: 123,
          oauth_access_id: 456,
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :find_active_device_auth, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.find_active_device_auth(123, 456)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_approve_device_auth_requires_auth_request_id
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.approve_device_auth("not_int", 2, 3, "sig", 1)
        end
        assert_equal "auth_request_id must be an integer", ex.message
      end

      def test_approve_device_auth_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::CompleteDeviceAuthRequest.new(
          approve: Authnd::Proto::CompleteDeviceAuthMessage.new(
            auth_request_id: 1,
            user_id: 2,
            oauth_access_id: 3,
            signature: "sig",
            signature_version: 1,
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::CompleteDeviceAuthResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :complete_device_auth, expected_req, expected_resp

        actual_resp = mobile_device_manager.approve_device_auth(1, 2, 3, "sig", 1)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_approve_device_auth_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::CompleteDeviceAuthRequest.new(
          approve: Authnd::Proto::CompleteDeviceAuthMessage.new(
            auth_request_id: 1,
            user_id: 2,
            oauth_access_id: 3,
            signature: "sig",
            signature_version: 1,
          ),
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :complete_device_auth, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.approve_device_auth(1, 2, 3, "sig", 1)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_reject_device_auth_requires_auth_request_id
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.reject_device_auth("not_int", 2, 3)
        end
        assert_equal "auth_request_id must be an integer", ex.message
      end

      def test_reject_device_auth_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::CompleteDeviceAuthRequest.new(
          reject: Authnd::Proto::CompleteDeviceAuthMessage.new(
            auth_request_id: 1,
            user_id: 2,
            oauth_access_id: 3,
            signature: nil,
            signature_version: nil,
          ),
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::CompleteDeviceAuthResponse.new(result: :RESULT_SUCCESS), nil)
        stub_twirp_client mobile_device_manager, :complete_device_auth, expected_req, expected_resp

        actual_resp = mobile_device_manager.reject_device_auth(1, 2, 3)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
      end

      def test_reject_device_auth_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::CompleteDeviceAuthRequest.new(
          reject: Authnd::Proto::CompleteDeviceAuthMessage.new(
            auth_request_id: 1,
            user_id: 2,
            oauth_access_id: 3,
            signature: nil,
            signature_version: nil,
          ),
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :complete_device_auth, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.reject_device_auth(1, 2, 3)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_find_device_auth_key_registrations_requires_user_id
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.find_device_auth_key_registrations(nil)
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_find_device_auth_key_registrations_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::FindDeviceKeyRegistrationsRequest.new(
          auth_registrations_request: Authnd::Proto::RegistrationsRequest.new(user_id: 123),
        )
        registration = Authnd::Proto::DeviceKeyRegistration.new(
          device_model: "model",
          device_os: "model",
          device_name: "name",
          id: 1,
        )
        expected_resp = Twirp::ClientResp.new(Authnd::Proto::FindDeviceKeyRegistrationsResponse.new(result: :RESULT_SUCCESS, registrations: [registration]), nil)
        stub_twirp_client mobile_device_manager, :find_device_key_registrations, expected_req, expected_resp

        actual_resp = mobile_device_manager.find_device_auth_key_registrations(123)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal registration, actual_resp.registrations[0]
      end

      def test_find_device_auth_key_registrations_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::FindDeviceKeyRegistrationsRequest.new(
          auth_registrations_request: Authnd::Proto::RegistrationsRequest.new(user_id: 123),
        )
        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :find_device_key_registrations, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.find_device_auth_key_registrations(123)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end

      def test_find_device_auth_key_registration_requires_user_id
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.find_device_auth_key_registration(nil, 1)
        end
        assert_equal "user_id must be an integer", ex.message
      end

      def test_find_device_auth_key_registration_requires_oauth_access_id
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        ex = assert_raises ArgumentError do
          mobile_device_manager.find_device_auth_key_registration(1, nil)
        end
        assert_equal "oauth_access_id must be an integer", ex.message
      end

      def test_find_device_auth_key_registration_forwards_request_to_twirp
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::FindDeviceKeyRegistrationRequest.new(
          auth_registration_request: Authnd::Proto::RegistrationRequest.new(user_id: 123, oauth_access_id: 456),
        )

        registration = Authnd::Proto::DeviceKeyRegistration.new(
          device_model: "model",
          device_os: "model",
          device_name: "name",
          id: 1,
        )

        expected_resp = Twirp::ClientResp.new(Authnd::Proto::FindDeviceKeyRegistrationResponse.new(result: :RESULT_SUCCESS, registration: registration), nil)
        stub_twirp_client mobile_device_manager, :find_device_key_registration, expected_req, expected_resp

        actual_resp = mobile_device_manager.find_device_auth_key_registration(123, 456)
        assert_predicate actual_resp, :success?
        assert_equal :RESULT_SUCCESS, actual_resp.result
        assert_equal registration, actual_resp.registration
      end

      def test_find_device_auth_key_registration_raises_on_twirp_error
        mobile_device_manager = Authnd::Client::MobileDeviceManager.new(test_connection, catalog_service: TEST_CATALOG_SERVICE)
        expected_req = Authnd::Proto::FindDeviceKeyRegistrationRequest.new(
          auth_registration_request: Authnd::Proto::RegistrationRequest.new(user_id: 123, oauth_access_id: 456),
        )

        expected_twerr = Twirp::Error.internal("test twirp error")
        expected_resp = Twirp::ClientResp.new(nil, expected_twerr)
        stub_twirp_client mobile_device_manager, :find_device_key_registration, expected_req, expected_resp

        ex = assert_raises Authnd::Proto::Error do
          mobile_device_manager.find_device_auth_key_registration(123, 456)
        end
        assert_equal "internal: test twirp error", ex.message
        assert_equal expected_twerr, ex.twirp_error
      end
    end
  end
end
