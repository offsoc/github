# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Chat::V1::GetReleaseRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Chat::V1::GetReleaseRequest`.

class MonolithTwirp::Copilotapi::Chat::V1::GetReleaseRequest
  sig do
    params(
      access_token: T.nilable(String),
      ip_address: T.nilable(String),
      repository_nwo: T.nilable(String),
      tag_name: T.nilable(String)
    ).void
  end
  def initialize(access_token: nil, ip_address: nil, repository_nwo: nil, tag_name: nil); end

  sig { returns(String) }
  def access_token; end

  sig { params(value: String).void }
  def access_token=(value); end

  sig { void }
  def clear_access_token; end

  sig { void }
  def clear_ip_address; end

  sig { void }
  def clear_repository_nwo; end

  sig { void }
  def clear_tag_name; end

  sig { returns(String) }
  def ip_address; end

  sig { params(value: String).void }
  def ip_address=(value); end

  sig { returns(String) }
  def repository_nwo; end

  sig { params(value: String).void }
  def repository_nwo=(value); end

  sig { returns(String) }
  def tag_name; end

  sig { params(value: String).void }
  def tag_name=(value); end
end
