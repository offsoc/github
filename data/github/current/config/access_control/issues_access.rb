# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :dashboard do |access|
    access.ensure_context :user
    access.allow :dashboard_user
  end

  define_access :org_issue_dashboard do |access|
    access.allow :dashboard_user do |context|
      user, org = extract(context, :user, :resource)

      user && org && org.direct_or_team_member?(user)
    end
  end

  define_access :private_dashboard do |access|
    access.ensure_context :user
    access.allow :private_dashboard_user
  end

  define_access :list_issues,
                :search_issues do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader)
  end

  define_access :list_issue_timeline do |access|
    issue_must_be_readable(access)

    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
    access.allow(:pull_request_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :list_assignees do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader)
    access.allow(:pull_request_reader)
  end

  define_access :list_issue_events_for_issue do |access|
    issue_must_be_readable(access)

    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
    access.allow(:pull_request_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :list_issue_events_for_repo do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
    access.allow(:pull_request_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :get_issue_event do |access|
    issue_must_be_readable(access)

    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
    access.allow(:pull_request_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :list_repo_labels, :get_repo_label do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader)
    access.allow(:pull_request_reader)
    access.allow(:discussion_label_reader)
  end

  define_access :list_milestones, :get_milestone do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader)
    access.allow(:pull_request_reader)
  end

  define_access :show_issue do |access|
    issue_must_be_readable(access)

    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :read_issue_hovercard do |access|
    issue_must_be_readable(access)

    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :open_issue do |access|
    access.ensure_context :repo
    access.allow :repo_resources_reader do |context|
      user, repo = extract(context, :user, :repo)
      installation = user.try(:installation)
      actor = installation || user
      if restricted_modification_of_public_resources?(actor)
        # Actions should have direct permission on the repo in order to open an
        # issue. This prevents the Actions App from "breaking out" of the
        # repository in which its workflow is running.
        # https://github.com/github/ecosystem-apps/issues/581
        repo.resources.issues.writable_by?(actor)
      else
        true
      end
    end
    access.allow :issue_writer
  end

  define_access :set_collab_only_attributes_on_new_issue do |access|
    access.allow :issue_writer
    access.allow :repo_triagger
  end

  define_access :close_issue do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow(:issue_author)
    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:repo_triagger) { |context| issue_must_match_permission(context, :write) }
  end

  define_access :triage_issue do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)
    access.allow(:issue_author)

    access.allow(:repo_triagger)
    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }
  end

  define_access :edit_issue do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow(:issue_author)
    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }
  end

  define_access :add_assignee,
                :remove_assignee,
                :replace_assignees do |access|
    resource_must_belong_to_repo(access)

    access.allow(:issue_assigner)
  end

  define_access :lock_issue, :unlock_issue do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow :issue_locker
  end

  define_access :transfer_issue do |access|
    access.ensure_context :repo, :issue
    access.allow :issue_transferer
  end

  # Labels and Milestones
  #

  define_access :create_repo_label,
                :update_repo_label,
                :delete_repo_label,
                :create_milestone,
                :update_milestone,
                :delete_milestone do |access|
    access.ensure_context :repo

    access.allow(:issue_writer)
    access.allow(:pull_request_writer)

    access.allow(:repo_resources_writer) do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && !actor.can_have_granular_permissions?
    end
  end

  define_access :prioritize_pinned_issues do |access|
    access.ensure_context :repo

    access.allow(:issue_writer)

    access.allow(:repo_resources_writer) do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && !actor.can_have_granular_permissions?
    end
  end

  define_access :add_label,
                :remove_label,
                :replace_all_labels,
                :remove_all_labels do |access|
    access.ensure_context :resource
    resource_must_belong_to_repo(access)

    access.allow(:resource_labeller)
  end

  define_access :pin,
                :unpin do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }

    access.allow(:repo_resources_writer) do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && !actor.can_have_granular_permissions?
    end
  end

  define_access :list_issue_labels do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) { |context| issue_must_match_permission(context, :read) }
    access.allow(:pull_request_reader) { |context| issue_must_match_permission(context, :read) }
  end

  define_access :list_milestone_issue_labels do |access|
    resource_must_belong_to_repo(access)
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader)
    access.allow(:pull_request_reader)
  end

  # Comments
  #

  define_access :list_all_issues_comments do |access|
    access.ensure_context :repo
    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader)
    access.allow(:pull_request_reader)
  end

  define_access :list_issue_comments, :get_issue_comment do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow(:everyone) { |context| context[:repo].public? }
    access.allow(:issue_reader) do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor &&
      actor.can_have_granular_permissions? &&
      issue_must_match_permission(context, :read)
    end

    access.allow(:pull_request_reader) do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor &&
      actor.can_have_granular_permissions? &&
      issue_must_match_permission(context, :read)
    end

    access.allow :issue_comment_reader
  end

  define_access :create_issue_comment do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)
    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }

    access.allow :repo_contents_reader do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && !actor.can_have_granular_permissions?
    end
  end

  define_access :update_issue_comment do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow :issue_comment_author
    access.allow :repo_owner
    access.allow :repo_admin

    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }
  end

  define_access :delete_issue do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow :repo_admin
    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
  end

  define_access :delete_issue_comment do |access|
    resource_must_belong_to_repo(access)
    issue_must_be_readable(access)

    access.allow :issue_comment_author

    access.allow(:issue_writer) { |context| issue_must_match_permission(context, :write) }
    access.allow(:pull_request_writer) { |context| issue_must_match_permission(context, :write) }

    access.allow :repo_contents_writer do |context|
      user  = extract(context, :user)
      actor = user.try(:installation) || user

      actor && !actor.can_have_granular_permissions?
    end
  end
end
