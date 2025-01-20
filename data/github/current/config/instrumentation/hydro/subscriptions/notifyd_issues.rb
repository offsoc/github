# frozen_string_literal: true

require "notifyd-client"

# Subscriptions for both issues and pull requests are included here.
# Issue and pull request models aren't completely decoupled and this can also
# be seen in the events they instrument. Since this separation is not always
# clear, all these subscriptions are handled together in this file, and they
# use the subject class that makes most sense in each case.
#
# This partitioning by subject could be done differently, as long as each
# subject adapter knows when it's dealing with issues vs pull requests,
# which is a mandatory distinction in the notifications platform (due to
# subscription to thread types). The approach that has been followed is:
# - Issue creation and updates use the Issue model.
# - Pull request creation and updates use the PullRequest model.
# - Both issue and pull request comments share the IssueComment model,
#   because there's no pull request specific model that makes sense here.
#   In this case, the adapter is provided the thread type in the context.
# - PullRequestReview and PullRequestReviewComment models are used for the
#   related events.
# - Issue events use the Issue model.
# - Pull request events use the PullRequest model.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  check_explicit_auto_subscriptions = ->(actor) do
    GitHub::flipper[:notifyd_enable_issues_explicit_auto_subscriptions].enabled?(actor)
  end

  # This event is generated when an issue is created but not the underlying issue
  # of a pull request is created, that is, the issue here is not a pull request.
  subscribe("issue.create") do |payload|
    issue = payload[:issue]
    actor = payload[:actor]
    next unless issue
    # Notifications for an issue that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if issue.importing?
    next if issue.issue_transfer?
    next unless actor

    if issue.pull_request?
      # Pull requests have their own creation event "pull_request.create" and
      # shouldn't be considered here. Let's instrument this to understand this
      # behaviour better.
      GitHub.dogstats.increment("notifyd.issue_create_with_pull_request.count")
      next
    end

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue.id,
      subject_klass: issue.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueOperation::Create.serialize,
        current_body: payload[:body],
        explicit_auto_subscriptions: check_explicit_auto_subscriptions.call(actor),
      }
    )
  end

  # This event is the counterpart to the issue creation for pull requests.
  subscribe("pull_request.create") do |payload|
    pull_request = payload[:pull_request]
    next unless pull_request
    # Notifications for a pull request that is being imported should be
    # discarded as the notifiable activity is not new but merely recreated and
    # thus the notifications during this recreation only generate noise.
    next if pull_request.importing?
    actor = pull_request.user
    next unless actor
    next unless GitHub::flipper[:notifyd_pull_request_notify].enabled?(actor)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: pull_request.id,
      subject_klass: pull_request.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        current_body: pull_request.issue.body,
        operation: Notifyd::Operations::PullRequestOperation::Create.serialize,
      }
    )
  end

  # This event applies to both issues and pull requests and a different
  # subject is used depending on the case.
  subscribe("issue.update") do |payload|
    issue = payload[:issue]
    actor = payload[:actor]
    next unless issue
    # Notifications for an issue that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if issue.importing?
    next unless actor
    previous_body = payload[:previous_body]
    next unless previous_body

    if issue.pull_request?
      next unless GitHub::flipper[:notifyd_pull_request_notify].enabled?(actor)
      pr = issue.pull_request
      next unless pr
      Notifyd::NotifyPublisher.new.async_publish(
        actor_id: actor.id,
        subject_id: pr.id,
        subject_klass: pr.class.name,
        context: {
          actor_id: actor.id,
          actor_login: actor.display_login,
          operation: Notifyd::Operations::PullRequestOperation::Update.serialize,
          previous_body: previous_body,
          current_body: payload[:current_body],
        }
      )
    else
      Notifyd::NotifyPublisher.new.async_publish(
        actor_id: actor.id,
        subject_id: issue.id,
        subject_klass: issue.class.name,
        context: {
          actor_id: actor.id,
          actor_login: actor.display_login,
          operation: Notifyd::Operations::IssueOperation::Update.serialize,
          previous_body: previous_body,
          current_body: payload[:current_body],
          explicit_auto_subscriptions: check_explicit_auto_subscriptions.call(actor),
        }
      )
    end
  end

  # This event applies to both issues and pull requests and the same IssueModel
  # is used in both cases, with the thread type included in the context.
  # For pull requests, this event is generated when a general comment is made,
  # unrelated to any review or file.
  subscribe("issue_comment.create") do |payload|
    issue = payload[:issue]
    issue_comment = payload[:issue_comment]
    actor = payload[:actor]
    next unless issue_comment
    next unless issue
    # Notifications for an issue that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if issue_comment.issue_transfer?
    next if issue_comment.importing?
    next unless actor
    next if issue.pull_request? && !GitHub::flipper[:notifyd_pull_request_notify].enabled?(actor)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue_comment.id,
      subject_klass: issue_comment.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueCommentOperation::Create.serialize,
        current_body: issue_comment.body,
        explicit_auto_subscriptions: check_explicit_auto_subscriptions.call(actor),
      }
    )
  end

  # This event applies to both issues and pull requests and the same IssueModel
  # is used in both cases, with the thread type included in the context.
  subscribe("issue_comment.update") do |payload|
    issue = payload[:issue]
    actor = payload[:actor]
    issue_comment = payload[:issue_comment]
    next unless issue_comment
    # Notifications for an issue that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if issue_comment.importing?
    next unless actor
    next if issue.pull_request? && !GitHub::flipper[:notifyd_pull_request_notify].enabled?(actor)
    previous_body = payload[:previous_body]
    next unless previous_body

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue_comment.id,
      subject_klass: issue_comment.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueCommentOperation::Update.serialize,
        previous_body: previous_body,
        current_body: issue_comment.body,
        explicit_auto_subscriptions: check_explicit_auto_subscriptions.call(actor),
      }
    )
  end

  # This event occurs when a review request is submitted. Note that a review
  # includes a set of review comments. These individual review comments
  # do not not generate their own events when they are part of a review.
  subscribe("pull_request_review.submit") do |payload|
    # Notifications for an review that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if payload[:importing]
    review = payload[:review]
    next unless review
    actor = review.user
    next unless actor

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: review.id,
      subject_klass: review.class.name,
      context: {
        operation: Notifyd::Operations::PullRequestReviewOperation::Create.serialize,
      },
    )
  end

  # This event occurs when a review request is updated. In this case, the event
  # is only generated if the body of the review has changed and is not affected
  # if any of the individual review comments are updated (there's a specific
  # event for that).
  subscribe("pull_request_review.update") do |payload|
    review = payload[:review]
    next unless review
    # Since reviews are updated on submission and `pull_request_review.submit`
    # is  triggered during submission, we want to avoid enqueueing a duplicate
    # notification subscripiton.
    next if review.submitted_at_previously_changed?
    actor = review.user
    next unless actor
    next unless GitHub::flipper[:notifyd_pull_request_review_update_notify].enabled?(actor)
    previous_body = payload[:old_body]
    next unless previous_body

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: review.id,
      subject_klass: review.class.name,
      context: {
        operation: Notifyd::Operations::PullRequestReviewOperation::Update.serialize,
        previous_body: previous_body,
        current_body: review.body,
      },
    )
  end

  # This event occurs when an individual review comment is created (a comment
  # in a file that is not part of a review).
  # rubocop:disable Lint/UnreachableCode
  subscribe("pull_request_review_comment.create") do |payload|
    # TODO(abeaumont): This event is not yet fully supported.
    next

    review_comment = payload[:review_comment]
    next unless review_comment
    # Notifications for an review that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if review_comment.importing?
    actor = payload[:actor]
    next unless actor
    next unless GitHub::flipper[:notifyd_pull_requests_notify].enabled?(actor)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: review_comment.id,
      subject_klass: review_comment.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::PullRequestReviewCommentOperation::Create.serialize,
        current_body: review_comment.body,
      }
    )
  end

  # This event occurs when a review comment is updated, independently of whether
  # the comment was independent or part of a review.
  # rubocop:disable Lint/UnreachableCode
  subscribe("pull_request_review_comment.update") do |payload|
    # TODO(abeaumont): This event is not yet fully supported.
    next

    review_comment = payload[:review_comment]
    next unless review_comment
    # Notifications for an review that is being imported or transferred should
    # be discarded as the notifiable activity is not new but merely recreated
    # and thus the notifications during this recreation only generate noise.
    next if review_comment.importing?
    actor = payload[:actor]
    next unless actor
    next unless GitHub::flipper[:notifyd_pull_requests_notify].enabled?(actor)
    previous_body = review.comment.previous_changes[:body].try(:first)
    next unless previous_body

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: review_comment.id,
      subject_klass: review_comment.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::PullRequestReviewCommentOperation::Create.serialize,
        previous_body: previous_body,
        current_body: review.comment.body,
      }
    )
  end

  # This event is shared between issues and pull requests.
  # We discard this event for pull requests for now.
  subscribe("issue.events.labeled") do |payload|
    issue = payload[:issue]
    event = payload[:event]
    next unless issue
    next unless event
    actor = event.actor
    next unless actor
    next if issue.pull_request?

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue.id,
      subject_klass: issue.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueOperation::Labeled.serialize,
        added_label_id: event.label_id,
        explicit_auto_subscriptions: check_explicit_auto_subscriptions.call(actor),
        event_id: event.id,
      }
    )
  end

  # This event is shared between issues and pull requests.
  # We discard this event for pull requests for now.
  subscribe("issue.events.unlabeled") do |payload|
    issue = payload[:issue]
    event = payload[:event]
    next unless issue
    next unless event
    actor = event.actor
    next unless actor
    next if issue.pull_request?

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue.id,
      subject_klass: issue.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueOperation::Unlabeled.serialize,
        removed_label_id: event.label_id,
        explicit_auto_subscriptions: check_explicit_auto_subscriptions.call(actor),
        event_id: event.id,
      }
    )
  end

  # This event is shared between issues and pull requests.
  subscribe("issue.events.assigned") do |payload|
    issue = payload[:issue]
    event = payload[:event]
    next unless issue
    next unless event
    # The user who did the assignment is available via subject
    actor = event.subject
    next unless actor
    # The issue was assigned to the actor
    assignee = event.actor
    next unless assignee

    if issue.pull_request?
      next unless GitHub::flipper[:notifyd_pull_request_notify].enabled?(actor)
      pr = issue.pull_request
      next unless pr

      Notifyd::NotifyPublisher.new.async_publish(
        actor_id: actor.id,
        subject_id: pr.id,
        subject_klass: pr.class.name,
        context: {
          actor_id: actor.id,
          actor_login: actor.display_login,
          operation: Notifyd::Operations::PullRequestOperation::Assigned.serialize,
          assignee_id: assignee.id,
          event_id: event.id,
        }
      )
    else
      next unless check_explicit_auto_subscriptions.call(actor)

      Notifyd::NotifyPublisher.new.async_publish(
        actor_id: actor.id,
        subject_id: issue.id,
        subject_klass: issue.class.name,
        context: {
          actor_id: actor.id,
          actor_login: actor.display_login,
          operation: Notifyd::Operations::IssueOperation::Assigned.serialize,
          assignee_id: assignee.id,
          explicit_auto_subscriptions: true,
          event_id: event.id,
      }
    )
    end
  end

  # This event is shared between issues and pull requests.
  # We discard this event for pull requests for now.
  # Note that a `pull_request.close` event is also generated.
  subscribe("issue.events.closed") do |payload|
    issue = payload[:issue]
    event = payload[:event]
    next unless issue
    next unless event
    actor = event.actor
    next unless actor
    next unless check_explicit_auto_subscriptions.call(actor)
    next if issue.pull_request?

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue.id,
      subject_klass: issue.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueOperation::Closed.serialize,
        commit_id: event.commit_id, # Optional, it identifies the commit that closed the issue.
        explicit_auto_subscriptions: true,
        event_id: event.id,
      }
    )
  end

  # This event is shared between issues and pull requests.
  # We discard this event for pull requests for now.
  # Note that a `pull_request.reopened` event is also generated.
  subscribe("issue.events.reopened") do |payload|
    issue = payload[:issue]
    event = payload[:event]
    next unless issue
    next unless event
    actor = event.actor
    next unless actor
    next unless check_explicit_auto_subscriptions.call(actor)
    next if issue.pull_request?

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue.id,
      subject_klass: issue.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueOperation::Reopened.serialize,
        explicit_auto_subscriptions: true,
        event_id: event.id,
      }
    )
  end

  # This event only applies to issues, not to pull requests.
  subscribe("issue.events.converted_to_discussion") do |payload|
    issue = payload[:issue]
    event = payload[:event]
    next unless issue
    next unless event
    actor = event.actor
    next unless actor
    next unless check_explicit_auto_subscriptions.call(actor)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: issue.id,
      subject_klass: issue.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::IssueOperation::ConvertedToDiscussion.serialize,
        explicit_auto_subscriptions: true,
        event_id: event.id,
      }
    )
  end

  # This event only applies to pull requests, not issues.
  # A `pull_request_review_request.create` event is also generated, but there's
  # no `event` in its payload, which we need to generate the `notification_id`.
  subscribe("issue.events.review_requested") do |payload|
    pr = payload[:pull_request]
    event = payload[:event]
    next unless pr
    next unless event
    actor = event.actor
    subject = event.subject
    next unless actor
    next unless subject
    next unless GitHub::flipper[:notifyd_pull_request_notify].enabled?(actor)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: pr.id,
      subject_klass: pr.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        operation: Notifyd::Operations::PullRequestOperation::ReviewRequested.serialize,
        reviewer_type: subject.class.name,
        reviewer_id: subject.id,
        event_id: event.id,
      }
    )
  end
end
