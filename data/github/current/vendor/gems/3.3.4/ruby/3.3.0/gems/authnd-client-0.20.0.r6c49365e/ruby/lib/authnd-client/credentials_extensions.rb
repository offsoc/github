# frozen_string_literal: true

# Some utility factories to simplify creating the deep chain of protobuf objects

module Authnd
  module Proto
    class Credentials
      def self.ssh_key(key)
        Credentials.new(ssh_public_key: SSHPublicKey.new(key: key))
      end

      def self.login_password(login, password)
        Credentials.new(login_password: LoginPassword.new(login: login, password: password))
      end

      def self.access_token(token)
        Credentials.new(access_token: AccessToken.new(token: token))
      end

      def self.signed_auth_token(token, scope)
        force_proto_string_encoding(scope)
        Credentials.new(signed_auth_token: SignedAuthToken.new(token: token, scope: scope))
      end

      # forcibly UTF-8 encodes the provided string. protobuf strings are expected to be UTF-8 encoded, and
      # the call to construct credentials will raise if provided a different encoding (e.g. ASCII-8BIT).
      def self.force_proto_string_encoding(param)
        return unless param.is_a?(String) && param.encoding != Encoding::UTF_8

        param.force_encoding(Encoding::UTF_8)
      end
      private_class_method :force_proto_string_encoding
    end
  end
end
