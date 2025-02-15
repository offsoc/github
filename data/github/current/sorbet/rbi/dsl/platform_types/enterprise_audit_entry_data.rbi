# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::EnterpriseAuditEntryData`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::EnterpriseAuditEntryData`.

class PlatformTypes::EnterpriseAuditEntryData < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(PlatformTypes::Enterprise)) }
  def enterprise; end

  sig { returns(T::Boolean) }
  def enterprise?; end

  sig { returns(T.nilable(Integer)) }
  def enterprise_database_id; end

  sig { returns(T::Boolean) }
  def enterprise_database_id?; end

  sig { returns(T.nilable(String)) }
  def enterprise_name; end

  sig { returns(T::Boolean) }
  def enterprise_name?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def enterprise_resource_path; end

  sig { returns(T::Boolean) }
  def enterprise_resource_path?; end

  sig { returns(T.nilable(String)) }
  def enterprise_slug; end

  sig { returns(T::Boolean) }
  def enterprise_slug?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def enterprise_url; end

  sig { returns(T::Boolean) }
  def enterprise_url?; end
end
