# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :resolve_actions do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :actions_reader
  end

  define_access :read_actions do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :actions_reader
  end

  define_access :read_actions_downloads do |access|
    # We do not allow :everyone to protect from scanning logs/artifacts for tokens
    access.ensure_context :resource
    access.allow :actions_reader
  end

  define_access :write_actions do |access|
    access.ensure_context :resource
    access.allow :actions_writer
  end

  define_access :write_environment_secrets do |access|
    access.ensure_context :resource
    access.allow :environment_secrets_writer
  end

  define_access :read_environment_secrets do |access|
    access.ensure_context :resource
    access.allow :environment_secrets_reader
  end

  define_access :write_actions_secrets do |access|
    access.ensure_context :resource
    access.allow :actions_secrets_writer
  end

  define_access :read_actions_secrets do |access|
    access.ensure_context :resource
    access.allow :actions_secrets_reader
  end

  # Uses fine grained permission
  define_access :write_actions_secrets_org do |access|
    access.ensure_context :resource
    access.allow :organization_actions_secrets_writer
  end

  # Uses fine grained permission
  define_access :read_actions_secrets_org do |access|
    access.ensure_context :resource
    access.allow :organization_actions_secrets_reader
  end

  define_access :write_environment_variables do |access|
    access.ensure_context :resource
    access.allow :environment_variables_writer
  end

  define_access :read_environment_variables do |access|
    access.ensure_context :resource
    access.allow :environment_variables_reader
  end

  define_access :write_actions_variables do |access|
    access.ensure_context :resource
    access.allow :actions_variables_writer
  end

  define_access :read_actions_variables do |access|
    access.ensure_context :resource
    access.allow :actions_variables_reader
  end

  # Checks fine grained permission
  define_access :write_actions_variables_org do |access|
    access.ensure_context :resource
    access.allow :organization_actions_variables_writer
  end

  # Checks fine grained permission
  define_access :read_actions_variables_org do |access|
    access.ensure_context :resource
    access.allow :organization_actions_variables_reader
  end

  define_access :write_required_workflows do |access|
    access.ensure_context :resource, :user
    access.allow :v4_organization_administration_writer
  end

  define_access :read_required_workflows do |access|
    access.ensure_context :resource, :user
    access.allow :v4_organization_administration_reader
  end

  define_access :write_org_self_hosted_runners_or_runners_and_runner_groups do |access|
    access.ensure_context :resource
    access.allow :org_self_hosted_runners_or_runners_and_runner_groups_writer
  end

  define_access :read_org_self_hosted_runners_or_runners_and_runner_groups do |access|
    access.ensure_context :resource
    access.allow :org_self_hosted_runners_or_runners_and_runner_groups_reader
  end

  define_access :write_admin_actions_repo do |access|
    access.ensure_context :resource
    access.allow :repo_administration_writer
  end

  define_access :read_admin_actions do |access|
    access.ensure_context :resource
    access.allow :repo_administration_reader
  end

  define_access :register_actions_runner_org do |access|
    access.ensure_context :resource, :user
    access.allow :org_self_hosted_runners_or_runners_and_runner_groups_writer
  end

  define_access :register_actions_runner_repo do |access|
    access.ensure_context :resource, :user
    access.allow :repo_administration_writer
  end

  define_access :read_actions_admin_enterprise do |access|
    access.ensure_context :resource
    access.allow :enterprise_actions_writer
  end

  define_access :write_actions_admin_enterprise do |access|
    access.ensure_context :resource
    access.allow :enterprise_actions_writer
  end

  define_access :read_actions_cache_admin_enterprise do |access|
    access.ensure_context :resource
    access.allow :business_admin
  end

  define_access :write_actions_cache_admin_enterprise do |access|
    access.ensure_context :resource
    access.allow :business_admin
  end

  # Uses fine grained permission
  define_access :read_actions_settings_org do |access|
    access.ensure_context :resource, :user
    access.allow :organization_actions_settings_reader
  end

  # Uses fine grained permission
  define_access :write_actions_settings_org do |access|
    access.ensure_context :resource, :user
    access.allow :organization_actions_settings_writer
  end

  define_access :approve_deployments do |access|
    access.ensure_context :resource
    access.allow :deployment_approver
  end

  define_access :check_verified_owners do |access|
    access.allow :everyone
  end

  define_access :run_dynamic_workflow do |access|
    access.ensure_context :resource, :user
    access.allow :actions_dynamic_workflows_capable
  end

  define_access :write_org_larger_runners do |access|
    access.ensure_context :resource
    access.allow :org_larger_runners_writer
  end

  define_access :read_org_larger_runners do |access|
    access.ensure_context :resource
    access.allow :org_larger_runners_reader
  end

  define_access :write_enterprise_actions_oidc_custom_issuer do |access|
    access.ensure_context :resource
    access.allow :business_admin
  end
end
