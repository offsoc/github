# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ReactorEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ReactorEdge`.

class Api::App::PlatformTypes::ReactorEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig do
    returns(T.any(Api::App::PlatformTypes::User, Api::App::PlatformTypes::Organization, Api::App::PlatformTypes::Mannequin, Api::App::PlatformTypes::Bot))
  end
  def node; end

  sig { returns(T::Boolean) }
  def node?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def reacted_at; end

  sig { returns(T::Boolean) }
  def reacted_at?; end
end
