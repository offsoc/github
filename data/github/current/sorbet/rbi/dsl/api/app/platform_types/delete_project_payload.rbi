# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::DeleteProjectPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::DeleteProjectPayload`.

class Api::App::PlatformTypes::DeleteProjectPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def owner; end

  sig { returns(T::Boolean) }
  def owner?; end
end
