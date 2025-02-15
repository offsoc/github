# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectV2Owner`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectV2Owner`.

class PlatformTypes::ProjectV2Owner < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(PlatformTypes::ProjectV2)) }
  def project_v2; end

  sig { returns(T::Boolean) }
  def project_v2?; end

  sig { returns(PlatformTypes::ProjectV2Connection) }
  def projects_v2; end

  sig { returns(T::Boolean) }
  def projects_v2?; end

  sig { returns(PlatformTypes::ProjectV2Connection) }
  def projects_v2_by_number; end

  sig { returns(T::Boolean) }
  def projects_v2_by_number?; end
end
