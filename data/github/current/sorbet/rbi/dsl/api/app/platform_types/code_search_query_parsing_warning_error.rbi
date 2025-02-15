# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CodeSearchQueryParsingWarningError`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CodeSearchQueryParsingWarningError`.

class Api::App::PlatformTypes::CodeSearchQueryParsingWarningError < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def message; end

  sig { returns(T::Boolean) }
  def message?; end

  sig { returns(T::Array[Api::App::PlatformTypes::CodeSearchErrorRange]) }
  def ranges; end

  sig { returns(T::Boolean) }
  def ranges?; end

  sig { returns(String) }
  def suggestion; end

  sig { returns(T::Boolean) }
  def suggestion?; end
end
