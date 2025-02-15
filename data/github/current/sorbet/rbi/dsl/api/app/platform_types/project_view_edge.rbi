# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ProjectViewEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ProjectViewEdge`.

class Api::App::PlatformTypes::ProjectViewEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::ProjectView)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
