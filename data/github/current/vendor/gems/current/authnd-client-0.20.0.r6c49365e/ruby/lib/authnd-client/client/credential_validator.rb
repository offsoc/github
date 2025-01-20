# frozen_string_literal: true

module Authnd
  module Client
    class CredentialValidator
      def validate(credentials)
        if credentials&.signed_auth_token&.token&.blank? ||
           credentials&.access_token&.token&.blank? ||
           credentials&.ssh_public_key&.key&.blank? ||
           credentials&.login_password&.login&.blank?
          raise ArgumentError, "credentials have no contents"
        end
      end

      def validate_credential_array(credentials)
        credentials.each do |c|
          validate(c)
        end
      end
    end
  end
end
