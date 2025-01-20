# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_team_discussions do |access|
    access.ensure_context :resource
    access.allow :team_discussions_lister
  end

  define_access :show_team_discussion do |access|
    access.ensure_context :resource
    access.allow :team_discussion_reader
  end

  define_access :create_team_discussion do |access|
    access.ensure_context :resource
    access.allow :team_discussion_creator
  end

  define_access :update_team_discussion do |access|
    access.ensure_context :resource
    access.allow :team_discussion_updater
  end

  define_access :delete_team_discussion do |access|
    access.ensure_context :resource
    access.allow :team_discussion_deleter
  end

  define_access :list_team_discussion_comments do |access|
    access.ensure_context :resource
    access.allow :team_discussion_comments_lister
  end

  define_access :show_team_discussion_comment do |access|
    access.ensure_context :resource
    access.allow :team_discussion_comment_reader
  end

  define_access :create_team_discussion_comment do |access|
    access.ensure_context :resource
    access.allow :team_discussion_comment_creator
  end

  define_access :update_team_discussion_comment do |access|
    access.ensure_context :resource
    access.allow :team_discussion_comment_updater
  end

  define_access :delete_team_discussion_comment do |access|
    access.ensure_context :resource
    access.allow :team_discussion_comment_deleter
  end
end
