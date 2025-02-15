# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::Commit`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::Commit`.

class PlatformTypes::Commit < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def abbreviated_oid; end

  sig { returns(T::Boolean) }
  def abbreviated_oid?; end

  sig { returns(Integer) }
  def additions; end

  sig { returns(T::Boolean) }
  def additions?; end

  sig { returns(T.nilable(PlatformTypes::PullRequestConnection)) }
  def associated_pull_requests; end

  sig { returns(T::Boolean) }
  def associated_pull_requests?; end

  sig { returns(T.nilable(PlatformTypes::GitActor)) }
  def author; end

  sig { returns(T::Boolean) }
  def author?; end

  sig { returns(T::Boolean) }
  def authored_by_committer; end

  sig { returns(T::Boolean) }
  def authored_by_committer?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def authored_date; end

  sig { returns(T::Boolean) }
  def authored_date?; end

  sig { returns(PlatformTypes::GitActorConnection) }
  def authors; end

  sig { returns(T::Boolean) }
  def authors?; end

  sig { returns(PlatformTypes::Blame) }
  def blame; end

  sig { returns(T::Boolean) }
  def blame?; end

  sig { returns(Integer) }
  def changed_files; end

  sig { returns(T::Boolean) }
  def changed_files?; end

  sig { returns(T.nilable(Integer)) }
  def changed_files_if_available; end

  sig { returns(T::Boolean) }
  def changed_files_if_available?; end

  sig { returns(T.nilable(PlatformTypes::CheckSuiteConnection)) }
  def check_suites; end

  sig { returns(T::Boolean) }
  def check_suites?; end

  sig { returns(PlatformTypes::CommitCommentConnection) }
  def comments; end

  sig { returns(T::Boolean) }
  def comments?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def commit_resource_path; end

  sig { returns(T::Boolean) }
  def commit_resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def commit_url; end

  sig { returns(T::Boolean) }
  def commit_url?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def committed_date; end

  sig { returns(T::Boolean) }
  def committed_date?; end

  sig { returns(T::Boolean) }
  def committed_via_web; end

  sig { returns(T::Boolean) }
  def committed_via_web?; end

  sig { returns(T.nilable(PlatformTypes::GitActor)) }
  def committer; end

  sig { returns(T::Boolean) }
  def committer?; end

  sig { returns(Integer) }
  def deletions; end

  sig { returns(T::Boolean) }
  def deletions?; end

  sig { returns(T.nilable(PlatformTypes::DeploymentConnection)) }
  def deployments; end

  sig { returns(T::Boolean) }
  def deployments?; end

  sig { returns(T.nilable(PlatformTypes::Diff)) }
  def diff; end

  sig { returns(T::Boolean) }
  def diff?; end

  sig { returns(T.nilable(PlatformTypes::TreeEntry)) }
  def file; end

  sig { returns(T::Boolean) }
  def file?; end

  sig { returns(T::Boolean) }
  def has_signature; end

  sig { returns(T::Boolean) }
  def has_signature?; end

  sig { returns(T::Boolean) }
  def has_status_check_rollup; end

  sig { returns(T::Boolean) }
  def has_status_check_rollup?; end

  sig { returns(PlatformTypes::CommitHistoryConnection) }
  def history; end

  sig { returns(T::Boolean) }
  def history?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(String) }
  def message; end

  sig { returns(T::Boolean) }
  def message?; end

  sig { returns(String) }
  def message_body; end

  sig { returns(T::Boolean) }
  def message_body?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def message_body_html; end

  sig { returns(T::Boolean) }
  def message_body_html?; end

  sig { returns(String) }
  def message_headline; end

  sig { returns(T::Boolean) }
  def message_headline?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def message_headline_html; end

  sig { returns(T::Boolean) }
  def message_headline_html?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def oid; end

  sig { returns(T::Boolean) }
  def oid?; end

  sig { returns(T.nilable(PlatformTypes::Organization)) }
  def on_behalf_of; end

  sig { returns(T::Boolean) }
  def on_behalf_of?; end

  sig { returns(PlatformTypes::CommitConnection) }
  def parents; end

  sig { returns(T::Boolean) }
  def parents?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def pushed_date; end

  sig { returns(T::Boolean) }
  def pushed_date?; end

  sig { returns(PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def short_message_body_html; end

  sig { returns(T::Boolean) }
  def short_message_body_html?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def signature; end

  sig { returns(T::Boolean) }
  def signature?; end

  sig { returns(T.nilable(PlatformTypes::Status)) }
  def status; end

  sig { returns(T::Boolean) }
  def status?; end

  sig { returns(T.nilable(PlatformTypes::StatusCheckRollup)) }
  def status_check_rollup; end

  sig { returns(T::Boolean) }
  def status_check_rollup?; end

  sig { returns(PlatformTypes::SubmoduleConnection) }
  def submodules; end

  sig { returns(T::Boolean) }
  def submodules?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def tarball_url; end

  sig { returns(T::Boolean) }
  def tarball_url?; end

  sig { returns(PlatformTypes::Tree) }
  def tree; end

  sig { returns(T::Boolean) }
  def tree?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def tree_resource_path; end

  sig { returns(T::Boolean) }
  def tree_resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def tree_url; end

  sig { returns(T::Boolean) }
  def tree_url?; end

  sig { returns(T.nilable(String)) }
  def updates_channel; end

  sig { returns(T::Boolean) }
  def updates_channel?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end

  sig { returns(T.nilable(String)) }
  def verification_status; end

  sig { returns(T::Boolean) }
  def verification_status?; end

  sig { returns(T::Boolean) }
  def viewer_can_subscribe; end

  sig { returns(T::Boolean) }
  def viewer_can_subscribe?; end

  sig { returns(T::Boolean) }
  def viewer_can_unsubscribe; end

  sig { returns(T::Boolean) }
  def viewer_can_unsubscribe?; end

  sig { returns(T.nilable(String)) }
  def viewer_subscription; end

  sig { returns(T::Boolean) }
  def viewer_subscription?; end

  sig { returns(String) }
  def websocket; end

  sig { returns(T::Boolean) }
  def websocket?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def zipball_url; end

  sig { returns(T::Boolean) }
  def zipball_url?; end
end
