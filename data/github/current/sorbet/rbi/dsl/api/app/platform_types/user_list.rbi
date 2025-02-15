# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::UserList`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::UserList`.

class Api::App::PlatformTypes::UserList < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(String)) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_private; end

  sig { returns(T::Boolean) }
  def is_private?; end

  sig { returns(Api::App::PlatformTypes::UserListItemsConnection) }
  def items; end

  sig { returns(T::Boolean) }
  def items?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def last_added_at; end

  sig { returns(T::Boolean) }
  def last_added_at?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(String) }
  def slug; end

  sig { returns(T::Boolean) }
  def slug?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(Api::App::PlatformTypes::User) }
  def user; end

  sig { returns(T::Boolean) }
  def user?; end
end
