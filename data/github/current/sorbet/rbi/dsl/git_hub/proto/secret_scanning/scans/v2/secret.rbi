# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Scans::V2::Secret`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Scans::V2::Secret`.

class GitHub::Proto::SecretScanning::Scans::V2::Secret
  sig do
    params(
      bypass_placeholder_ksuid: T.nilable(String),
      fingerprint: T.nilable(String),
      locations: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Scans::V2::Location], T::Array[GitHub::Proto::SecretScanning::Scans::V2::Location])),
      token_metadata: T.nilable(GitHub::Proto::SecretScanning::Types::V1::TokenMetadata),
      type: T.nilable(String),
      value: T.nilable(String)
    ).void
  end
  def initialize(bypass_placeholder_ksuid: nil, fingerprint: nil, locations: T.unsafe(nil), token_metadata: nil, type: nil, value: nil); end

  sig { returns(String) }
  def bypass_placeholder_ksuid; end

  sig { params(value: String).void }
  def bypass_placeholder_ksuid=(value); end

  sig { void }
  def clear_bypass_placeholder_ksuid; end

  sig { void }
  def clear_fingerprint; end

  sig { void }
  def clear_locations; end

  sig { void }
  def clear_token_metadata; end

  sig { void }
  def clear_type; end

  sig { void }
  def clear_value; end

  sig { returns(String) }
  def fingerprint; end

  sig { params(value: String).void }
  def fingerprint=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Scans::V2::Location]) }
  def locations; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Scans::V2::Location]).void }
  def locations=(value); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Types::V1::TokenMetadata)) }
  def token_metadata; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Types::V1::TokenMetadata)).void }
  def token_metadata=(value); end

  sig { returns(String) }
  def type; end

  sig { params(value: String).void }
  def type=(value); end

  sig { returns(String) }
  def value; end

  sig { params(value: String).void }
  def value=(value); end
end
