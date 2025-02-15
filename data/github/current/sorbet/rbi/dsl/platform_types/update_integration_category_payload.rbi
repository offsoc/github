# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UpdateIntegrationCategoryPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UpdateIntegrationCategoryPayload`.

class PlatformTypes::UpdateIntegrationCategoryPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::IntegrationFeature)) }
  def integration_category; end

  sig { returns(T::Boolean) }
  def integration_category?; end
end
