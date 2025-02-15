# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CodeSearchLanguageFacet`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CodeSearchLanguageFacet`.

class Api::App::PlatformTypes::CodeSearchLanguageFacet < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def color; end

  sig { returns(T::Boolean) }
  def color?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(String) }
  def query; end

  sig { returns(T::Boolean) }
  def query?; end
end
