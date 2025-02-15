# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UpdateEnterpriseProfilePayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UpdateEnterpriseProfilePayload`.

class PlatformTypes::UpdateEnterpriseProfilePayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::Enterprise)) }
  def enterprise; end

  sig { returns(T::Boolean) }
  def enterprise?; end
end
