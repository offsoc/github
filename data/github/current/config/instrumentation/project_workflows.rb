# frozen_string_literal: true

# Helper to queue the workflow job and increment event counter for trigger type
def queue_workflow_job(trigger_type, payload)
  GitHub.dogstats.increment("project_workflows.subscribed_event", tags: ["trigger_type:#{trigger_type}"])

  ProcessProjectWorkflowsJob.perform_later(trigger_type, payload)
end

GitHub.subscribe "issue.event.reopened" do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, actor_id = payload.values_at(:issue_id, :pull_request_id, :actor_id)
  trigger_type = if pull_request_id
    ProjectWorkflow::PR_REOPENED_TRIGGER
  else
    ProjectWorkflow::ISSUE_REOPENED_TRIGGER
  end

  workflow_payload = {
    actor_id: actor_id,
    issue_id: issue_id,
  }
  queue_workflow_job(trigger_type, workflow_payload)
end

GitHub.subscribe "issue.event.closed" do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, actor_id = payload.values_at(:issue_id, :pull_request_id, :actor_id)
  trigger_type = if pull_request_id
    ProjectWorkflow::PR_CLOSED_NOT_MERGED_TRIGGER
  else
    ProjectWorkflow::ISSUE_CLOSED_TRIGGER
  end

  workflow_payload = {
    actor_id: actor_id,
    issue_id: issue_id,
  }
  queue_workflow_job(trigger_type, workflow_payload)
end

GitHub.subscribe "issue.event.merged" do |_name, _start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, actor_id = payload.values_at(:issue_id, :pull_request_id, :actor_id)

  if pull_request_id
    trigger_type = ProjectWorkflow::PR_MERGED_TRIGGER
    workflow_payload = {
      actor_id: actor_id,
      issue_id: issue_id,
    }
    queue_workflow_job(trigger_type, workflow_payload)
  end
end

GitHub.subscribe "project_card.pending_create" do |_name, _start, _ending, _transaction_id, payload|
  content_id, is_pr, actor_id, project_card_id = payload.values_at(:content_id, :is_pr, :actor_id, :project_card_id)

  trigger_type = if is_pr
    ProjectWorkflow::PR_PENDING_CARD_ADDED_TRIGGER
  else
    ProjectWorkflow::ISSUE_PENDING_CARD_ADDED_TRIGGER
  end

  workflow_payload = {
    actor_id: actor_id,
    issue_id: content_id,
    project_card_id: project_card_id,
  }
  queue_workflow_job(trigger_type, workflow_payload)
end

GitHub.subscribe "pull_request_review.submit" do |_name, _start, _ending, _transaction_id, payload|
  next if spammy_user_acting_outside_own_repos?(payload)
  issue_id, state, actor_id = payload.values_at(:issue_id, :state, :actor_id)
  trigger_type = case PullRequestReview.state_name(state)
  when :approved
    ProjectWorkflow::PR_APPROVED_TRIGGER
  when :changes_requested
    ProjectWorkflow::PR_PENDING_APPROVAL_TRIGGER
  end

  next unless trigger_type

  workflow_payload = {
    actor_id: actor_id,
    issue_id: issue_id,
  }
  queue_workflow_job(trigger_type, workflow_payload)
end

GitHub.subscribe "pull_request_review.dismiss" do |_name, _start, _ending, _transaction_id, payload|
  issue_id, actor_id = payload.values_at(:issue_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  trigger_type = ProjectWorkflow::REVIEW_DISMISSED_TRIGGER

  workflow_payload = {
    actor_id: actor_id,
    issue_id: issue_id,
  }

  queue_workflow_job(trigger_type, workflow_payload)
end

# Pushes to a pull request may add or remove code owner required reviews
# depending on the files modified so queue a workflow job when the pull
# request review state changes as part of a synchronize event.
GitHub.subscribe "pull_request.synchronize" do |_name, _start, _ending, _transaction_id, payload|
  next if spammy_user_acting_outside_own_repos?(payload)

  issue_id, actor_id, approved_before, approved_after = payload.values_at(
    :issue_id,
    :actor_id,
    :approved_before,
    :approved_after,
  )

  # approved_before will be nil if the pull request is not subject to code owner
  # required reviews. It will also be nil if synchronize did not happen via a
  # push or the base branch changing which are the only synchronize events we
  # want to handle.
  next if approved_before.nil? || approved_after.nil?

  # Only queue job if approval state changed as part of the pull request
  # synchronization meaning code owner required reviews were either added or
  # removed and so the card should move.
  next if approved_before == approved_after

  trigger_type = if approved_after
    ProjectWorkflow::PR_APPROVED_TRIGGER
  else
    ProjectWorkflow::PR_PENDING_APPROVAL_TRIGGER
  end

  GitHub.dogstats.increment("project_workflows.synchronize_event", tags: ["trigger_type:#{trigger_type}"])

  workflow_payload = {
    actor_id: actor_id,
    issue_id: issue_id,
  }

  queue_workflow_job(trigger_type, workflow_payload)
end
