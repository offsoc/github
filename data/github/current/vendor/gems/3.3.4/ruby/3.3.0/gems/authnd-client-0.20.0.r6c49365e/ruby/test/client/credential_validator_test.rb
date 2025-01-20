# frozen_string_literal: true

module Authnd
  module Client
    class CredentialValidatorTest < Minitest::Test
      def test_validate_raises_error
        validator = Authnd::Client::CredentialValidator.new

        assert_raises ArgumentError do
          validator.validate(Authnd::Proto::Credentials.signed_auth_token(""))
        end
        assert_raises ArgumentError do
          validator.validate(Authnd::Proto::Credentials.access_token(nil))
        end
        assert_raises ArgumentError do
          validator.validate(Authnd::Proto::Credentials.ssh_key(" "))
        end
        assert_raises ArgumentError do
          validator.validate(Authnd::Proto::Credentials.login_password(" ", "password"))
        end
      end

      def test_validate_credential_array_raises_error
        validator = Authnd::Client::CredentialValidator.new

        assert_raises ArgumentError do
          validator.validate_credential_array(
            [
              Authnd::Proto::Credentials.signed_auth_token("ok"),
              Authnd::Proto::Credentials.access_token(nil),
            ],
          )
        end
      end
    end
  end
end
