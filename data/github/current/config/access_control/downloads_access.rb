# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_downloads do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_resources_reader
  end

  define_access :get_download do |access|
    access.ensure_context :repo, :resource do |repo, dl|
      repo && dl.try(:repository_id) == repo.id
    end
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_resources_reader
  end

  define_access :delete_download do |access|
    access.ensure_context :repo, :resource do |repo, dl|
      repo && dl.try(:repository_id) == repo.id
    end
    access.allow :repo_resources_writer
  end
end
