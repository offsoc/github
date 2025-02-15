# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::UpdateIssuesBulkByQueryPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::UpdateIssuesBulkByQueryPayload`.

class PlatformTypes::UpdateIssuesBulkByQueryPayload < GraphQL::Client::Schema::ObjectClass
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

  sig { returns(T.nilable(T.any(String, Integer))) }
  def job_id; end

  sig { returns(T::Boolean) }
  def job_id?; end
end
