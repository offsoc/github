# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ReactingUserEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ReactingUserEdge`.

class Api::App::PlatformTypes::ReactingUserEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(Api::App::PlatformTypes::User) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def reacted_at; end

  sig { returns(T::Boolean) }
  def reacted_at?; end
end
