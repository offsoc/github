# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::EnterpriseUserAccount`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::EnterpriseUserAccount`.

class PlatformTypes::EnterpriseUserAccount < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def avatar_url; end

  sig { returns(T::Boolean) }
  def avatar_url?; end

  sig { returns(T.nilable(PlatformTypes::AvatarConnection)) }
  def avatars; end

  sig { returns(T::Boolean) }
  def avatars?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(PlatformTypes::Enterprise) }
  def enterprise; end

  sig { returns(T::Boolean) }
  def enterprise?; end

  sig { returns(PlatformTypes::EnterpriseServerInstallationMembershipConnection) }
  def enterprise_installations; end

  sig { returns(T::Boolean) }
  def enterprise_installations?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(String) }
  def login; end

  sig { returns(T::Boolean) }
  def login?; end

  sig { returns(T.nilable(String)) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(PlatformTypes::EnterpriseOrganizationMembershipConnection) }
  def organizations; end

  sig { returns(T::Boolean) }
  def organizations?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def profile_resource_path; end

  sig { returns(T::Boolean) }
  def profile_resource_path?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def profile_url; end

  sig { returns(T::Boolean) }
  def profile_url?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def user; end

  sig { returns(T::Boolean) }
  def user?; end
end
