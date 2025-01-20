# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :administer_business do |access|
    access.ensure_context :resource
    access.allow :business_admin
    access.allow :site_admin
  end

  define_access :manage_business_billing do |access|
    access.ensure_context :resource
    access.allow :business_admin
    access.allow :business_billing_manager
  end

  define_access :view_business_billing do |access|
    access.ensure_context :resource
    access.allow :business_admin
    access.allow :business_billing_manager
  end

  define_access :cancel_business_organization_invitation do |access|
    access.ensure_context :resource
    access.allow :business_organization_invitation_canceler
  end

  define_access :view_business_profile do |access|
    access.ensure_context :resource
    access.allow :business_profile_viewer
    access.allow :site_admin unless GitHub.enterprise?
  end

  define_access :view_business_administrator_invitation do |access|
    access.ensure_context :resource
    access.allow :business_administrator_invitation_viewer
  end

  define_access :read_business_audit_log do |access|
    access.allow :business_admin
    access.allow :enterprise_audit_log_reader
  end

  define_access :read_business_and_org_audit_log do |access|
    access.allow :business_admin
    access.allow :org_business_admin
    access.allow :enterprise_audit_log_reader
    access.allow :org_audit_log_reader
  end

  define_access :write_business_enterprise_installation_user_accounts do |access|
    access.ensure_context :resource
    access.allow :business_admin
  end

  define_access :enterprise_scim_writer do |access|
    access.ensure_context :resource
    access.allow :business_admin
    access.allow :business_user_provisioner if GitHub.enterprise?
  end

  define_access :view_enterprise_external_identities do |access|
    access.ensure_context :resource
    access.allow :business_admin
  end

  define_access :v4_view_enterprise_external_identities do |access|
    access.ensure_context :resource, :user
    access.allow :enterprise_external_identities_viewer
  end

  define_access :list_enterprise_secret_scanning_alerts do |access|
    access.ensure_context :resource
    access.allow :enterprise_secret_scanning_alerts_api_reader
  end

  define_access :list_enterprise_code_scanning_alerts do |access|
    access.ensure_context :resource
    access.allow :enterprise_code_scanning_alerts_api_reader
  end

  define_access :list_enterprise_dependabot_alerts do |access|
    access.ensure_context :resource
    access.allow :enterprise_dependabots_alerts_api_reader
  end

  define_access :write_enterprise_self_hosted_runners do |access|
    access.ensure_context :resource
    access.allow :business_self_hosted_runners_writer
  end

  define_access :read_enterprise_self_hosted_runners do |access|
    access.ensure_context :resource
    access.allow :business_self_hosted_runners_writer
  end

  define_access :register_actions_runner_business do |access|
    access.ensure_context :resource, :user
    access.allow :business_self_hosted_runners_writer
  end

  define_access :read_enterprise_code_security_and_analysis_settings do |access|
    access.ensure_context :resource
    access.allow :enterprise_code_security_settings_reader
  end

  define_access :update_enterprise_code_security_and_analysis_settings_new_repos do |access|
    access.ensure_context :resource
    access.allow :enterprise_code_security_settings_writer
  end

  define_access :update_enterprise_security_product_enablement do |access|
    access.ensure_context :resource
    access.allow :enterprise_code_security_settings_writer
  end

  define_access :view_enterprise_external_identities_read_only, :view_enterprise_identity_provider do |access|
    access.ensure_context :resource, :user
    access.allow :business_admin_reader
    access.allow :site_admin
  end

  define_access :check_enterprise_managed_business_access do |access|
    access.ensure_context :resource
    access.allow :enterprise_managed_business_access
  end

  define_access :manage_enterprise_teams do |access|
    access.ensure_context :resource
    access.allow :business_admin
  end

  define_access :read_enterprise_teams do |access|
    access.ensure_context :resource
    access.allow :business_admin_reader
  end

  define_access :read_enterprise_custom_properties do |access|
    access.ensure_context :resource
    access.allow :business_admin_reader
  end

  define_access :list_installable_enterprise_organizations,
                :list_enterprise_organization_installations do |access|
    access.ensure_context :resource
    access.allow :business_organization_installations_reader
  end

  define_access :list_enterprise_organization_installation_repositories do |access|
    access.ensure_context :resource
    access.allow :business_organization_installations_reader
    access.allow :business_organization_installation_repositories_reader
  end

  define_access :install_for_enterprise_organizations,
                :uninstall_for_enterprise_organizations do |access|
    access.ensure_context :resource
    access.allow :business_organization_installations_writer
  end

  define_access :list_installable_enterprise_organization_accessible_repositories do |access|
    access.ensure_context :resource
    access.allow :business_organization_accessible_repositories_reader
  end

  define_access :update_enterprise_organization_installation_repositories do |access|
    access.ensure_context :resource
    access.allow :business_organization_installations_writer
    access.allow :business_organization_installation_repositories_writer
  end
end
