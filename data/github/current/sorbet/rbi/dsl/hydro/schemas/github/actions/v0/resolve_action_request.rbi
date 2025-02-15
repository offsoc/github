# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::ResolveActionRequest`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::ResolveActionRequest`.

class Hydro::Schemas::Github::Actions::V0::ResolveActionRequest
  sig do
    params(
      action_nwo: T.nilable(String),
      connect_request: T.nilable(T::Boolean),
      enterprise_installation: T.nilable(Hydro::Schemas::Github::EnterpriseAccount::V0::Entities::EnterpriseInstallation),
      job_id: T.nilable(String),
      package_id: T.nilable(Google::Protobuf::Int64Value),
      ref: T.nilable(String),
      resolved_ref: T.nilable(String),
      resolved_repository: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository),
      resolved_sha: T.nilable(String),
      user: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      workflow_repository_id: T.nilable(Google::Protobuf::Int64Value),
      workflow_run_id: T.nilable(Google::Protobuf::Int64Value)
    ).void
  end
  def initialize(action_nwo: nil, connect_request: nil, enterprise_installation: nil, job_id: nil, package_id: nil, ref: nil, resolved_ref: nil, resolved_repository: nil, resolved_sha: nil, user: nil, workflow_repository_id: nil, workflow_run_id: nil); end

  sig { returns(String) }
  def action_nwo; end

  sig { params(value: String).void }
  def action_nwo=(value); end

  sig { void }
  def clear_action_nwo; end

  sig { void }
  def clear_connect_request; end

  sig { void }
  def clear_enterprise_installation; end

  sig { void }
  def clear_job_id; end

  sig { void }
  def clear_package_id; end

  sig { void }
  def clear_ref; end

  sig { void }
  def clear_resolved_ref; end

  sig { void }
  def clear_resolved_repository; end

  sig { void }
  def clear_resolved_sha; end

  sig { void }
  def clear_user; end

  sig { void }
  def clear_workflow_repository_id; end

  sig { void }
  def clear_workflow_run_id; end

  sig { returns(T::Boolean) }
  def connect_request; end

  sig { params(value: T::Boolean).void }
  def connect_request=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::EnterpriseAccount::V0::Entities::EnterpriseInstallation)) }
  def enterprise_installation; end

  sig do
    params(
      value: T.nilable(Hydro::Schemas::Github::EnterpriseAccount::V0::Entities::EnterpriseInstallation)
    ).void
  end
  def enterprise_installation=(value); end

  sig { returns(String) }
  def job_id; end

  sig { params(value: String).void }
  def job_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def package_id; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def package_id=(value); end

  sig { returns(String) }
  def ref; end

  sig { params(value: String).void }
  def ref=(value); end

  sig { returns(String) }
  def resolved_ref; end

  sig { params(value: String).void }
  def resolved_ref=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)) }
  def resolved_repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)).void }
  def resolved_repository=(value); end

  sig { returns(String) }
  def resolved_sha; end

  sig { params(value: String).void }
  def resolved_sha=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def user; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def user=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def workflow_repository_id; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def workflow_repository_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def workflow_run_id; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def workflow_run_id=(value); end
end
