# frozen_string_literal: true

require "minitest/autorun"
require "authnd-client"

class CredentialExtensionTest < Minitest::Test
  def test_create_ssh_key_credential
    cred = Authnd::Proto::Credentials.ssh_key("ssh-rsa goof troop")
    assert_equal :ssh_public_key, cred.kind
    assert_equal "ssh-rsa goof troop", cred.ssh_public_key.key
  end

  def test_create_login_password_credential
    cred = Authnd::Proto::Credentials.login_password("monalisa", "password")
    assert_equal :login_password, cred.kind
    assert_equal "monalisa", cred.login_password.login
    assert_equal "password", cred.login_password.password
  end

  def test_create_access_token_credential
    cred = Authnd::Proto::Credentials.access_token("ghp_beefcafe")
    assert_equal :access_token, cred.kind
    assert_equal "ghp_beefcafe", cred.access_token.token
  end

  def test_create_signed_auth_token_credential
    cred = Authnd::Proto::Credentials.signed_auth_token("BEEFCAFE", "myscope")
    assert_equal :signed_auth_token, cred.kind
    assert_equal "BEEFCAFE", cred.signed_auth_token.token
    assert_equal "myscope", cred.signed_auth_token.scope
  end

  def test_create_signed_auth_token_credential_force_encoding
    scope = "md图片"
    encoded_scope = scope.b
    assert_equal encoded_scope.encoding, Encoding::ASCII_8BIT

    cred = Authnd::Proto::Credentials.signed_auth_token("BEEFCAFE", encoded_scope)
    assert_equal :signed_auth_token, cred.kind
    assert_equal "BEEFCAFE", cred.signed_auth_token.token
    assert_equal scope, cred.signed_auth_token.scope
  end
end
