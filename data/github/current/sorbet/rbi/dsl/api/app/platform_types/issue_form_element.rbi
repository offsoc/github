# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::IssueFormElement`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::IssueFormElement`.

class Api::App::PlatformTypes::IssueFormElement < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(String) }
  def type; end

  sig { returns(T::Boolean) }
  def type?; end
end
