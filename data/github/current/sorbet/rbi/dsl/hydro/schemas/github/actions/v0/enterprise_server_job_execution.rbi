# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::EnterpriseServerJobExecution`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::EnterpriseServerJobExecution`.

class Hydro::Schemas::Github::Actions::V0::EnterpriseServerJobExecution
  sig do
    params(
      check_run_id: T.nilable(Integer),
      check_suite_id: T.nilable(Integer),
      end_time: T.nilable(Google::Protobuf::Timestamp),
      enterprise_installation: T.nilable(Hydro::Schemas::Github::EnterpriseAccount::V0::Entities::EnterpriseInstallation),
      invoking_event_type: T.nilable(String),
      job_check_run_conclusion: T.nilable(T.any(Symbol, Integer)),
      job_execution_billable_ms: T.nilable(Integer),
      job_id: T.nilable(String),
      job_runtime: T.nilable(T.any(Symbol, Integer)),
      job_runtime_version: T.nilable(String),
      organization_id: T.nilable(Integer),
      runner_properties: T.nilable(String),
      runner_type: T.nilable(T.any(Symbol, Integer)),
      server_id: T.nilable(String),
      start_time: T.nilable(Google::Protobuf::Timestamp),
      workflow_build_id: T.nilable(Integer),
      workflow_repository_global_id: T.nilable(String),
      workflow_repository_id: T.nilable(Integer),
      workflow_repository_visibility: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(check_run_id: nil, check_suite_id: nil, end_time: nil, enterprise_installation: nil, invoking_event_type: nil, job_check_run_conclusion: nil, job_execution_billable_ms: nil, job_id: nil, job_runtime: nil, job_runtime_version: nil, organization_id: nil, runner_properties: nil, runner_type: nil, server_id: nil, start_time: nil, workflow_build_id: nil, workflow_repository_global_id: nil, workflow_repository_id: nil, workflow_repository_visibility: nil); end

  sig { returns(Integer) }
  def check_run_id; end

  sig { params(value: Integer).void }
  def check_run_id=(value); end

  sig { returns(Integer) }
  def check_suite_id; end

  sig { params(value: Integer).void }
  def check_suite_id=(value); end

  sig { void }
  def clear_check_run_id; end

  sig { void }
  def clear_check_suite_id; end

  sig { void }
  def clear_end_time; end

  sig { void }
  def clear_enterprise_installation; end

  sig { void }
  def clear_invoking_event_type; end

  sig { void }
  def clear_job_check_run_conclusion; end

  sig { void }
  def clear_job_execution_billable_ms; end

  sig { void }
  def clear_job_id; end

  sig { void }
  def clear_job_runtime; end

  sig { void }
  def clear_job_runtime_version; end

  sig { void }
  def clear_organization_id; end

  sig { void }
  def clear_runner_properties; end

  sig { void }
  def clear_runner_type; end

  sig { void }
  def clear_server_id; end

  sig { void }
  def clear_start_time; end

  sig { void }
  def clear_workflow_build_id; end

  sig { void }
  def clear_workflow_repository_global_id; end

  sig { void }
  def clear_workflow_repository_id; end

  sig { void }
  def clear_workflow_repository_visibility; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def end_time; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def end_time=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::EnterpriseAccount::V0::Entities::EnterpriseInstallation)) }
  def enterprise_installation; end

  sig do
    params(
      value: T.nilable(Hydro::Schemas::Github::EnterpriseAccount::V0::Entities::EnterpriseInstallation)
    ).void
  end
  def enterprise_installation=(value); end

  sig { returns(String) }
  def invoking_event_type; end

  sig { params(value: String).void }
  def invoking_event_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def job_check_run_conclusion; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def job_check_run_conclusion=(value); end

  sig { returns(Integer) }
  def job_execution_billable_ms; end

  sig { params(value: Integer).void }
  def job_execution_billable_ms=(value); end

  sig { returns(String) }
  def job_id; end

  sig { params(value: String).void }
  def job_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def job_runtime; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def job_runtime=(value); end

  sig { returns(String) }
  def job_runtime_version; end

  sig { params(value: String).void }
  def job_runtime_version=(value); end

  sig { returns(Integer) }
  def organization_id; end

  sig { params(value: Integer).void }
  def organization_id=(value); end

  sig { returns(String) }
  def runner_properties; end

  sig { params(value: String).void }
  def runner_properties=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def runner_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def runner_type=(value); end

  sig { returns(String) }
  def server_id; end

  sig { params(value: String).void }
  def server_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def start_time; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def start_time=(value); end

  sig { returns(Integer) }
  def workflow_build_id; end

  sig { params(value: Integer).void }
  def workflow_build_id=(value); end

  sig { returns(String) }
  def workflow_repository_global_id; end

  sig { params(value: String).void }
  def workflow_repository_global_id=(value); end

  sig { returns(Integer) }
  def workflow_repository_id; end

  sig { params(value: Integer).void }
  def workflow_repository_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def workflow_repository_visibility; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def workflow_repository_visibility=(value); end
end
