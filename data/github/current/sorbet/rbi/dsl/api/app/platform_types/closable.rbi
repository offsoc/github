# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Closable`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Closable`.

class Api::App::PlatformTypes::Closable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def closed; end

  sig { returns(T::Boolean) }
  def closed?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def closed_at; end

  sig { returns(T::Boolean) }
  def closed_at?; end

  sig { returns(T::Boolean) }
  def viewer_can_close; end

  sig { returns(T::Boolean) }
  def viewer_can_close?; end

  sig { returns(T::Boolean) }
  def viewer_can_reopen; end

  sig { returns(T::Boolean) }
  def viewer_can_reopen?; end
end
