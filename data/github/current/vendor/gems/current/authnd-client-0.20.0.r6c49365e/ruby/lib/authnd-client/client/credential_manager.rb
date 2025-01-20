# frozen_string_literal: true

require_relative "./service_client_base"

require "google/protobuf/well_known_types"

module Authnd
  module Client
    class CredentialManager < ServiceClientBase
      def issue_token(type, attributes, expires_at: nil, headers: {})
        # Check arguments
        raise ArgumentError, "type must be a string" unless type.is_a?(String)
        raise ArgumentError, "attributes must be a hash" unless attributes.is_a?(Hash)
        raise ArgumentError, "expires_at must be a Time" unless expires_at.nil? || expires_at.is_a?(Time)

        attributes_list = Authnd::Proto::Attribute.list_from_hash(attributes)
        request = Authnd::Proto::IssueTokenRequest.new(type: type, attributes: attributes_list)

        request.expires_at_time = Google::Protobuf::Timestamp.new(seconds: expires_at.tv_sec) unless expires_at.nil?

        twirp_resp = @twirp_client.issue_token(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def issue_signed_auth_token(user_id, scope, expires_at, session_id: nil, data: {}, headers: {})
        # Check arguments
        raise ArgumentError, "user_id must be an Integer" unless user_id.is_a?(Integer) && user_id.positive?
        raise ArgumentError, "scope must be a String" unless scope.is_a?(String) && scope.present?
        raise ArgumentError, "attributes must be a Hash" unless data.is_a?(Hash)
        raise ArgumentError, "expires_at must be a Time" unless expires_at.nil? || expires_at.is_a?(Time)

        attributes_list = Authnd::Proto::Attribute.list_from_hash(data)
        request = Authnd::Proto::IssueSignedAuthTokenRequest.new(
          user_id: user_id,
          session_id: session_id,
          scope: scope,
          expires_at_time: Google::Protobuf::Timestamp.new(seconds: expires_at.tv_sec),
          attributes: attributes_list,
        )

        request.expires_at_time = Google::Protobuf::Timestamp.new(seconds: expires_at.tv_sec) unless expires_at.nil?

        twirp_resp = @twirp_client.issue_signed_auth_token(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      def find_credentials(type, attributes, headers: {})
        # Check arguments
        raise ArgumentError, "type must be a string" unless type.is_a?(String)
        raise ArgumentError, "attributes must be a hash" unless attributes.is_a?(Hash)

        attributes_list = Authnd::Proto::Attribute.list_from_hash(attributes)
        request = Authnd::Proto::FindCredentialsRequest.new(type: type, attributes: attributes_list)

        twirp_resp = @twirp_client.find_credentials(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      # Revokes a list of credentials. The credentials are identified by their type and IDs.
      # Expects a String reason, a String credential_type and an Array of Integer credential IDs.
      def revoke_credentials_by_id(reason, credential_type, ids, headers: {})
        # Check arguments
        raise ArgumentError, "reason must be a string" unless reason.is_a?(String)
        raise ArgumentError, "credential_type must be a string" unless credential_type.is_a?(String)
        raise ArgumentError, "ids must be an array" unless ids.is_a?(Array)
        raise ArgumentError, "ids must be integers" unless ids.all? { |id| id.is_a?(Integer) }

        by_id = Authnd::Proto::RevokeById.new(credential_type: credential_type, credential_ids: ids)
        request = Authnd::Proto::RevokeRequest.new(reason: reason, byId: by_id)

        twirp_resp = @twirp_client.revoke_credentials(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      # Revokes a list of credentials. The credentials themselves (token, public key, etc.) are used to look up the entry to be revoked.
      # Expects a String reason, and an Array of Authnd::Proto::Credentials objects.
      def revoke_credentials(reason, credentials, headers: {})
        # Check arguments
        raise ArgumentError, "reason must be a string" unless reason.is_a?(String)
        raise ArgumentError, "credentials must be an array" unless credentials.is_a?(Array)

        Authnd::Client::CredentialValidator.new.validate_credential_array(credentials)

        by_credential = Authnd::Proto::RevokeByCredential.new(credentials: credentials)
        request = Authnd::Proto::RevokeRequest.new(reason: reason, byCredential: by_credential)

        twirp_resp = @twirp_client.revoke_credentials(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      # Verifies a list of credentials are valid, working credentials. The credentials themselves (token, public key, etc.) are used to look up the entry.
      # Expects an Array of Authnd::Proto::Credentials objects.
      def verify_credentials(candidates, headers: {})
        # Check arguments
        raise ArgumentError, "credentials must be an array" unless candidates.is_a?(Array)

        Authnd::Client::CredentialValidator.new.validate_credential_array(candidates)

        request = Authnd::Proto::VerifyRequest.new(candidates: candidates)

        twirp_resp = @twirp_client.verify_credentials(request, headers: headers)
        raise Authnd::Proto::Error.new(twirp_error: twirp_resp.error) if twirp_resp.error

        twirp_resp.data
      end

      protected

      def create_twirp_client(connection)
        Authnd::Proto::CredentialManagerClient.new(connection)
      end
    end
  end
end
