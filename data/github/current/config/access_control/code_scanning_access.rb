# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_codeql_database do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_contents_reader
  end

  define_access :write_codeql_database do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
    # For backwards compatibility with existing workflows, we allow the old scope to be used
    # See https://github.com/github/code-scanning/issues/6977 for context.
    access.allow :security_events_writer
  end

  define_access :delete_codeql_database do |access|
    access.ensure_context :resource
    # This differs from the write_codeql_database access control in that it
    # does not allow the old scope to be used, as there are no existing workflows
    # to account for. We can change this later if needed.
    access.allow :repo_contents_writer
  end

  define_access :read_multi_repository_variant_analysis do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :repo_contents_reader
  end

  define_access :write_multi_repository_variant_analysis do |access|
    access.ensure_context :resource
    access.allow :repo_contents_writer
  end
end
