# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V1::UnverifyPublicKeyRequest::PrivateKeyCandidate`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V1::UnverifyPublicKeyRequest::PrivateKeyCandidate`.

class GitHub::Proto::SecretScanning::Api::V1::UnverifyPublicKeyRequest::PrivateKeyCandidate
  sig do
    params(
      private_key: T.nilable(String),
      token_source: T.nilable(T.any(Symbol, Integer)),
      type: T.nilable(String),
      url: T.nilable(String)
    ).void
  end
  def initialize(private_key: nil, token_source: nil, type: nil, url: nil); end

  sig { void }
  def clear_private_key; end

  sig { void }
  def clear_token_source; end

  sig { void }
  def clear_type; end

  sig { void }
  def clear_url; end

  sig { returns(String) }
  def private_key; end

  sig { params(value: String).void }
  def private_key=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def token_source; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def token_source=(value); end

  sig { returns(String) }
  def type; end

  sig { params(value: String).void }
  def type=(value); end

  sig { returns(String) }
  def url; end

  sig { params(value: String).void }
  def url=(value); end
end
