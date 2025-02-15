# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::GitActor`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::GitActor`.

class Api::App::PlatformTypes::GitActor < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def actor; end

  sig { returns(T::Boolean) }
  def actor?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def avatar_url; end

  sig { returns(T::Boolean) }
  def avatar_url?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def commits_resource_path; end

  sig { returns(T::Boolean) }
  def commits_resource_path?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def date; end

  sig { returns(T::Boolean) }
  def date?; end

  sig { returns(T.nilable(String)) }
  def email; end

  sig { returns(T::Boolean) }
  def email?; end

  sig { returns(T.nilable(String)) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::User)) }
  def user; end

  sig { returns(T::Boolean) }
  def user?; end
end
