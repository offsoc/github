# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::UniformResourceLocatable`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::UniformResourceLocatable`.

class Api::App::PlatformTypes::UniformResourceLocatable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end
end
