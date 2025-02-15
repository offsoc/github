# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::CreateMannequinRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::CreateMannequinRequest`.

class MonolithTwirp::Octoshift::Imports::V1::CreateMannequinRequest
  sig do
    params(
      email: T.nilable(String),
      owner_id: T.nilable(Integer),
      profile_name: T.nilable(String),
      source_login: T.nilable(String)
    ).void
  end
  def initialize(email: nil, owner_id: nil, profile_name: nil, source_login: nil); end

  sig { void }
  def clear_email; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_profile_name; end

  sig { void }
  def clear_source_login; end

  sig { returns(String) }
  def email; end

  sig { params(value: String).void }
  def email=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(String) }
  def profile_name; end

  sig { params(value: String).void }
  def profile_name=(value); end

  sig { returns(String) }
  def source_login; end

  sig { params(value: String).void }
  def source_login=(value); end
end
