# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::CodeScanning::V0::CodeqlBulkBuilderStatus`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::CodeScanning::V0::CodeqlBulkBuilderStatus`.

class Hydro::Schemas::CodeScanning::V0::CodeqlBulkBuilderStatus
  sig do
    params(
      codeql_cli_version: T.nilable(String),
      commit_sha: T.nilable(String),
      completed_at: T.nilable(Google::Protobuf::Timestamp),
      configuration_commit_sha: T.nilable(String),
      enqueued_at: T.nilable(Google::Protobuf::Timestamp),
      language: T.nilable(String),
      mode: T.nilable(String),
      repository_id: T.nilable(Integer),
      repository_nwo: T.nilable(String),
      started_at: T.nilable(Google::Protobuf::Timestamp),
      status: T.nilable(String),
      step_failed: T.nilable(String),
      workflow_run_attempt: T.nilable(Integer),
      workflow_run_id: T.nilable(Integer)
    ).void
  end
  def initialize(codeql_cli_version: nil, commit_sha: nil, completed_at: nil, configuration_commit_sha: nil, enqueued_at: nil, language: nil, mode: nil, repository_id: nil, repository_nwo: nil, started_at: nil, status: nil, step_failed: nil, workflow_run_attempt: nil, workflow_run_id: nil); end

  sig { void }
  def clear_codeql_cli_version; end

  sig { void }
  def clear_commit_sha; end

  sig { void }
  def clear_completed_at; end

  sig { void }
  def clear_configuration_commit_sha; end

  sig { void }
  def clear_enqueued_at; end

  sig { void }
  def clear_language; end

  sig { void }
  def clear_mode; end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_repository_nwo; end

  sig { void }
  def clear_started_at; end

  sig { void }
  def clear_status; end

  sig { void }
  def clear_step_failed; end

  sig { void }
  def clear_workflow_run_attempt; end

  sig { void }
  def clear_workflow_run_id; end

  sig { returns(String) }
  def codeql_cli_version; end

  sig { params(value: String).void }
  def codeql_cli_version=(value); end

  sig { returns(String) }
  def commit_sha; end

  sig { params(value: String).void }
  def commit_sha=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def completed_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def completed_at=(value); end

  sig { returns(String) }
  def configuration_commit_sha; end

  sig { params(value: String).void }
  def configuration_commit_sha=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def enqueued_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def enqueued_at=(value); end

  sig { returns(String) }
  def language; end

  sig { params(value: String).void }
  def language=(value); end

  sig { returns(String) }
  def mode; end

  sig { params(value: String).void }
  def mode=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(String) }
  def repository_nwo; end

  sig { params(value: String).void }
  def repository_nwo=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def started_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def started_at=(value); end

  sig { returns(String) }
  def status; end

  sig { params(value: String).void }
  def status=(value); end

  sig { returns(String) }
  def step_failed; end

  sig { params(value: String).void }
  def step_failed=(value); end

  sig { returns(Integer) }
  def workflow_run_attempt; end

  sig { params(value: Integer).void }
  def workflow_run_attempt=(value); end

  sig { returns(Integer) }
  def workflow_run_id; end

  sig { params(value: Integer).void }
  def workflow_run_id=(value); end
end
