# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  define_access(
    :list_repo_autolinks,
    :read_repo_autolinks,
  ) do |access|
    access.ensure_context :repo
    access.allow :repo_autolink_reader
  end

  define_access(
    :create_repo_autolinks,
    :delete_repo_autolinks,
  ) do |access|
    access.ensure_context :repo
    access.allow :repo_autolink_writer
  end

end
