# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Users::V1::UserListItem`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Users::V1::UserListItem`.

class GitHub::Proto::Users::V1::UserListItem
  sig do
    params(
      avatar_url: T.nilable(String),
      email: T.nilable(String),
      has_two_factor_authentication_enabled: T.nilable(T::Boolean),
      id: T.nilable(Integer),
      is_site_admin: T.nilable(T::Boolean),
      login: T.nilable(String),
      name: T.nilable(String),
      plan_name: T.nilable(String),
      profile_url: T.nilable(String),
      type: T.nilable(T.any(Symbol, Integer)),
      verified_emails: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Proto::Users::V1::UserVerifiedEmailsResultItem], T::Array[GitHub::Proto::Users::V1::UserVerifiedEmailsResultItem]))
    ).void
  end
  def initialize(avatar_url: nil, email: nil, has_two_factor_authentication_enabled: nil, id: nil, is_site_admin: nil, login: nil, name: nil, plan_name: nil, profile_url: nil, type: nil, verified_emails: T.unsafe(nil)); end

  sig { returns(String) }
  def avatar_url; end

  sig { params(value: String).void }
  def avatar_url=(value); end

  sig { void }
  def clear_avatar_url; end

  sig { void }
  def clear_email; end

  sig { void }
  def clear_has_two_factor_authentication_enabled; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_is_site_admin; end

  sig { void }
  def clear_login; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_plan_name; end

  sig { void }
  def clear_profile_url; end

  sig { void }
  def clear_type; end

  sig { void }
  def clear_verified_emails; end

  sig { returns(String) }
  def email; end

  sig { params(value: String).void }
  def email=(value); end

  sig { returns(T::Boolean) }
  def has_two_factor_authentication_enabled; end

  sig { params(value: T::Boolean).void }
  def has_two_factor_authentication_enabled=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T::Boolean) }
  def is_site_admin; end

  sig { params(value: T::Boolean).void }
  def is_site_admin=(value); end

  sig { returns(String) }
  def login; end

  sig { params(value: String).void }
  def login=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def plan_name; end

  sig { params(value: String).void }
  def plan_name=(value); end

  sig { returns(String) }
  def profile_url; end

  sig { params(value: String).void }
  def profile_url=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Proto::Users::V1::UserVerifiedEmailsResultItem]) }
  def verified_emails; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Proto::Users::V1::UserVerifiedEmailsResultItem]).void }
  def verified_emails=(value); end
end
