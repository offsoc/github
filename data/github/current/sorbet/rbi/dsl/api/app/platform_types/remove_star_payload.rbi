# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::RemoveStarPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::RemoveStarPayload`.

class Api::App::PlatformTypes::RemoveStarPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def starrable; end

  sig { returns(T::Boolean) }
  def starrable?; end
end
