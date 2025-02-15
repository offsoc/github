# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::AddProjectColumnPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::AddProjectColumnPayload`.

class PlatformTypes::AddProjectColumnPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::ProjectColumnEdge)) }
  def column_edge; end

  sig { returns(T::Boolean) }
  def column_edge?; end

  sig { returns(T.nilable(PlatformTypes::Project)) }
  def project; end

  sig { returns(T::Boolean) }
  def project?; end
end
