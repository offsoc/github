# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::AddProjectDraftIssuePayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::AddProjectDraftIssuePayload`.

class Api::App::PlatformTypes::AddProjectDraftIssuePayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::ProjectNextItem)) }
  def project_next_item; end

  sig { returns(T::Boolean) }
  def project_next_item?; end
end
