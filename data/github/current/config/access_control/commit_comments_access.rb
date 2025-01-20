# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_commit_comments do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_metadata_reader
  end

  define_access :v4_list_commit_comments do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :get_commit_comment do |access|
    access.ensure_context :repo, :comment do |repo, comment|
      repo && comment.try(:repository_id) == repo.id
    end
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_metadata_reader
  end

  define_access :v4_get_commit_comment do |access|
    access.ensure_context :repo, :comment do |repo, comment|
      repo && comment.try(:repository_id) == repo.id
    end
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow :repo_contents_reader
  end

  define_access :create_commit_comment do |access|
    access.ensure_context :repo

    access.allow :repo_contents_reader do |context|
      user, repo = extract(context, :user, :repo)
      installation = user.try(:installation)
      actor = installation || user
      if restricted_modification_of_public_resources?(actor)
        # Actions should have direct permission on the repo in order to create
        # a commit comment. This prevents the Actions App from "breaking out"
        # of the repository in which its workflow is running.
        # https://github.com/github/ecosystem-apps/issues/581
        repo.resources.contents.writable_by?(actor)
      else
        true
      end
    end
  end

  define_access :update_commit_comment do |access|
    access.ensure_context :repo, :comment do |repo, comment|
      repo && comment.try(:repository_id) == repo.id
    end
    access.allow :commit_comment_author
    access.allow :repo_contents_writer
    access.allow :repo_owner
  end

  define_access :delete_commit_comment do |access|
    access.ensure_context :repo, :comment do |repo, comment|
      repo && comment.try(:repository_id) == repo.id
    end
    access.allow :commit_comment_author
    access.allow :repo_contents_writer
    access.allow :repo_admin
  end
end
