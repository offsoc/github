# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::AddProjectV2ItemByIdPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::AddProjectV2ItemByIdPayload`.

class PlatformTypes::AddProjectV2ItemByIdPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::ProjectV2Item)) }
  def item; end

  sig { returns(T::Boolean) }
  def item?; end

  sig { returns(T.nilable(PlatformTypes::ProjectV2ItemEdge)) }
  def project_edge; end

  sig { returns(T::Boolean) }
  def project_edge?; end
end
