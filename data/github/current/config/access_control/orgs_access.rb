# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access :read_org_public do |access|
    access.allow :everyone
  end

  define_access :get_org_private do |access|
    access.allow :org_member_reader
  end

  define_access :list_public_members,
                :get_public_member do |access|
    access.allow :everyone
  end

  define_access :list_private_org_members do |access|
    access.allow :org_member_reader
  end

  define_access :v4_list_private_org_members do |access|
    access.allow :v4_org_member_reader
  end

  define_access :view_org_external_identities, :view_org_identity_provider do |access|
    access.allow :org_admin_reader
    access.allow :installation_org_member_writer
    access.allow :installation_organization_administration_reader
  end

  define_access :list_orgs_for_user do |access|
    access.allow :user_orgs_lister
  end

  define_access :list_member_repositories do |access|
    access.allow :org_member_reader
  end

  define_access :list_two_factor_disabled_members do |access|
    access.allow :org_two_factor_auditor

    access.allow :org_member_reader do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :get_member do |access|
    access.allow :user_self_org_membership_reader
    access.allow :org_member_reader
  end

  define_access :read_org_member_permissions do |access|
    access.allow :v4_org_member_reader
  end

  define_access :read_member_repo_permissions do |access|
    access.allow :org_admin
    access.allow :v4_organization_administration_reader
  end

  define_access :publicize_membership do |access|
    access.allow :user_self_org_membership_writer
  end

  define_access :conceal_membership do |access|
    access.allow :v3_org_admin
    access.allow :user_self_org_membership_writer
  end

  define_access :read_org_custom_repo_roles do |access|
    access.allow :org_custom_repo_roles_reader
    # Allowing administration reader, because then repo admins can also read custom roles.
    access.allow :organization_administration_reader
  end

  define_access :modify_org_custom_repo_role do |access|
    access.allow :org_custom_repo_roles_writer
  end

  define_access :read_org_custom_org_role do |access|
    access.allow :org_custom_org_roles_reader
  end

  define_access :modify_org_custom_org_role do |access|
    access.allow :org_custom_org_roles_writer
  end

  define_access :list_current_user_accessible_orgs do |access|
    access.allow :user_self_accessible_orgs_lister
  end

  define_access :get_current_user_org_membership do |access|
    access.allow :user_self_org_membership_reader
  end

  define_access :update_current_user_org_membership do |access|
    access.allow :user_self_org_membership_writer
  end

  define_access :v4_get_user_org_memberships do |access|
    access.allow :v4_user_org_memberships_lister
  end

  define_access :update_org do |access|
    access.ensure_context :resource
    access.allow :organization_administration_writer
  end

  define_access :delete_org do |access|
    access.ensure_context :resource
    access.allow :v4_organization_administration_writer
    access.allow :site_admin
  end

  define_access :remove_member, :manage_org_users, :remove_outside_collaborator do |access|
    access.allow :v3_org_admin

    access.allow :org_member_writer do |context|
      user = extract(context, :user)
      user && user.can_have_granular_permissions?
    end
  end

  define_access :manage_org_role_assignments do |access|
    access.allow :org_admin

    access.allow :v4_org_member_writer do |context|
      user = extract(context, :user)
      user && user.can_have_granular_permissions?
    end
  end

  define_access :read_org_role_assignments do |access|
    access.allow :org_admin
    access.allow :v4_org_member_reader do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :view_org_settings do |access|
    access.allow :organization_administration_reader
  end

  define_access :view_org_installations do |access|
    access.allow :v4_organization_administration_reader
  end

  define_access :get_org_plan do |access|
    access.ensure_context :user, :resource
    access.allow :organization_plan_reader
  end

  define_access :org_scim_reader do |access|
    access.allow :v3_org_admin

    access.allow :org_member_reader do |context|
      user = extract(context, :user)
      user && user.can_have_granular_permissions?
    end
  end

  define_access :v4_manage_org_users, :v4_remove_outside_collaborator do |access|
    access.allow :org_admin

    access.allow :v4_org_member_writer do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :v4_read_org_invitations do |access|
    access.allow :org_admin
    access.allow :org_admin_reader
    access.allow :org_business_admin
    access.allow :installation_org_member_reader
    access.allow :installation_organization_administration_reader
  end

  define_access :v4_view_org_settings do |access|
    access.allow :org_admin
  end

  define_access :v4_read_org_audit_log do |access|
    access.allow :v4_org_audit_log_reader
  end

  define_access :read_org_invitations do |access|
    access.allow :v3_org_admin

    access.allow :org_member_reader do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :read_org_member_domain_emails do |access|
    access.allow :org_member_reader
  end

  define_access :list_outside_collaborators do |access|
    access.allow :org_outside_collaborator_reader
  end

  define_access :create_team do |access|
    access.allow :team_creator
  end

  define_access :v4_create_team do |access|
    access.allow :v4_team_creator
  end

  define_access :admin_team do |access|
    access.allow :v3_org_admin
    access.allow :team_maintainer

    access.allow :org_member_writer do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :admin_team_membership do |access|
    access.allow :v3_org_admin do |context|
      team = extract(context, :team)
      team.locally_managed?
    end
    access.allow :team_maintainer do |context|
      team = extract(context, :team)
      team.locally_managed?
    end

    access.allow :org_member_writer do |context|
      user, team = extract(context, :user, :team)
      installation = user.try(:installation)
      actor = installation || user

      # Restrict authorization to the GroupSyncer app only when
      # Team is mapped to external Groups and is managed externally.
      team_sync_restriction = team&.externally_managed? &&
        !installation&.integration&.group_syncer_github_app?

      actor&.can_have_granular_permissions? && !team_sync_restriction
    end
  end

  define_access :list_team_invitations do |access|
    access.allow :v3_org_admin
    access.allow :team_maintainer

    access.allow :org_member_reader do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :v4_list_team_invitations do |access|
    access.allow :org_admin
    access.allow :v4_team_maintainer
    access.allow :installation_org_member_reader
  end

  define_access :v4_manage_team do |access|
    access.allow :v4_team_maintainer
  end

  define_access :list_teams do |access|
    access.allow :org_member_reader
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :v4_list_teams do |access|
    access.allow :v4_org_member_reader
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :list_all_teams do |access|
    access.allow :site_admin
  end

  define_access :list_all_user_teams do |access|
    access.allow :team_lister
  end

  define_access :get_team do |access|
    access.ensure_context :team
    access.allow :team_member_reader
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :v4_get_team do |access|
    access.ensure_context :team
    access.allow :v4_team_member_reader
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :list_team_repos do |access|
    access.ensure_context :team
    access.allow :team_repo_lister
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :list_all_team_repos do |access|
    access.allow :site_admin
  end

  define_access :get_team_repo do |access|
    access.ensure_context :user, :team, :repo
    access.allow :team_repo_reader
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :add_team_repo do |access|
    access.ensure_context :user, :team, :repo
    access.allow :team_repo_adder
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :add_team_to_new_repo do |access|
    access.ensure_context :user, :resource
    access.allow :team_new_repo_adder
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :remove_team_repo do |access|
    access.ensure_context :user, :team, :repo
    access.allow :team_repo_remover
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :list_team_projects do |access|
    access.ensure_context :resource
    access.allow :team_project_lister
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :add_team_project do |access|
    access.ensure_context :resource
    access.allow :team_project_adder
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :link_team_project_v2 do |access|
    access.ensure_context :resource
    access.allow :team_project_v2_linker
  end

  define_access :remove_team_project do |access|
    access.ensure_context :resource
    access.allow :team_project_remover
    access.allow :site_admin do
      GitHub.enterprise_only_api_enabled?
    end
  end

  define_access :get_team_membership do |access|
    access.ensure_context :team
    access.allow :user_self_team_membership_reader
    access.allow :team_membership_reader
  end

  define_access :delete_team_membership do |access|
    access.ensure_context :team
    access.allow :user_self_team_membership_deleter do |context|
      team  = extract(context, :team)
      team.locally_managed?
    end

    access.allow :team_membership_deleter do |context|
      team  = extract(context, :team)
      team.locally_managed?
    end

    access.allow :org_member_writer do |context|
      user, team = extract(context, :user, :team)

      installation = user.try(:installation)
      actor = installation || user

      # Restrict authorization to the GroupSyncer app only when
      # Team is mapped to external Groups and is managed externally.
      team_sync_restriction = team.externally_managed? &&
        !installation&.integration&.group_syncer_github_app?

      actor&.can_have_granular_permissions? && !team_sync_restriction
    end
  end

  define_access :read_org_blocks do |access|
    access.ensure_context :resource
    access.allow :organization_blocks_reader
  end

  define_access :manage_org_blocks do |access|
    access.ensure_context :resource
    access.allow :organization_blocks_writer
  end

  define_access :manage_org_blocks_mobile do |access|
    access.ensure_context :resource
    access.allow :organization_blocks_writer
  end

  define_access :create_organization_invitation do |access|
    access.ensure_context :resource
    access.allow :org_admin

    access.allow :org_member_writer do |context|
      actor = extract(context, :user)
      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :cancel_organization_invitation do |access|
    access.ensure_context :resource
    access.allow :org_admin

    access.allow :org_member_writer do |context|
      actor = extract(context, :user)
      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :list_organization_invitation_teams do |access|
    access.ensure_context :resource
    access.allow :org_admin

    access.allow :org_member_reader do |context|
      actor = extract(context, :user)
      actor && actor.can_have_granular_permissions?
    end
  end

  define_access :read_organization_interaction_limits do |access|
    access.ensure_context :resource
    access.allow :organization_interaction_limits_reader
  end

  define_access :set_organization_interaction_limits do |access|
    access.ensure_context :resource
    access.allow :organization_interaction_limits_writer
  end

  define_access :write_organization_settings do |access|
    access.ensure_context :resource
    access.allow :organization_administration_writer
  end

  define_access :reader_organization_settings do |access|
    access.ensure_context :resource
    access.allow :organization_administration_read
  end

  define_access :accept_business_organization_invitation do |access|
    access.ensure_context :resource
    access.allow :org_admin
  end

  define_access :authorized_org_credentials_reader do |access|
    access.ensure_context :resource, :organization
    access.allow :v4_organization_administration_reader
  end

  define_access :authorized_org_credentials_writer do |access|
    access.ensure_context :resource, :organization
    access.allow :v4_organization_administration_writer
  end

  define_access :list_org_secret_scanning_alerts do |access|
    access.ensure_context :user, :resource
    access.allow :org_secret_scanning_alerts_api_reader
  end

  define_access :list_org_code_scanning_alerts_for_only_public_repos do |access|
    access.ensure_context :user, :resource
    access.allow :org_code_scanning_alerts_for_only_public_repos
  end

  define_access :list_org_secret_scanning_alerts_for_programmatic_actor_installed_on_some_repos do |access|
    access.ensure_context :user, :resource
    access.allow :programmatic_actor_installed_on_some_org_repos
  end

  define_access :list_org_secret_scanning_alerts_for_only_public_repos do |access|
    access.ensure_context :user, :resource
    access.allow :org_secret_scanning_alerts_for_only_public_repos
  end

  define_access :list_org_code_scanning_alerts do |access|
    access.ensure_context :user, :resource
    access.allow :org_code_scanning_alerts_api_reader
  end

  define_access :list_org_dependabot_alerts do |access|
    access.ensure_context :user, :resource
    access.allow :org_dependabot_alerts_api_reader
  end

  define_access :read_org_actions_cache do |access|
    access.allow :v4_organization_administration_reader
  end

  define_access :read_org_oidc_sub_template do |access|
    access.allow :v4_organization_administration_reader
  end

  define_access :write_org_oidc_sub_template do |access|
    access.allow :v4_organization_administration_writer
  end

  define_access :list_org_security_managers do |access|
    access.ensure_context :user, :resource
    access.allow :org_security_managers_reader
  end

  define_access :add_org_security_managers do |access|
    access.ensure_context :user, :resource
    access.allow :org_security_managers_writer
  end

  define_access :remove_org_security_managers do |access|
    access.ensure_context :user, :resource
    access.allow :org_security_managers_admin
  end

  define_access :read_org_security_products do |access|
    access.ensure_context :user, :resource
    access.allow :organization_administration_reader
    access.allow :org_security_products_manager
  end

  define_access :manage_org_security_products do |access|
    access.ensure_context :user, :resource
    access.allow :organization_administration_writer
    access.allow :org_security_products_manager
  end

  define_access :manage_org_security_product_configurations do |access|
    access.ensure_context :user, :resource
    access.allow :org_security_products_manager
  end

  define_access :manage_organization_ref_rules do |access|
    access.ensure_context :resource
    access.allow :org_ref_rules_manager
  end

  define_access :read_org_pat_requests do |access|
    access.ensure_context :user, :resource
    access.allow :organization_programmatic_access_grant_request_reader
  end

  define_access :read_org_pats do |access|
    access.ensure_context :user, :resource
    access.allow :organization_programmatic_access_grant_reader
  end

  define_access :write_org_pat_requests do |access|
    access.ensure_context :user, :resource
    access.allow :organization_programmatic_access_grant_request_writer
  end

  define_access :write_org_pats do |access|
    access.ensure_context :user, :resource
    access.allow :organization_programmatic_access_grant_writer
  end

  define_access :read_org_custom_properties do |access|
    access.allow :org_custom_properties_reader
    access.allow :v4_org_member_reader # deprecated
  end

  define_access :manage_org_custom_properties_definitions do |access|
    access.ensure_context :user, :resource
    access.allow :org_custom_properties_definitions_manager
  end

  define_access :edit_org_custom_properties_values do |access|
    access.ensure_context :user, :resource
    access.allow :org_custom_properties_values_editor
  end

  define_access :list_org_repository_advisories do |access|
    access.ensure_context :resource
    access.allow :org_repo_advisory_lister
  end

  define_access :read_org_issue_types do |access|
    access.ensure_context :user, :issue_type, :resource
    access.allow(:everyone) { |context| !context[:issue_type].private? }

    access.allow :org_issue_type_reader
  end
end
