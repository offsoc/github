# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_user_files do |access|
    access.ensure_context :file
    access.allow(:everyone) { |context| context[:file].storage_blob_accessible? }
  end

  define_access :read_user_assets do |access|
    access.ensure_context :repo, :file
    access.allow(:everyone) do |context|
      context[:repo].public? &&
        context[:file].storage_blob_accessible?
    end

    access.allow(:repo_resources_reader) { |context| context[:file].storage_blob_accessible? }
  end

  define_access :read_upload_container_user_assets do |access|
    access.ensure_context :resource
    access.allow(:upload_container_resources_reader) { |context| context[:resource].storage_blob_accessible? }
  end

  define_access :write_user_files do |access|
    access.ensure_context :owner
    access.allow :user_file_writer
  end

  define_access :read_repo_file do |access|
    access.ensure_context :repo, :file
    access.allow(:everyone) do |context|
      context[:repo].public? &&
        context[:file].storage_blob_accessible?
    end

    access.allow(:repo_resources_reader) { |context| context[:file].storage_blob_accessible? }
  end

  define_access :write_oauth_app_logo do |access|
    access.allow :authenticated_user
  end

  define_access :mobile_assets_write_asset do |access|
    access.ensure_context :user
    access.allow :github_mobile_apps_upload_asset
  end
end
