# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::LinkIssueOrPullRequestPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::LinkIssueOrPullRequestPayload`.

class Api::App::PlatformTypes::LinkIssueOrPullRequestPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T.any(Api::App::PlatformTypes::Issue, Api::App::PlatformTypes::PullRequest))) }
  def base_issue_or_pull_request; end

  sig { returns(T::Boolean) }
  def base_issue_or_pull_request?; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T::Array[GraphQL::Client::Schema::InterfaceType]) }
  def errors; end

  sig { returns(T::Boolean) }
  def errors?; end

  sig { returns(T.nilable(T::Array[T.any(Api::App::PlatformTypes::Issue, Api::App::PlatformTypes::PullRequest)])) }
  def linked_issues_or_pull_requests; end

  sig { returns(T::Boolean) }
  def linked_issues_or_pull_requests?; end
end
