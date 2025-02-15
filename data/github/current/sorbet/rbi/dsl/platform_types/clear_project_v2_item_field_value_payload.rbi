# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ClearProjectV2ItemFieldValuePayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ClearProjectV2ItemFieldValuePayload`.

class PlatformTypes::ClearProjectV2ItemFieldValuePayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::ProjectV2Item)) }
  def project_v2_item; end

  sig { returns(T::Boolean) }
  def project_v2_item?; end
end
