# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :advisory_database_sync do |access|
    access.ensure_context :resource
    access.allow :internal_advisory_database_reader
  end

  define_access :create_cve_request do |access|
    access.ensure_context :resource, :repo

    access.allow :repo_advisory_admin
  end

  define_access :toggle_private_vulnerability_reporting do |access|
    access.ensure_context :repo
    access.allow :repo_private_vulnerability_reporting_admin
  end

  define_access :create_private_vulnerability_report do |access|
    access.ensure_context :repo
    access.allow :repo_resources_reader do |context|
      user, repo = extract(context, :user, :repo)
      installation = user.try(:installation)
      actor = installation || user
      if restricted_modification_of_public_resources?(actor)
        # Actions should have direct permission on the repo in order to open a
        # PVR. This prevents the Actions App from "breaking out" of the
        # repository in which its workflow is running.
        # https://github.com/github/ecosystem-apps/issues/581
        repo.resources.repository_advisories.writable_by?(actor)
      else
        true
      end
    end
    access.allow :repo_advisory_reporter
  end

  define_access :create_repository_advisory do |access|
    access.ensure_context :repo
    access.allow :repo_advisory_admin
  end

  define_access :create_temporary_fork do |access|
    access.ensure_context :resource

    access.allow :repo_advisory_temporary_fork_admin
    access.allow :repo_advisory_temporary_fork_collaborator
  end

  define_access :get_repository_advisory do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].published? && context[:resource].repository.public? }
    access.allow :repo_advisory_reader
  end

  define_access :list_published_repository_advisories do |access|
    access.ensure_context :resource
    access.allow(:everyone)    { |context| context[:resource].public? }
    access.allow :repo_advisory_lister
  end

  define_access :list_unpublished_repository_advisories do |access|
    access.ensure_context :resource
    access.allow :repo_advisory_lister
  end

  define_access :update_repository_advisory do |access|
    access.ensure_context :resource
    access.allow :repo_advisory_admin
    access.allow :repo_advisory_collaborator
  end

  define_access :get_global_advisory do |access|
    access.ensure_context :resource
    access.allow :global_advisory_reader
  end

  define_access :get_global_advisories do |access|
    access.allow :everyone
  end
end
