# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::OauthApplication`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::OauthApplication`.

class Api::App::PlatformTypes::OauthApplication < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T::Boolean) }
  def is_github_owned; end

  sig { returns(T::Boolean) }
  def is_github_owned?; end

  sig { returns(String) }
  def key; end

  sig { returns(T::Boolean) }
  def key?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def logo_url; end

  sig { returns(T::Boolean) }
  def logo_url?; end

  sig { returns(T.nilable(String)) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(String) }
  def preferred_background_color; end

  sig { returns(T::Boolean) }
  def preferred_background_color?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::User)) }
  def user; end

  sig { returns(T::Boolean) }
  def user?; end
end
