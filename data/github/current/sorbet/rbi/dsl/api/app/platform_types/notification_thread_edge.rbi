# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::NotificationThreadEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::NotificationThreadEdge`.

class Api::App::PlatformTypes::NotificationThreadEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::NotificationThread)) }
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
