# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access :get_repo,
                :list_dependency_graphs,
                :list_events,
                :list_watchers,
                :list_stargazers,
                :list_languages,
                :list_tags,
                :list_forks,
                :list_contributors,
                :list_repo_issue_events,
                :get_license,
                :get_repo_stats,
                :git_poll do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_metadata_reader
  end

  define_access :v4_get_repo do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :v4_private_repo_metadata_reader
  end

  define_access :v4_list_private_repos do |access|
    access.allow :v4_private_repo_lister
  end

  define_access :list_branches,
                :compare_commits,
                :get_blob,
                :get_codeowners_errors,
                :get_commit,
                :get_diff,
                :get_push,
                :get_activity,
                :list_commits,
                :list_activities,
                :list_issue_templates,
                :list_issue_comment_templates,
                :list_refs,
                :extract_ref,
                :list_repo_contact_links,
                :get_dependency_graph,
                :get_ref,
                :get_tag,
                :get_tree,
                :get_readme,
                :get_code_of_conduct,
                :get_contributing,
                :get_funding,
                :get_archive_link,
                :get_temp_clone_token,
                :get_merge_queue,
                :view_community_profile do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_contents_reader
  end

  define_access :get_contents do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_contents_reader
    access.allow :repo_file_reader
  end

  define_access :report_content do |access|
    access.ensure_context :resource
    access.ensure_context :repo
    access.allow :repo_contents_reader
  end

  define_access :follow_repo_redirect do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_redirect_follower
    access.allow :programmatic_repo_resources_reader
  end

  define_access :list_network_events do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
  end

  define_access :read_user_repo_subscription do |access|
    access.ensure_context :user, :resource
    access.allow :user_repository_watching_reader
  end

  define_access :write_user_repo_subscription do |access|
    access.ensure_context :user, :resource
    access.allow :user_repository_watching_writer
  end

  define_access :pull do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_contents_reader
  end

  define_access :pull_storage do |access|
    access.ensure_context :resource
    access.allow :repo_contents_reader
  end

  define_access :create_fork do |access|
    access.ensure_context :user, :resource
    access.allow :repo_forker
  end

  define_access :get_star do |access|
    access.ensure_context :user, :resource
    access.allow :user_repository_starring_reader
  end

  define_access :star, :unstar do |access|
    access.ensure_context :user, :resource
    access.allow :user_repository_starring_writer
  end

  define_access :create_repo_for_org do |access|
    access.ensure_context :resource
    access.allow :org_repo_creator
  end

  define_access :create_repo_for_org_from_template do |access|
    access.ensure_context :resource
    access.allow :org_repo_creator
  end

  define_access :create_private_repo_for_org do |access|
    access.ensure_context :resource
    access.allow :org_private_repo_creator
  end

  define_access :create_private_repo_for_org_from_template do |access|
    access.ensure_context :resource
    access.allow :org_private_repo_creator
  end

  define_access :list_public_repos do |access|
    access.allow :everyone
  end

  define_access :list_watched, :list_starred, :list_repos do |access|
    access.allow(:everyone) { |context| context[:user] }
  end

  define_access :list_associated_public_org_owned_repos do |access|
    access.allow :associated_public_org_owned_repo_lister
  end

  define_access :list_private_repos do |access|
    access.allow :private_repo_lister
  end

  define_access :list_all_repos do |access|
    access.allow :site_admin
  end

  define_access :list_private_stars, :list_private_watched_repos do |access|
    access.allow :private_repo_lister do |context|
      actor, target, authenticated_user = extract(context, :user, :resource, :authenticated_user)

      next unless actor && target

      if actor.bot? && authenticated_user&.using_auth_via_granular_actor?
        authenticated_user.id == target.id
      else
        actor.id == target.id
      end
    end
  end

  define_access :read_vulnerability_alerts do |access|
    access.allow :repo_vulnerability_alert_reader
  end

  define_access :read_vulnerability_alerts_config do |access|
    access.allow :repo_vulnerability_alert_admin
    access.allow :repo_administration_reader
  end

  define_access :write_vulnerability_alerts do |access|
    access.allow :repo_vulnerability_alert_writer
  end

  define_access :admin_vulnerability_alerts do |access|
    access.allow :repo_vulnerability_alert_admin
  end

  define_access :read_secret_scanning_alerts do |access|
    access.ensure_context :user, :resource
    access.allow :secret_scanning_alerts_api_reader
  end

  define_access :write_secret_scanning_alerts do |access|
    access.ensure_context :user, :resource
    access.allow :secret_scanning_alerts_api_writer
  end

  define_access :bypass_secret_scanning_push_protection do |access|
    access.ensure_context :user, :resource
    access.allow :secret_scanning_push_protection_bypass_writer
  end

  define_access :read_automated_security_fixes do |access|
    access.allow :repo_administration_reader
  end

  define_access :admin_automated_security_fixes do |access|
    access.allow :repo_administration_writer
  end

  define_access :read_branch_protection do |access|
    access.allow :repo_protection_reader
  end

  define_access :update_branch_protection,
                :update_repository_rulesets do |access|
    access.allow :repo_protection_writer
  end

  define_access :read_tag_protection do |access|
    access.allow :repo_protection_reader
  end

  define_access :update_tag_protection do |access|
    access.allow :repo_protection_writer
  end

  define_access :create_repo do |access|
    access.allow :repo_creator
  end

  define_access :create_repo_from_template do |access|
    access.allow :repo_creator
  end

  define_access :create_private_repo do |access|
    access.allow :private_repo_creator
  end

  define_access :create_private_repo_from_template do |access|
    access.allow :private_repo_creator
  end


  define_access :delete_repo do |access|
    access.ensure_context :resource
    access.allow :repo_deleter
  end

  define_access :list_repo_keys, :get_repo_key do |access|
    access.ensure_context :resource
    access.allow :deploy_key_reader
  end

  define_access :transfer_repo do |access|
    access.ensure_context :resource
    access.allow :repo_transferer
  end

  define_access :edit_repo do |access|
    access.ensure_context :resource
    access.allow :repo_administration_writer
  end

  define_access :manage_repo_security_products do |access|
    access.ensure_context :resource
    access.allow :repo_administration_writer
    access.allow :repo_security_products_manager
  end

  define_access :view_repo_security_products do |access|
    access.ensure_context :resource
    access.allow :repo_administration_reader
    access.allow :repo_security_products_manager
  end

  define_access :view_merge_settings do |access|
    access.ensure_context :resource
    access.allow :repo_administration_writer
    access.allow :repo_contents_writer
  end

  define_access :manage_topics do |access|
    access.ensure_context :resource
    access.allow :topics_manager
  end

  define_access :list_repo_teams do |access|
    access.ensure_context :resource
    access.allow :repo_administration_reader
  end

  define_access :list_repo_cache_info do |access|
    access.ensure_context :resource
    access.allow :repo_administration_reader
  end

  define_access :add_repo_key, :manage_repo_key do |access|
    access.allow :deploy_key_writer
  end

  define_access :add_collaborator do |access|
    access.ensure_context :resource, :collab
    access.allow :repo_administration_writer
  end

  define_access :remove_collaborator do |access|
    access.ensure_context :resource, :collab
    access.allow :repo_member_remover
  end

  define_access :list_collaborators do |access|
    access.ensure_context :resource
    access.allow :repo_resources_writer
    access.allow :programmatic_repo_resources_reader
  end

  define_access :see_user_permission do |access|
    access.ensure_context :resource
    access.allow :repo_resources_writer
    access.allow :programmatic_repo_resources_reader
  end

  define_access :list_repository_invitations do |access|
    access.ensure_context :resource
    access.allow :repo_invitations_reader
  end

  define_access :admin_repository_invitations do |access|
    access.ensure_context :resource
    access.allow :repo_invitations_writer
  end

  define_access :push do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
  end

  define_access :create_repo_dispatch do |access|
    access.ensure_context :repo
    access.allow :repo_contents_writer
  end

  define_access :create_blob,
                :create_commit,
                :create_tag,
                :create_tree do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
  end

  define_access :create_ref,
                :delete_ref,
                :update_refs do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
    access.allow :repo_packages_writer
  end

  define_access :append_commit_to_ref do |access|
    access.ensure_context :resource
    access.ensure_context :ref_name
    access.allow :repo_contents_writer
    access.allow :repo_packages_writer
    access.allow :fork_collab_grantee
  end

  define_access :update_ref do |access|
    access.ensure_context :resource
    access.ensure_context :ref_name
    access.allow :repo_contents_writer
    access.allow :repo_packages_writer
    access.allow :fork_collab_grantee
  end

  define_access :create_ref_v2 do |access|
    access.ensure_context :repo, :user, :before_oid, :after_oid
    access.allow :repo_refs_writer
  end

  define_access :update_ref_v2 do |access|
    access.ensure_context :repo, :user, :before_oid, :after_oid
    access.allow :repo_refs_updater
  end

  define_access :update_refs_v2 do |access|
    access.ensure_context :repo, :user, :ref_updates
    access.allow :repo_refs_mass_updater
  end

  define_access :get_repository_pages_deployment_status do |access|
    access.ensure_context :resource
    access.allow :repo_pages_reader
  end

  define_access :read_pages do |access|
    access.ensure_context :resource
    access.allow :repo_pages_reader
  end

  define_access :build_pages do |access|
    access.ensure_context :resource
    access.allow :repo_pages_writer
  end

  define_access :write_pages do |access|
    access.ensure_context :resource
    access.allow :repo_pages_writer
  end

  define_access :admin_pages do |access|
    access.ensure_context :resource
    access.allow :repo_pages_admin
  end

  define_access :merge_branch do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
  end

  define_access :lock_merge_queue,
                :merge_locked_merge_group,
                :unlock_merge_group,
                :unlock_and_reset_merge_group,
                :get_merge_queue_config,
                :force_clear_merge_queue do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
  end

  define_access :rename_branch do |access|
    access.ensure_context :resource, :ref
    access.allow :repo_branch_renamer
  end

  define_access :merge_upstream do |access|
    access.ensure_context :resource, :ref
    access.allow :upstream_merger
  end

  define_access :update_file, :delete_file  do |access|
    access.ensure_context :resource
    access.allow :repo_file_writer
  end

  define_access :write_file do |access|
    access.ensure_context :resource
    access.allow :repo_file_writer
  end

  define_access :write_files do |access|
    access.ensure_context :resource, :files
    access.allow :repo_files_writer
  end

  define_access :repo_access do |access|
    access.ensure_context :resource
    access.allow :repo_access_admin
  end

  define_access :edit_repo_custom_properties_values do |access|
    access.ensure_context :user, :resource
    access.allow :repo_custom_properties_values_editor
  end

  define_access :repo_traffic do |access|
    access.ensure_context :resource
    access.allow :repo_traffic_access
  end

  define_access :read_repository_interaction_limits do |access|
    access.ensure_context :resource
    access.allow :repo_administration_reader
  end

  define_access :set_repository_interaction_limits do |access|
    access.ensure_context :resource

    access.allow :repo_interaction_limiter
  end

  define_access :minimize_repo_comment do |access|
    access.allow :repo_comment_minimizer
  end

  define_access :notify_channel do |access|
    access.ensure_context :resource

    access.allow :presence_participant
  end

  define_access :get_status_check_rollup do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :check_run_reader
    access.allow :status_reader
  end

  define_access :read_code_scanning do |access|
    access.ensure_context :resource
    access.allow :security_events_reader
  end

  define_access :write_code_scanning do |access|
    access.ensure_context :resource
    access.allow :security_events_writer
  end

  define_access :delete_code_scanning_analysis do |access|
    access.ensure_context :resource
    access.allow :code_scanning_analysis_deleter
  end

  define_access :read_announcement_banner do |access|
    access.ensure_context :user, :business, :resource
    access.allow :announcement_banner_reader
  end

  define_access :write_announcement_banner do |access|
    access.ensure_context :user, :business, :resource
    access.allow :announcement_banner_writer
  end

  define_access :create_repo_image do |access|
    access.ensure_context :resource
    access.allow :repo_image_writer
  end

  define_access :read_repository_custom_properties do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_metadata_reader
    access.allow :repo_custom_properties_reader
  end

  define_access :migrate_semver_releases_to_immutable_actions do |access|
    access.ensure_context :resource
    access.allow :immutable_actions_migrator
  end

  define_access :read_repo_code_security_configuration do |access|
    access.ensure_context :user, :resource
    access.allow :repo_code_security_configuration_reader
  end
end
