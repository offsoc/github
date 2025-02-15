# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::PermissionSource`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::PermissionSource`.

class PlatformTypes::PermissionSource < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(PlatformTypes::Organization) }
  def organization; end

  sig { returns(T::Boolean) }
  def organization?; end

  sig { returns(String) }
  def permission; end

  sig { returns(T::Boolean) }
  def permission?; end

  sig { returns(T.nilable(String)) }
  def role_name; end

  sig { returns(T::Boolean) }
  def role_name?; end

  sig { returns(T.any(PlatformTypes::Organization, PlatformTypes::Repository, PlatformTypes::Team)) }
  def source; end

  sig { returns(T::Boolean) }
  def source?; end
end
