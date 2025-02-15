# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::AddSubIssuePayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::AddSubIssuePayload`.

class Api::App::PlatformTypes::AddSubIssuePayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T::Array[GraphQL::Client::Schema::InterfaceType]) }
  def errors; end

  sig { returns(T::Boolean) }
  def errors?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Issue)) }
  def issue; end

  sig { returns(T::Boolean) }
  def issue?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::Issue)) }
  def sub_issue; end

  sig { returns(T::Boolean) }
  def sub_issue?; end
end
