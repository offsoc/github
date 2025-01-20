# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  #####
  # Repository Hooks
  #####

  define_access :list_repo_hooks do |access|
    access.ensure_context :repo
    access.allow :repo_admin
    access.allow :repo_hook_reader
  end

  define_access :read_repo_hook do |access|
    access.ensure_context :repo
    access.allow :repo_admin
    access.allow :repo_hook_reader
  end

  define_access :create_repo_hook do |access|
    access.ensure_context :repo
    access.allow :repo_admin
    access.allow :repo_hook_writer
  end

  define_access :update_repo_hook do |access|
    access.ensure_context :repo
    access.allow :repo_admin
    access.allow :repo_hook_writer
  end

  define_access :delete_repo_hook do |access|
    access.ensure_context :repo
    access.allow :repo_admin
    access.allow :repo_hook_admin
  end

  define_access :test_repo_hook do |access|
    access.ensure_context :repo
    access.allow :repo_admin
    access.allow :repo_hook_reader
  end

  #####
  # Organization Hooks
  #####

  define_access :list_org_hooks, :read_org_hook do |access|
    access.ensure_context :resource
    access.allow :org_hook_reader
  end

  define_access(
    :test_org_hook,
    :create_org_hook,
    :update_org_hook,
    :delete_org_hook,
  ) do |access|
    access.ensure_context :resource
    access.allow :org_hook_writer
  end

end
