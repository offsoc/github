# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access(
    :list_org_pre_receive_hooks,
    :read_org_pre_receive_hooks,
  ) do |access|
    access.ensure_context :resource
    access.allow :org_pre_receive_hook_reader
  end

  define_access(
    :update_org_pre_receive_hooks,
    :delete_org_pre_receive_hooks,
  ) do |access|
    access.ensure_context :resource
    access.allow :org_pre_receive_hook_writer
  end

  define_access(
    :list_repo_pre_receive_hooks,
    :read_repo_pre_receive_hooks,
  ) do |access|
    access.ensure_context :repo
    access.allow :repo_pre_receive_hook_reader
  end

  define_access(
    :update_repo_pre_receive_hooks,
    :delete_repo_pre_receive_hooks,
  ) do |access|
    access.ensure_context :repo
    access.allow :repo_pre_receive_hook_writer
  end

end
