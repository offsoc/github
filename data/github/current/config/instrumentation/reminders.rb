# frozen_string_literal: true

class ReminderSubscriber
  def self.subscribe(matcher, require_pull_request_id: true, &original_block)
    with_guards = lambda do |name, start, ending, transaction_id, payload|
      GitHub.dogstats.distribution_time("reminders.instrument.dist.time", tags: ["event_type:#{name}"]) do
        return if spammy?(payload)
        return if require_pull_request_id && payload[:pull_request_id].nil?
        original_block.call(name, start, ending, transaction_id, payload)
      end
    end

    GitHub.subscribe(matcher, &with_guards)
  end

  # copied from config/instrumentation/hooks.rb definition of spammy_user_acting_outside_own_repos?
  # which defines it on Object
  private_class_method def self.spammy?(payload)
    payload[:spammy] && !payload[:allowed]
  end
end

ReminderSubscriber.subscribe "issue.event.assigned" do |_name, start, _ending, transaction_id, payload|
  subject_type, actor_id, assignee_id, pull_request_id = payload.values_at(:subject_type, :subject_id, :assignee_id, :pull_request_id)

  # No other subjects can currently be assigned, however lets keep this defensive
  # to avoid any errors if this changes in the future
  if subject_type == "User"
    Reminders::PullRequestAssignedJob.perform_later(
      actor_id: actor_id,
      assignee_id: assignee_id,
      pull_request_id: pull_request_id,
      event_at: start,
      transaction_id: transaction_id,
    )
  end
end

ReminderSubscriber.subscribe "issue.event.review_requested" do |_name, start, _ending, transaction_id, payload|
  actor_id, pull_request_id, subject_id, subject_type = payload.values_at(:actor_id, :pull_request_id, :subject_id, :subject_type)

  case subject_type
  when "User"
    Reminders::UserReviewRequestJob.perform_later(
      actor_id: actor_id,
      requested_reviewer_id: subject_id,
      pull_request_id: pull_request_id,
      event_at: start,
      transaction_id: transaction_id,
    )
  when "Team"
    Reminders::TeamReviewRequestJob.perform_later(
      actor_id: actor_id,
      requested_team_id: subject_id,
      event_at: start,
      pull_request_id: pull_request_id,
      transaction_id: transaction_id,
    )
  end
end

ReminderSubscriber.subscribe "pull_request_review.submit" do |_name, start, _ending, transaction_id, payload|
  Reminders::ReviewSubmissionJob.perform_later(pull_request_review_id: payload[:review_id], event_at: start, transaction_id: transaction_id)
end

ReminderSubscriber.subscribe "issue_comment.create", require_pull_request_id: false do |_name, start, _ending, transaction_id, payload|
  Reminders::IssueCommentJob.perform_later(issue_comment_id: payload[:issue_comment_id], event_at: start, transaction_id: transaction_id)
end

ReminderSubscriber.subscribe "issue.event.merged" do |_name, start, _ending, transaction_id, payload|
  actor_id, pull_request_id = payload.values_at(:actor_id, :pull_request_id)
  Reminders::PullRequestMergedJob.perform_later(pull_request_id: pull_request_id, actor_id: actor_id, event_at: start, transaction_id: transaction_id)
end

ReminderSubscriber.subscribe "pull_request.mergeability", require_pull_request_id: false do |_name, start, _ending, transaction_id, payload|
  next if payload[:mergeable]

  Reminders::PullRequestMergeConflictJob.perform_later(
    pull_request_id: payload[:pull_request_id],
    event_at: start,
    transaction_id: transaction_id,
  )
end

ReminderSubscriber.subscribe "check_run.complete", require_pull_request_id: false do |_name, start, _ending, transaction_id, payload|
  check_run_id = payload[:check_run_id]

  Reminders::CheckRunFailedJob.perform_later(
    check_run_id: check_run_id,
    event_at: start,
    transaction_id: transaction_id,
  )
end

ReminderSubscriber.subscribe "status.created", require_pull_request_id: false do |_name, start, _ending, transaction_id, payload|
  commit_status_id, state, repository_id, sha = payload.values_at(:id, :state, :repository_id, :sha)
  next unless state == Status::FAILURE || state == Status::ERROR

  Reminders::CommitStatusFailedJob.perform_later(
    commit_status_id: commit_status_id,
    repository_id: repository_id,
    sha: sha,
    event_at: start,
    transaction_id: transaction_id,
  )
end
