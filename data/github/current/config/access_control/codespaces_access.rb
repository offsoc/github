# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_codespace do |access|
    access.ensure_context :user, :resource
    access.allow :codespace_writer
  end

  define_access :update_codespace_lifecycle_admin do |access|
    access.ensure_context :user, :resource, :codespace
    # Existing access requiring codespaces app but not `codespace` scope
    access.allow :codespace_writer
    # Public access requires codespace course access or codespace lifecycle admin write fine grained access and ownership
    access.allow :codespace_lifecycle_admin_updater
  end

  define_access :read_codespace_lifecycle_admin do |access|
    access.ensure_context :user, :resource, :codespace
    # Existing access requiring codespaces app but not `codespace` scope
    access.allow :codespace_writer
    # Public access requires codespace course access or codespace lifecycle admin read fine grained access and ownership
    access.allow :codespace_lifecycle_admin_reader
  end

  define_access :update_codespace do |access|
    access.ensure_context :user, :resource, :codespace
    # Existing access requiring codespaces app
    access.allow :codespace_writer
    # Public access requires codespace course access or codespace write fine grained access and ownership
    access.allow :codespace_updater
  end

  define_access :publish_codespace_public do |access|
    access.ensure_context :user, :resource
    # Existing access requiring codespaces app
    access.allow :codespace_writer
    # Public access requires codespace course access or codespace write fine grained access and ownership
    access.allow :codespace_publisher_public
  end

  define_access :read_codespace_repo_metadata_public do |access|
    access.ensure_context :user, :resource, :repo
    # Public access requires repo coarse access or codespace metadata read fine grained access
    access.allow :codespace_repo_metadata_reader_public
  end

  define_access :read_codespace_metadata do |access|
    access.ensure_context :user, :resource, :codespace
    # Existing access requiring codespaces app but not `codespace` scope
    access.allow :codespace_writer
    # Public access requires codespace coarse access or codespace metadata read fine grained access and ownership
    access.allow :codespace_metadata_reader
  end

  define_access :read_codespace do |access|
    access.ensure_context :user, :resource, :codespace
    access.allow :codespace_reader
  end

  define_access :list_codespaces do |access|
    access.ensure_context :user, :resource
    access.allow :codespace_lister
  end

  define_access :create_codespaces_public do |access|
    access.ensure_context :user, :resource, :repo
    # Public access requires codespace course grained or codespace write fine grained access
    access.allow :codespace_creator_public
  end

  define_access :list_codespaces_for_org_public do |access|
    access.ensure_context :user, :resource
    access.allow :codespace_lister_for_org_public
  end

  define_access :delete_codespaces_for_org_public do |access|
    access.ensure_context :user, :resource, :codespace
    access.allow :organization_codespace_writer
  end

  define_access :update_codespace_lifecycle_admin_for_org_public do |access|
    access.ensure_context :user, :resource, :codespace
    access.allow :organization_codespace_lifecycle_admin_updater_public
  end

  define_access :read_user_permissions_for_codespaces_in_org do |access|
    access.ensure_context :user, :resource
    access.allow :organization_codespaces_settings_reader
  end

  define_access :update_user_permissions_for_codespaces_in_org do |access|
    access.ensure_context :user, :resource
    access.allow :organization_codespaces_settings_writer
  end

  define_access :read_codespaces_for_repo_public do |access|
    access.ensure_context :user, :resource, :repo
    # Existing access requiring codespaces app
    access.allow :codespace_lister
    # Public access requires codespace course grained or codespace read fine grained access
    access.allow :codespace_reader_for_repo_public
  end

  define_access :list_codespaces_for_repo_public do |access|
    access.ensure_context :user, :resource, :repo, :owner
    # Existing access requiring codespaces app
    access.allow :codespace_lister_for_repo
    # Public access requires "codespace" scope or "codespaces: read" fine-grained permission
    access.allow :codespace_reader_for_repo_public
  end

  define_access :list_codespaces_public do |access|
    access.ensure_context :user, :resource
    # Existing access requiring codespaces app
    access.allow :codespace_lister
    # Public access requires codespace course grained or codespace read fine grained access
    access.allow :codespace_lister_public
  end

  define_access :codespace_user do |access|
    access.ensure_context :user, :resource
    access.allow :codespace_user
  end

  define_access :access_codespace_secrets do |access|
    access.ensure_context :user
    access.allow :codespaces_secrets_reader
  end

  define_access :manage_codespaces_user_secret do |access|
    access.ensure_context :user
    access.allow :codespaces_secrets_writer
  end

  define_access :write_repo_codespaces_secrets do |access|
    access.ensure_context :resource, :user
    access.allow :repo_codespaces_secrets_writer
  end

  define_access :read_repo_codespaces_secrets do |access|
    access.ensure_context :resource, :user
    access.allow :repo_codespaces_secrets_reader
  end

  define_access :read_org_codespaces_secrets do |access|
    access.ensure_context :resource, :user
    access.allow :org_codespaces_secrets_reader
  end

  define_access :write_org_codespaces_secrets do |access|
    access.ensure_context :resource, :user
    access.allow :org_codespaces_secrets_writer
  end

  define_access :prebuild_codespaces do |access|
    access.ensure_context :user, :resource
    access.allow :codespace_prebuilder
  end

  define_access :lightweight_web_editor_user do |access|
    access.ensure_context :user
    access.allow :lightweight_web_editor_user
  end

  define_access :lightweight_web_editor do |access|
    access.ensure_context :user, :resource
    access.allow :lightweight_web_editor
  end

  define_access :vscode_editors do |access|
    access.ensure_context :user, :resource
    access.allow :lightweight_web_editor
    access.allow :vscode_editor
  end
end
