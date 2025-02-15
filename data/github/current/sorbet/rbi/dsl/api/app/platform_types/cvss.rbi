# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CVSS`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CVSS`.

class Api::App::PlatformTypes::CVSS < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Float) }
  def score; end

  sig { returns(T::Boolean) }
  def score?; end

  sig { returns(T.nilable(String)) }
  def vector_string; end

  sig { returns(T::Boolean) }
  def vector_string?; end
end
