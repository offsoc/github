# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::CheckSuite`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::CheckSuite`.

class PlatformTypes::CheckSuite < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(PlatformTypes::CheckAnnotationConnection)) }
  def annotations; end

  sig { returns(T::Boolean) }
  def annotations?; end

  sig { returns(T.nilable(PlatformTypes::App)) }
  def app; end

  sig { returns(T::Boolean) }
  def app?; end

  sig { returns(T.nilable(PlatformTypes::ArtifactConnection)) }
  def artifacts; end

  sig { returns(T::Boolean) }
  def artifacts?; end

  sig { returns(T.nilable(PlatformTypes::Ref)) }
  def branch; end

  sig { returns(T::Boolean) }
  def branch?; end

  sig { returns(T.nilable(PlatformTypes::CheckRunConnection)) }
  def check_runs; end

  sig { returns(T::Boolean) }
  def check_runs?; end

  sig { returns(T::Boolean) }
  def check_runs_rerunnable; end

  sig { returns(T::Boolean) }
  def check_runs_rerunnable?; end

  sig { returns(PlatformTypes::Commit) }
  def commit; end

  sig { returns(T::Boolean) }
  def commit?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def completed_at; end

  sig { returns(T::Boolean) }
  def completed_at?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def completed_log_url; end

  sig { returns(T::Boolean) }
  def completed_log_url?; end

  sig { returns(T.nilable(String)) }
  def conclusion; end

  sig { returns(T::Boolean) }
  def conclusion?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def creator; end

  sig { returns(T::Boolean) }
  def creator?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(Integer) }
  def duration; end

  sig { returns(T::Boolean) }
  def duration?; end

  sig { returns(T.nilable(String)) }
  def event; end

  sig { returns(T::Boolean) }
  def event?; end

  sig { returns(T::Boolean) }
  def has_reruns; end

  sig { returns(T::Boolean) }
  def has_reruns?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(PlatformTypes::PullRequestConnection)) }
  def matching_pull_requests; end

  sig { returns(T::Boolean) }
  def matching_pull_requests?; end

  sig { returns(T.nilable(String)) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(T.nilable(PlatformTypes::Push)) }
  def push; end

  sig { returns(T::Boolean) }
  def push?; end

  sig { returns(PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end

  sig { returns(T::Boolean) }
  def rerequestable; end

  sig { returns(T::Boolean) }
  def rerequestable?; end

  sig { returns(T::Boolean) }
  def rerunnable; end

  sig { returns(T::Boolean) }
  def rerunnable?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def started_at; end

  sig { returns(T::Boolean) }
  def started_at?; end

  sig { returns(String) }
  def status; end

  sig { returns(T::Boolean) }
  def status?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end

  sig { returns(T.nilable(String)) }
  def workflow_file_path; end

  sig { returns(T::Boolean) }
  def workflow_file_path?; end

  sig { returns(String) }
  def workflow_name; end

  sig { returns(T::Boolean) }
  def workflow_name?; end

  sig { returns(T.nilable(PlatformTypes::WorkflowRun)) }
  def workflow_run; end

  sig { returns(T::Boolean) }
  def workflow_run?; end
end
