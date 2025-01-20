# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :create_pull_request_review_comment_reaction,
                :create_commit_comment_reaction,
                :create_discussion_comment_reaction do |access|
    access.ensure_context :user, :resource
    access.allow :reaction_writer
  end

  define_access :create_issue_related_reaction do |access|
    access.ensure_context :user, :resource, :repo
    issue_must_be_readable(access)

    access.allow :reaction_writer
  end

  define_access :create_team_discussion_related_reaction do |access|
    access.ensure_context :user, :resource
    access.allow :team_discussion_reaction_writer
  end

  define_access :create_repository_advisory_related_reaction do |access|
    access.ensure_context :user, :resource, :repo
    access.allow :reaction_writer
  end

  define_access :create_release_reaction do |access|
    access.ensure_context :user, :resource, :repo

    # Release must be published
    access.ensure_context :resource do |resource|
      resource.published?
    end

    access.allow :reaction_writer
  end

  define_access :modify_reaction do |access|
    access.ensure_context :user, :resource, :repo
    access.allow :reaction_writer
  end

  define_access :delete_reaction do |access|
    access.ensure_context :user, :reaction, :resource, :repo
    access.allow(:reaction_writer) do |context|
      user  = context[:user]
      actor = user.try(:installation) || user

      next true if actor.can_have_granular_permissions?
      context[:reaction].user == actor
    end
  end

  define_access :delete_team_discussion_related_reaction do |access|
    access.ensure_context :user, :reaction
    access.allow :team_discussion_reaction_deleter
  end
end
