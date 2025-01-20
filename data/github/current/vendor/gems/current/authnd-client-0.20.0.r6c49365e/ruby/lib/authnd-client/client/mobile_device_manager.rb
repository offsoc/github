# frozen_string_literal: true

require_relative "./service_client_base"

require "google/protobuf/well_known_types"

module Authnd
  module Client
    class MobileDeviceManager < ServiceClientBase
      def register_device_key(
        type,
        user_id,
        oauth_access_id,
        device_name,
        device_model,
        device_os,
        is_hardware_backed,
        public_key,
        public_key_verification_signature: nil,
        public_key_verification_message: nil,
        headers: {}
      )
        # device name and model are not meant to be nil, but on some devices, this may be the case
        # we will allow the request to be made with an empty string so that the server can set a default
        device_name = "" if device_name.nil?
        device_model = "" if device_model.nil?

        raise ArgumentError, "type must be :auth or :recovery" unless %i[auth recovery].include?(type)
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)
        raise ArgumentError, "oauth_access_id must be an integer" unless oauth_access_id.is_a?(Integer)
        raise ArgumentError, "device_name must be a string" unless device_name.is_a?(String)
        raise ArgumentError, "device_model must be a string" unless device_model.is_a?(String)
        raise ArgumentError, "device_os must be a non empty string" unless device_os.is_a?(String) && !device_os.empty?
        raise ArgumentError, "is_hardware_backed must be a boolean" unless [true, false].include? is_hardware_backed
        raise ArgumentError, "public_key must be a non empty string" unless public_key.is_a?(String) && !public_key.empty?

        device_key_request = Authnd::Proto::DeviceKeyRequest.new(
          user_id: user_id,
          oauth_access_id: oauth_access_id,
          device_name: device_name,
          device_model: device_model,
          device_os: device_os,
          is_hardware_backed: is_hardware_backed,
          public_key: public_key,
          public_key_verification_signature: public_key_verification_signature,
          public_key_verification_message: public_key_verification_message,
        )
        request =
          if type == :auth
            Authnd::Proto::RegisterDeviceKeyRequest.new(
              auth_key_request: device_key_request,
            )
          else
            Authnd::Proto::RegisterDeviceKeyRequest.new(
              recovery_key_request: device_key_request,
            )
          end

        twirp_resp = @twirp_client.register_device_key(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def revoke_device_auth_key_by_oauth_access_id(oauth_access_id, headers: {})
        raise ArgumentError, "oauth_access_id must be an integer" unless oauth_access_id.is_a?(Integer)

        request = Authnd::Proto::RevokeDeviceKeyRequest.new(
          revoke_auth_key_request: Authnd::Proto::RevokeDeviceAuthKeyRequest.new(
            oauth_access_id: oauth_access_id,
          ),
        )
        twirp_resp = @twirp_client.revoke_device_key(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def revoke_device_keys_by_user_id(user_id, headers: {})
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)

        request = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_auth_keys_request: Authnd::Proto::RevokeDeviceAuthKeysRequest.new(
            user_id: user_id,
          ),
        )

        twirp_resp = @twirp_client.revoke_device_keys(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def revoke_device_keys_by_oauth_access_ids(oauth_access_ids, headers: {})
        # check that oauth access ids is an array of integers
        raise ArgumentError, "oauth_access_ids must be an array of integers" unless oauth_access_ids.is_a?(Array) && oauth_access_ids.all? { |id| id.is_a?(Integer) }

        request = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_all_device_keys_by_oauth_accesses_request: Authnd::Proto::RevokeAllDeviceKeysByOauthAccessesRequest.new(
            oauth_access_ids: oauth_access_ids,
          ),
        )

        twirp_resp = @twirp_client.revoke_device_keys(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def revoke_device_keys_by_ids(ids, headers: {})
        # check that ids is an array of integers
        raise ArgumentError, "ids must be an array of integers" unless ids.is_a?(Array) && ids.all? { |id| id.is_a?(Integer) }

        request = Authnd::Proto::RevokeDeviceKeysRequest.new(
          revoke_all_device_keys_by_ids_request: Authnd::Proto::RevokeAllDeviceKeysByIdsRequest.new(
            ids: ids,
          ),
        )

        twirp_resp = @twirp_client.revoke_device_keys(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def find_device_auth_key_registrations(user_id, headers: {})
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)

        body = Authnd::Proto::RegistrationsRequest.new(user_id: user_id)
        request = Authnd::Proto::FindDeviceKeyRegistrationsRequest.new(auth_registrations_request: body)
        twirp_resp = @twirp_client.find_device_key_registrations(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def find_device_auth_key_registration(user_id, oauth_access_id, headers: {})
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)
        raise ArgumentError, "oauth_access_id must be an integer" unless oauth_access_id.is_a?(Integer)

        body = Authnd::Proto::RegistrationRequest.new(user_id: user_id, oauth_access_id: oauth_access_id)
        request = Authnd::Proto::FindDeviceKeyRegistrationRequest.new(auth_registration_request: body)
        twirp_resp = @twirp_client.find_device_key_registration(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def request_device_auth(user_id, skip_challenge: false, type: "2fa_login", device_ip: nil, device_name: nil, headers: {})
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)
        raise ArgumentError, "skip_challenge must be a boolean" unless [true, false].include? skip_challenge

        request = Authnd::Proto::RequestDeviceAuthRequest.new(
          user_id: user_id,
          skip_challenge: skip_challenge,
          type: type,
          ip_address: device_ip,
          device_display_name: device_name,
        )
        twirp_resp = @twirp_client.request_device_auth(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def get_device_auth_status(id, user_id, headers: {})
        raise ArgumentError, "id must be an integer" unless id.is_a?(Integer)
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)

        request = Authnd::Proto::GetDeviceAuthStatusRequest.new(id: id, user_id: user_id)
        twirp_resp = @twirp_client.get_device_auth_status(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def find_active_device_auth(user_id, oauth_access_id, headers: {})
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)
        raise ArgumentError, "oauth_access_id must be an integer" unless oauth_access_id.is_a?(Integer)

        request = Authnd::Proto::FindActiveDeviceAuthRequest.new(user_id: user_id, oauth_access_id: oauth_access_id)
        twirp_resp = @twirp_client.find_active_device_auth(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def approve_device_auth(auth_request_id, user_id, oauth_access_id, signature, signature_version, headers: {})
        complete_device_auth(auth_request_id, user_id, oauth_access_id, signature, signature_version, completion_type: :approve, headers: headers)
      end

      def reject_device_auth(auth_request_id, user_id, oauth_access_id, headers: {})
        complete_device_auth(auth_request_id, user_id, oauth_access_id, nil, nil, completion_type: :reject, headers: headers)
      end

      protected

      def complete_device_auth(auth_request_id, user_id, oauth_access_id, signature, signature_version, completion_type:, headers: {})
        raise ArgumentError, "auth_request_id must be an integer" unless auth_request_id.is_a?(Integer)
        raise ArgumentError, "user_id must be an integer" unless user_id.is_a?(Integer)
        raise ArgumentError, "oauth_access_id must be an integer" unless oauth_access_id.is_a?(Integer)
        raise ArgumentError, "completion_type must be :approve or :reject" unless %i[approve reject].include?(completion_type)

        if completion_type == :approve
          raise ArgumentError, "signature must be a non empty string" unless signature.is_a?(String) && !signature.empty?
          raise ArgumentError, "signature_version must be an integer" unless signature_version.is_a?(Integer)
        end

        complete_device_auth_message = Authnd::Proto::CompleteDeviceAuthMessage.new(
          auth_request_id: auth_request_id,
          user_id: user_id,
          oauth_access_id: oauth_access_id,
          signature: signature,
          signature_version: signature_version,
        )

        request = Authnd::Proto::CompleteDeviceAuthRequest.new(
          reject: complete_device_auth_message,
        )
        if completion_type == :approve
          request = Authnd::Proto::CompleteDeviceAuthRequest.new(
            approve: complete_device_auth_message,
          )
        end

        twirp_resp = @twirp_client.complete_device_auth(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def create_twirp_client(connection)
        Authnd::Proto::MobileDeviceManagerClient.new(connection)
      end
    end
  end
end
