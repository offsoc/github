# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :create_discussion do |access|
    access.ensure_context :repo

    access.allow(:discussion_creator)
  end

  define_access :create_discussion_announcement do |access|
    access.ensure_context :repo

    access.allow(:discussion_announcement_creator)
  end

  define_access :show_discussion do |access|
    access.ensure_context :repo

    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:discussion_reader)
  end

  define_access :list_discussions do |access|
    access.ensure_context :resource

    access.allow(:everyone) { |context| context[:resource].public? && context[:resource].discussions_on? }
    access.allow(:repo_discussion_reader)
  end

  define_access :edit_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_editor)
  end

  define_access :delete_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_deleter)
  end

  define_access :answer_discussion, :unanswer_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_answer_toggler)
  end

  define_access :minimize_discussion, :unminimize_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_minimization_toggler)
  end

  define_access :lock_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_locker)
  end

  define_access :unlock_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_unlocker)
  end

  define_access :close_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_closer)
  end

  define_access :reopen_discussion do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_reopener)
  end

  define_access :create_discussion_comment do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_comment_creator)
  end

  define_access :edit_discussion_comment do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_comment_editor)
  end

  define_access :delete_discussion_comment do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_comment_deleter)
  end

  define_access :show_discussion_category do |access|
    resource_must_belong_to_repo(access)

    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:discussion_category_reader)
  end

  define_access :toggle_upvote do |access|
    resource_must_belong_to_repo(access)

    access.allow(:upvote_toggler)
  end

  define_access :add_discussion_poll_vote do |access|
    resource_must_belong_to_repo(access)

    access.allow(:discussion_poll_voter)
  end
end
