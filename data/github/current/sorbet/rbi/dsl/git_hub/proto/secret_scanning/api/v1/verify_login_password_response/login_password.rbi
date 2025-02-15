# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V1::VerifyLoginPasswordResponse::LoginPassword`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V1::VerifyLoginPasswordResponse::LoginPassword`.

class GitHub::Proto::SecretScanning::Api::V1::VerifyLoginPasswordResponse::LoginPassword
  sig { params(is_verified: T.nilable(T::Boolean)).void }
  def initialize(is_verified: nil); end

  sig { void }
  def clear_is_verified; end

  sig { returns(T::Boolean) }
  def is_verified; end

  sig { params(value: T::Boolean).void }
  def is_verified=(value); end
end
