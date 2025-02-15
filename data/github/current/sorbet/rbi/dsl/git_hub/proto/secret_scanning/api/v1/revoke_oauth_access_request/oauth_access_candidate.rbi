# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V1::RevokeOauthAccessRequest::OauthAccessCandidate`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V1::RevokeOauthAccessRequest::OauthAccessCandidate`.

class GitHub::Proto::SecretScanning::Api::V1::RevokeOauthAccessRequest::OauthAccessCandidate
  sig do
    params(
      commit_oid: T.nilable(String),
      token: T.nilable(String),
      token_source: T.nilable(T.any(Symbol, Integer)),
      type: T.nilable(String),
      url: T.nilable(String)
    ).void
  end
  def initialize(commit_oid: nil, token: nil, token_source: nil, type: nil, url: nil); end

  sig { void }
  def clear_commit_oid; end

  sig { void }
  def clear_token; end

  sig { void }
  def clear_token_source; end

  sig { void }
  def clear_type; end

  sig { void }
  def clear_url; end

  sig { returns(String) }
  def commit_oid; end

  sig { params(value: String).void }
  def commit_oid=(value); end

  sig { returns(String) }
  def token; end

  sig { params(value: String).void }
  def token=(value); end

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
