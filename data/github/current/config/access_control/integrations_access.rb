# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access :read_integration,
                :read_integration_installations,
                :read_integration_installation_requests,
                :read_integration_hook_deliveries,
                :read_integration_hook_config do |access|
    access.ensure_context :resource
    access.allow :authenticated_integration
  end

  define_access :modify_integration_installation_token,
                :modify_integration_installation_suspension,
                :modify_integration_hook_config,
                :redeliver_integration_hook_delivery,
                :refresh_installation_access_token do |access|
    access.ensure_context :resource
    access.allow :authenticated_integration
  end

  define_access :delete_integration_installations do |access|
    access.ensure_context :resource
    access.allow :authenticated_integration
  end

  define_access :create_integration_installation_global_token do |access|
    access.ensure_context :resource
    access.allow :authenticated_global_integration
  end

  define_access :create_integration_installation_token do |access|
    access.ensure_context :resource
    access.allow :authenticated_integration
  end

  define_access :search_installation_repositories_for_user do |access|
    access.ensure_context :user
    access.allow :user_installations_repos_searcher
  end

  define_access :list_installation_repositories do |access|
    access.ensure_context :resource, :installation
    access.allow :integration_installation_self
  end

  define_access :revoke_installation_token do |access|
    access.ensure_context :user, :resource
    access.allow :authenticated_installation_self
  end

  define_access :list_installation_repositories_for_user do |access|
    access.ensure_context :resource
    access.allow :user_installation_repos_lister
  end

  define_access :installation_repo_admin do |access|
    access.ensure_context :installation, :resource
    access.allow :user_repo_installation_writer
  end
end
