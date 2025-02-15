# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::RestrictRepositoryNameParameters`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::RestrictRepositoryNameParameters`.

class Api::App::PlatformTypes::RestrictRepositoryNameParameters < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def negate; end

  sig { returns(T::Boolean) }
  def negate?; end

  sig { returns(String) }
  def pattern; end

  sig { returns(T::Boolean) }
  def pattern?; end
end
