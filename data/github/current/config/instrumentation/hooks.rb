# typed: true
# frozen_string_literal: true

# Hook related stats

GitHub.subscribe "hook.create" do |_name, _start, _ending, _transaction_id, payload|
  payload[:events].each do |event_type|
    tags = GitHub::TaggingHelper.create_hook_event_tags(event_type)
    GitHub.dogstats.increment("hooks.create", tags: tags + ["hook_type:#{payload[:hook_type]}_hook"])
  end
end

class HookEventSubscriber
  def self.subscribe(*args, &original_block)

    with_stats = proc do |name, start, ending, transaction_id, payload|
      GitHub.dogstats.increment("hooks.triggered.count", tags: ["event_type:#{name}"])
      original_block.call(name, start, ending, transaction_id, payload)
    end

    T.unsafe(GitHub).subscribe(*args, &with_stats)
  end
end

# Integration related events
HookEventSubscriber.subscribe "integration_installation.create" do |_name, start, _ending, _transaction_id, payload|
  # Do not enqueue any delivery jobs for Dependabot installs
  next if payload[:integration_id] == GitHub.dependabot_github_app&.id

  Hook::Event::InstallationEvent.queue(
    action: :created,
    installation_id: payload[:installation_id],
    integration_id: payload[:integration_id],
    actor_id: payload[:installer_id],
    requester_id: payload[:requester_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "integration_installation.repositories_added" do |_name, start, _ending, _transaction_id, payload|
  # Do not enqueue any delivery jobs for Dependabot installs
  next if payload[:integration_id].to_i == GitHub.dependabot_github_app&.id

  Hook::Event::InstallationRepositoriesEvent.queue(
    action: :added,
    installation_id: payload[:installation_id],
    actor_id: payload[:actor_id],
    repositories_added: payload[:repositories_added],
    repository_selection: payload[:repository_selection],
    requester_id: payload[:requester_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "integration_installation.repositories_removed" do |_name, start, _ending, _transaction_id, payload|
  event = Hook::Event::InstallationRepositoriesEvent.new(
    action: :removed,
    installation_id: payload[:installation_id],
    actor_id: payload[:actor_id],
    repositories_removed: payload[:repositories_removed],
    repository_selection: payload[:repository_selection],
    triggered_at: start,
  )
  delivery_system = Hook::DeliverySystem.new(event)
  delivery_system.generate_hookshot_payloads
  delivery_system.deliver_later
end

HookEventSubscriber.subscribe "integration_installation.contact_email_changed" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::InstallationEvent.queue(
    action: :updated,
    installation_id: payload[:installation_id],
    integration_id: payload[:integration_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "integration_installation.version_updated" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::InstallationEvent.queue(
    action: :new_permissions_accepted,
    installation_id: payload[:installation_id],
    integration_id: payload[:integration_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "integration_installation.suspend" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::InstallationEvent.queue(
    action: :suspend,
    installation_id: payload[:installation_id],
    integration_id: payload[:integration_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "integration_installation.unsuspend" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::InstallationEvent.queue(
    action: :unsuspend,
    installation_id: payload[:installation_id],
    integration_id: payload[:integration_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

# Hook Delivery Listeners
HookEventSubscriber.subscribe /\Ahook\.(create|ping)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::PingEvent.queue(hook_id: payload[:hook_id], triggered_at: start) if payload[:webhook]
end

HookEventSubscriber.subscribe "stars.update_count" do |_name, start, _ending, _transaction_id, payload|
  next if spammy_user_acting_outside_own_repos?(payload)
  attrs = payload.slice(:user_id, :starred_id, :starred_type)
  Hook::Event::WatchEvent.queue(attrs.merge(triggered_at: start))
end

HookEventSubscriber.subscribe(/\Astar\.(create|destroy)\Z/) do |_name, start, _ending, _transaction_id, payload|
  next unless payload[:starred_type] == "Repository"
  next if spammy_user_acting_outside_own_repos?(payload)

  attrs = payload.slice(:starred_id, :user_id, :star_id, :action)
  attrs[:triggered_at] = start
  Hook::Event::StarEvent.queue(attrs)
end

HookEventSubscriber.subscribe "deployment.create" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::DeploymentEvent.queue(
    deployment_id: payload[:deployment_id],
    triggered_at: start,
    action: "created",
  )
end

HookEventSubscriber.subscribe "deployment_status.create" do |_name, start, _ending, _transaction_id, payload|
  unless payload[:deployment_status_state] == DeploymentStatus::INACTIVE
    Hook::Event::DeploymentStatusEvent.queue(
      deployment_status_id: payload[:deployment_status_id],
      triggered_at: start,
      action: "created",
    )
  end
end

HookEventSubscriber.subscribe "deployment_protection_rule.requested" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::DeploymentProtectionRuleEvent.queue(
   gate_id: payload[:gate_id],
   check_run_id: payload[:check_run_id],
   specific_app_only: true,
   action: "requested",
  )
end

HookEventSubscriber.subscribe "deployment_review.requested" do |_name, start, _ending, _transaction_id, payload|
  next if spammy_user_acting_outside_own_repos?(payload)
  Hook::Event::DeploymentReviewEvent.queue(
      deployment_status_id: payload[:deployment_status_id],
      triggered_at: start,
      action: :requested,
      )
end

HookEventSubscriber.subscribe /\Adeployment_review\.(approved|rejected)\Z/ do |_name, start, _ending, _transaction_id, payload|
  next if spammy_user_acting_outside_own_repos?(payload)
  Hook::Event::DeploymentReviewEvent.queue(
      action: payload[:action],
      gate_approval_log_id: payload[:gate_approval_log_id],
      triggered_at: start,
      comment: payload[:comment],
      )
end

HookEventSubscriber.subscribe "discussion.create" do |_name, start, _ending, _transaction_id, payload|
  discussion_id, user_id = payload.values_at(:discussion_id, :user_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: :created,
    discussion_id: discussion_id,
    actor_id: user_id ? user_id : User.ghost.id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "discussion.delete" do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id = payload.values_at(:discussion_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: :deleted,
    discussion_id: discussion_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "discussion.update" do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id, old_title, title, old_body, body = payload.values_at(:discussion_id, :actor_id, :old_title, :title, :old_body, :body)
  next if spammy_user_acting_outside_own_repos?(payload)

  changes = {
    old_title: old_title,
    title: title,
    old_body: old_body,
    body: body,
  }

  Hook::Event::DiscussionEvent.queue(
    action: :edited,
    discussion_id: discussion_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "discussion.category_change" do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id, old_category_id, category_id = payload.values_at(
    :discussion_id, :actor_id, :old_category_id, :discussion_category_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: :category_changed,
    discussion_id: discussion_id,
    actor_id: actor_id,
    changes: {
      old_category_id: old_category_id,
      category_id: category_id,
    },
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Adiscussion\.(un)?(pin|lock)\Z/ do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id = payload.values_at(:discussion_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: payload[:action],
    discussion_id: discussion_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Adiscussion\.(un)?answer\Z/ do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id, answer_id = payload.values_at(:discussion_id, :actor_id, :answer_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: payload[:action],
    discussion_id: discussion_id,
    actor_id: actor_id,
    triggered_at: start,
    answer_id: answer_id,
  )
end

HookEventSubscriber.subscribe /\Adiscussion\.(un)?label\Z/ do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id, label_id = payload.values_at(:discussion_id, :actor_id, :label_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: payload[:action],
    discussion_id: discussion_id,
    actor_id: actor_id,
    label_id: label_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Adiscussion\.(close|reopen)\Z/ do |_name, start, _ending, _transaction_id, payload|
  discussion_id, actor_id = payload.values_at(:discussion_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::DiscussionEvent.queue(
    action: payload[:action],
    discussion_id: discussion_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Adiscussion_comment\.(create|update)\Z/ do |_name, start, _ending, _transaction_id, payload|
  next if payload[:wiped]

  comment_id, actor_id, body, old_body = payload.values_at(:discussion_comment_id, :actor_id, :body, :old_body)
  next if spammy_user_acting_outside_own_repos?(payload)

  changes = if old_body
    { body: body, old_body: old_body }
  end

  Hook::Event::DiscussionCommentEvent.queue(
    action: payload[:action],
    comment_id: comment_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "pull_request_review.submit" do |_name, start, _ending, _transaction_id, payload|
  review_id, pull_request_id, pull_request_author_id, repo_id, org_id, actor_id, new_reviewer_was_added = payload.values_at(
    :id, :pull_request_id, :pull_request_author_id, :repo_id, :org_id, :actor_id, :new_reviewer_was_added
  )
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::PullRequestReviewEvent.queue(
    action: :submitted,
    pull_request_review_id: review_id,
    triggered_at: start,
  )

  next unless org_id
  next unless new_reviewer_was_added
  next if pull_request_author_id == actor_id

  QueueMemexProjectItemWebhooksJob.perform_later(
    pull_request_id: pull_request_id,
    issue_id: nil,
    repository_id: repo_id,
    organization_id: org_id,
    actor_id: actor_id,
    changed_field_data_type: "reviewers",
  )
end

HookEventSubscriber.subscribe "pull_request_review.update" do |_name, start, _ending, _transaction_id, payload|
  review_id, changes = payload.values_at(:review_id, :changes)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::PullRequestReviewEvent.queue(
    action: :edited,
    pull_request_review_id: review_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "pull_request_review.dismiss" do |_name, start, _ending, _transaction_id, payload|
  actor_id, review_id = payload.values_at(:actor_id, :review_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::PullRequestReviewEvent.queue(
    action: :dismissed,
    actor_id: actor_id,
    pull_request_review_id: review_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "pull_request_review_comment.submission" do |_name, start, _ending, _transaction_id, payload|
  comment_id, submitted = payload.values_at(:comment_id, :submitted)

  if submitted && !spammy_user_acting_outside_own_repos?(payload)
    Hook::Event::PullRequestReviewCommentEvent.queue(
      action: :created,
      pull_request_review_comment_id: comment_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "pull_request_review_comment.update" do |_name, start, _ending, _transaction_id, payload|
  comment_id, changes, actor_id, submitted = payload.values_at(:comment_id, :changes, :actor_id, :submitted)
  if submitted && !spammy_user_acting_outside_own_repos?(payload)
    Hook::Event::PullRequestReviewCommentEvent.queue(
      action: :edited,
      pull_request_review_comment_id: comment_id,
      changes: changes,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe /\Aregistry_package\.(create|update)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RegistryPackageEvent.queue(
      registry_package_id: payload[:registry_package_id],
      package_version_id: payload[:package_version_id],
      registry_package: payload[:package],
      version: payload[:version],
      package_file: payload[:package_file],
      action: payload[:action],
      actor_id: payload[:actor_id],
      pkg_subtype: payload[:pkg_subtype],
      triggered_at: start)
end

HookEventSubscriber.subscribe /\Apackage\.(create|update)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::PackageEvent.queue(
      registry_package_id: payload[:registry_package_id],
      package_version_id: payload[:package_version_id],
      version: payload[:version],
      registry_package: payload[:package],
      package_file: payload[:package_file],
      action: payload[:action],
      actor_id: payload[:actor_id],
      pkg_subtype: payload[:pkg_subtype],
      triggered_at: start)
end

HookEventSubscriber.subscribe /\Apackagev2\.(create|update)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::PackageV2Event.queue(
      actor_id: payload[:actor_id],
      registry_package: payload[:package],
      version: payload[:version],
      action: payload[:action],
      pkg_subtype: payload[:pkg_subtype],
      triggered_at: Time.now)
end

HookEventSubscriber.subscribe /\Arepository_dispatch\.create\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RepositoryDispatchEvent.queue(
      repository_id: payload[:repository_id],
      action: :created,
      user_action: payload[:action],
      actor_id: payload[:actor_id],
      branch: payload[:branch],
      client_payload: payload[:client_payload],
      triggered_at: start)
end

HookEventSubscriber.subscribe /\Aworkflow_dispatch\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::WorkflowDispatchEvent.queue(
      repository_id: payload[:repository_id],
      actor_id: payload[:actor_id],
      ref: payload[:ref],
      workflow: payload[:workflow],
      inputs: payload[:inputs],
      triggered_at: start)
end

HookEventSubscriber.subscribe /\Aworkflow_run\.status_changed\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::WorkflowRunEvent.queue(
    action: payload[:action],
    run_id: payload[:run_id],
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    actor_id: payload[:actor_id],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "release.create_webhook" do |_name, start, _ending, _transaction_id, payload|
  next if payload[:spammy]

  Hook::Event::ReleaseEvent.queue(
    release_id: payload[:release_id],
    triggered_at: start,
    action: :created,
    actor_id: payload[:actor_id],
  )
end

HookEventSubscriber.subscribe "release.published" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::ReleaseEvent.queue(
    release_id: payload[:release_id],
    triggered_at: start,
    action: :published,
    actor_id: payload[:actor_id],
  )
end

HookEventSubscriber.subscribe "release.unpublish" do |_name, start, _ending, _transaction_id, payload|
  next if payload[:spammy]

  Hook::Event::ReleaseEvent.queue(
    release_id: payload[:release_id],
    triggered_at: start,
    action: :unpublished,
    actor_id: payload[:actor_id],
  )
end

HookEventSubscriber.subscribe "release.prerelease" do |_name, start, _ending, _transaction_id, payload|
  next if payload[:spammy]

  Hook::Event::ReleaseEvent.queue(
    release_id: payload[:release_id],
    triggered_at: start,
    action: :prereleased,
    actor_id: payload[:actor_id],
  )
end

HookEventSubscriber.subscribe "release.release" do |_name, start, _ending, _transaction_id, payload|
  next if payload[:spammy]

  Hook::Event::ReleaseEvent.queue(
    release_id: payload[:release_id],
    triggered_at: start,
    action: :released,
    actor_id: payload[:actor_id],
  )
end

HookEventSubscriber.subscribe "release.update_webhook" do |_name, start, _ending, _transaction_id, payload|
  next if payload[:spammy]

  Hook::Event::ReleaseEvent.queue(
    release_id: payload[:release_id],
    triggered_at: start,
    action: :edited,
    actor_id: payload[:actor_id],
    changes: payload[:changes],
  )
end

HookEventSubscriber.subscribe "repository_advisory.publish" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RepositoryAdvisoryEvent.queue(
    action: :published,
    repository_advisory_id: payload[:repository_advisory_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "repository_advisory.report" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RepositoryAdvisoryEvent.queue(
    action: :reported,
    repository_advisory_id: payload[:repository_advisory_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Arepository_vulnerability_alert\.(create|dismiss|reopen|resolve)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RepositoryVulnerabilityAlertEvent.queue(
      action: payload[:action],
      repository_id: payload[:repo_id],
      alert_id: payload[:alert_id],
      triggered_at: start)
end

HookEventSubscriber.subscribe /\Arepository_vulnerability_alert\./ do |_name, start, _ending, _transaction_id, payload|
  alert_id = payload[:alert_id].presence

  next unless alert_id

  action =
    case payload[:action]
    when :auto_dismiss then :auto_dismissed
    when :auto_reopen then :auto_reopened
    when :create then :created
    when :dismiss then :dismissed
    when :reopen then :reopened
    when :resolve then :fixed
    when :reintroduce then :reintroduced
    end

  next unless action

  Hook::Event::DependabotAlertEvent.queue(
    action: action,
    alert_id: alert_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Asecret_scanning_alert\.(created|resolved|reopened|revoked|validated)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::SecretScanningAlertEvent.queue(
    action: payload[:action],
    repository_id: payload[:repository_id],
    alert_number: payload[:alert_number],
    triggered_at: start)
end

HookEventSubscriber.subscribe /\Asecret_scanning_alert_location\.(created)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::SecretScanningAlertLocationEvent.queue(
    action: payload[:action],
    repository_id: payload[:repository_id],
    alert_number: payload[:alert_number],
    location_id: payload[:location_id],
    triggered_at: start)
end

HookEventSubscriber.subscribe "security_and_analysis" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::SecurityAndAnalysisEvent.queue(
    repository_id: payload[:repository_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
    changes: payload[:changes],
  )
end

HookEventSubscriber.subscribe "page/build.finished" do |_name, start, _ending, _transaction_id, payload|
  page_build_id, status, previous_status = payload.values_at(:page_build_id, :status, :previous_status)
  Hook::Event::PageBuildEvent.queue(page_build_id: page_build_id, triggered_at: start) if status != previous_status
end

HookEventSubscriber.subscribe "commit_comment.create" do |_name, start, _ending, _transaction_id, payload|
  comment_id = payload.values_at(:commit_comment_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::CommitCommentEvent.queue(
    action: :created,
    commit_comment_id: comment_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "issue_comment.create" do |_name, start, _ending, _transaction_id, payload|
  comment_id, actor_id = payload.values_at(:issue_comment_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::IssueCommentEvent.queue(
    action: :created,
    issue_comment_id: comment_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "issue_comment.update" do |_name, start, _ending, _transaction_id, payload|
  actor_id, old_body, comment_id = payload.values_at(:actor_id, :old_body, :issue_comment_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::IssueCommentEvent.queue(
    action: :edited,
    issue_comment_id: comment_id,
    actor_id: actor_id,
    old_body: old_body,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "milestone.create" do |_name, start, _ending, _transaction_id, payload|
  milestone_id, actor_id = payload.values_at(:milestone_id, :actor_id)

  Hook::Event::MilestoneEvent.queue(
    action: :created,
    milestone_id: milestone_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "milestone.close" do |_name, start, _ending, _transaction_id, payload|
  milestone_id, actor_id = payload.values_at(:milestone_id, :actor_id)
  Hook::Event::MilestoneEvent.queue(
    action: :closed,
    milestone_id: milestone_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "milestone.open" do |_name, start, _ending, _transaction_id, payload|
  milestone_id, actor_id = payload.values_at(:milestone_id, :actor_id)
  Hook::Event::MilestoneEvent.queue(
    action: :opened,
    milestone_id: milestone_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "milestone.update" do |_name, start, _ending, _transaction_id, payload|
  milestone_id, changes, actor_id = payload.values_at(:milestone_id, :changes, :actor_id)
  Hook::Event::MilestoneEvent.queue(
    action: :edited,
    milestone_id: milestone_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "repo.access" do |_name, start, _ending, _transaction_id, payload|
  repo_id, actor_id = payload.values_at(:repo_id, :actor_id)

  if payload[:access] == :public
    # TODO: The `PublicEvent` will be deprecated in the future. For now, trigger both events to avoid disrupting integrators.
    Hook::Event::PublicEvent.queue(
      repo_id: repo_id,
      actor_id: actor_id,
      triggered_at: start,
    )
    Hook::Event::RepositoryEvent.queue(
      action: :publicized,
      repository_id: repo_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  else
    Hook::Event::RepositoryEvent.queue(
      action: :privatized,
      repository_id: repo_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "repo.create" do |_name, start, _ending, _transaction_id, payload|
  repo_id, actor_id, fork_parent = payload.values_at(:repo_id, :actor_id, :fork_parent)

  Hook::Event::ForkEvent.queue(fork_repository_id: repo_id, triggered_at: start) if fork_parent
  Hook::Event::RepositoryEvent.queue(
      action: :created,
      repository_id: repo_id,
      actor_id: actor_id,
      triggered_at: start,
  )
end

HookEventSubscriber.subscribe "repo.update" do |_name, start, _ending, _transaction_id, payload|
  if !payload[:changes].empty?
    repo_id, actor_id = payload.values_at(:repo_id, :actor_id)
    Hook::Event::RepositoryEvent.queue(
        action: :edited,
        repository_id: repo_id,
        actor_id: actor_id,
        triggered_at: start,
        changes: payload[:changes],
    )
  end
end

HookEventSubscriber.subscribe "repo.archived" do |_name, start, _ending, _transaction_id, payload|
  repo_id, actor_id = payload.values_at(:repo_id, :actor_id)

  Hook::Event::RepositoryEvent.queue(
      action: :archived,
      repository_id: repo_id,
      actor_id: actor_id,
      triggered_at: start,
  )
end

HookEventSubscriber.subscribe "repo.unarchived" do |_name, start, _ending, _transaction_id, payload|
  repo_id, actor_id = payload.values_at(:repo_id, :actor_id)

  Hook::Event::RepositoryEvent.queue(
      action: :unarchived,
      repository_id: repo_id,
      actor_id: actor_id,
      triggered_at: start,
  )
end

HookEventSubscriber.subscribe "repo.transfer" do |_name, start, _ending, _transaction_id, payload|
  repo_id, actor_id = payload.values_at(:repo_id, :actor_id)
  changes = payload.slice(:old_user_id, :owner_was_org)

  Hook::Event::RepositoryEvent.queue(
    action: :transferred,
    repository_id: repo_id,
    actor_id: actor_id,
    triggered_at: start,
    changes: changes,
  )
end

HookEventSubscriber.subscribe "repo.rename" do |_name, start, _ending, _transaction_id, payload|
  repo_id, actor_id = payload.values_at(:repo_id, :actor_id)
  changes = payload.slice(:old_name)

  Hook::Event::RepositoryEvent.queue(
    action: :renamed,
    repository_id: repo_id,
    actor_id: actor_id,
    triggered_at: start,
    changes: changes,
  )
end

HookEventSubscriber.subscribe "ability.grant" do |_name, start, _ending, _transaction_id, payload|
  priority                 = payload[:priority]
  actor_id, actor_type     = payload.values_at(:ability_actor_id, :ability_actor_type)
  subject_id, subject_type = payload.values_at(:ability_subject_id, :ability_subject_type)
  grantor_id               = payload[:grantor_id] || GitHub.context[:actor_id] || actor_id

  if (priority == :direct) && (actor_type == "Team") && (subject_type == "Repository")
    # TODO: The `TeamAddEvent` will be deprecated in the future. For now, trigger both events to avoid disrupting integrators.
    # Team granted access to a repo
    Hook::Event::TeamAddEvent.queue(
      team_id: actor_id,
      repository_id: subject_id,
      triggered_at: start,
    )
    Hook::Event::TeamEvent.queue(
      action: :added_to_repository,
      actor_id: GitHub.context[:actor_id] || actor_id,
      team_id: actor_id,
      repo_id: subject_id,
      triggered_at: start,
    )
  elsif (priority == :direct) && (actor_type == "User") && (subject_type == "Repository")
    # User granted access to a repo
    Hook::Event::MemberEvent.queue(
      action: :added,
      user_id: actor_id,
      repo_id: subject_id,
      actor_id: grantor_id,
      triggered_at: start,
      changes: {
        new_permission: payload[:action],
        new_role_name: payload[:role_name],
      },
    )
  elsif (priority == :direct) && (actor_type == "User") && (subject_type == "Team")
    # User added to a Team
    team = Team.find(subject_id)
    user = User.find(actor_id)
    Hook::Event::MembershipEvent.queue(
      action: :added,
      member_id: user.id,
      member_login: user.display_login,
      team_id: team.id,
      team_name: team.name,
      organization_id: team.organization_id,
      actor_id: grantor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "ability.revoke" do |_name, start, _ending, _transaction_id, payload|
  priority                 = payload[:priority]
  actor_id, actor_type     = payload.values_at(:ability_actor_id, :ability_actor_type)
  subject_id, subject_type = payload.values_at(:ability_subject_id, :ability_subject_type)

  if (priority == :direct) && (actor_type == "User") && (subject_type == "Team")
    # User removed from a Team
    if team = Team.find_by(id: subject_id)
      user = User.find(actor_id)
      Hook::Event::MembershipEvent.queue(
        action: :removed,
        member_id: actor_id,
        member_login: user.display_login,
        team_id: team.id,
        team_name: team.name,
        organization_id: team.organization_id,
        actor_id: GitHub.context[:actor_id] || actor_id,
        triggered_at: start,
      )
    end
  elsif (priority == :direct) && (actor_type == "User") && (subject_type == "Repository")
    # User removed from a repo
    Hook::Event::MemberEvent.queue(
      action: :removed,
      user_id: actor_id,
      repo_id: subject_id,
      actor_id: GitHub.context[:actor_id] || actor_id,
      triggered_at: start,
    )
  elsif (priority == :direct) && (actor_type == "Team") && (subject_type == "Repository")
    # Team removed access to a repo
    Hook::Event::TeamEvent.queue(
      action: :removed_from_repository,
      actor_id: GitHub.context[:actor_id] || actor_id,
      team_id: actor_id,
      repo_id: subject_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe /\Aissue\.(create|transform_to_pull)\Z/ do |_name, start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, user_id, org_id, event_guid = payload.values_at(:issue_id, :pull_request_id, :user_id, :org_id, :event_guid)
  next if spammy_user_acting_outside_own_repos?(payload)

  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: :opened,
      pull_request_id: pull_request_id,
      actor_id: user_id || org_id,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repo_id],
      organization_id: payload[:org_id],
      business_id: payload[:business_id],
    )
  else
    Hook::Event::IssuesEvent.queue(
      action: :opened,
      issue_id: issue_id,
      actor_id: user_id || org_id,
      triggered_at: start,
      event_guid: event_guid,
    )
  end
end

HookEventSubscriber.subscribe /\Aissue\.event\.(closed|reopened)\Z/ do |_name, start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, actor_id = payload.values_at(:issue_id, :pull_request_id, :event, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: event.to_sym,
      pull_request_id: pull_request_id,
      actor_id: actor_id,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      business_id: payload[:business_id],
    )
  else
    Hook::Event::IssuesEvent.queue(
      action: event.to_sym,
      issue_id: issue_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe /\Aissue\.event\.(locked|unlocked)\Z/ do |_name, start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, actor_id = payload.values_at(:issue_id, :pull_request_id, :event, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)
  next if issue_id.nil? && pull_request_id.nil?

  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: event.to_sym,
      pull_request_id: pull_request_id,
      actor_id: actor_id,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      business_id: payload[:business_id],
    )
  else
    Hook::Event::IssuesEvent.queue(
      action: event.to_sym,
      issue_id: issue_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

# Issues that are converted to a discussion have their state updated to `closed`,
# so we should fire an issue closed webhook.
HookEventSubscriber.subscribe "issue.event.converted_to_discussion" do |_name, start, _ending, _transaction_id, payload|
  issue_id, actor_id = payload.values_at(:issue_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::IssuesEvent.queue(
    action: :closed,
    issue_id: issue_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "draft_issue_assignment.create" do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]

  Hook::Event::ProjectsV2ItemEvent.queue(
    action: :edited,
    memex_project_item_id: payload[:memex_project_item_id],
    changed_field_id: payload[:changed_field_id],
    actor_id: payload[:actor_id],
    organization_id: payload[:organization_id],
  )
end

HookEventSubscriber.subscribe "draft_issue.update" do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]
  next unless payload.dig(:changes, :body).present?

  event_attributes = payload
    .slice(:memex_project_item_id, :actor_id, :organization_id)
    .merge(changes: { body: [:from, :to].zip(payload.dig(:changes, :body)).to_h })

  Hook::Event::ProjectsV2ItemEvent.queue(
    action: :edited,
    memex_project_item_id: event_attributes[:memex_project_item_id],
    actor_id: event_attributes[:actor_id],
    organization_id: event_attributes[:organization_id],
    changes: event_attributes[:changes],
  )
end

HookEventSubscriber.subscribe /\Aissue\.event\.(assigned|unassigned)\Z/ do |_name, start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, subject_id, assignee_id, repository_id, organization_id = payload.values_at(
    :issue_id, :pull_request_id, :event, :subject_id, :assignee_id, :repository_id, :organization_id
  )
  next if spammy_user_acting_outside_own_repos?(payload)

  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: event.to_sym,
      pull_request_id: pull_request_id,
      actor_id: subject_id,
      assignee_id: assignee_id,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      business_id: payload[:business_id],
    )
  else
    Hook::Event::IssuesEvent.queue(
      action: event.to_sym,
      issue_id: issue_id,
      actor_id: subject_id,
      assignee_id: assignee_id,
      triggered_at: start,
    )
  end

  QueueMemexProjectItemWebhooksJob.perform_later(
    pull_request_id: pull_request_id,
    issue_id: issue_id,
    repository_id: repository_id,
    organization_id: organization_id,
    actor_id: subject_id,
    changed_field_data_type: "assignees",
  )
end

HookEventSubscriber.subscribe /\Aissue\.event\.(review_requested|review_request_removed)\Z/ do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, event, subject_id, subject_type, actor_id, repository_id, organization_id = payload.values_at(
    :pull_request_id, :event, :subject_id, :subject_type, :actor_id, :repository_id, :organization_id
  )
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::PullRequestEvent.queue(
    action: event.to_sym,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    subject_id: subject_id,
    subject_type: subject_type,
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id],
)

  next unless organization_id

  QueueMemexProjectItemWebhooksJob.perform_later(
    pull_request_id: pull_request_id,
    issue_id: nil,
    repository_id: repository_id,
    organization_id: organization_id,
    actor_id: actor_id,
    changed_field_data_type: "reviewers",
  )
end

HookEventSubscriber.subscribe /\Aissue\.event\.(labeled|unlabeled)\Z/ do |_name, start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, event, actor_id, label_id, repository_id, organization_id = payload.values_at(
    :issue_id, :pull_request_id, :event, :actor_id, :label_id, :repository_id, :organization_id
  )
  next if spammy_user_acting_outside_own_repos?(payload)

  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: event.to_sym,
      pull_request_id: pull_request_id,
      actor_id: actor_id,
      label_id: label_id,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      business_id: payload[:business_id],
    )
  else
    Hook::Event::IssuesEvent.queue(
      action: event.to_sym,
      issue_id: issue_id,
      actor_id: actor_id,
      label_id: label_id,
      triggered_at: start,
    )
  end

  QueueMemexProjectItemWebhooksJob.perform_later(
    pull_request_id: pull_request_id,
    issue_id: issue_id,
    repository_id: repository_id,
    organization_id: organization_id,
    actor_id: actor_id,
    changed_field_data_type: "labels",
  )
end

HookEventSubscriber.subscribe "issue.typed" do |_name, start, _ending, _transaction_id, payload|
  issue_id, actor_id, issue_type_id = payload.values_at(:issue_id, :actor_id, :issue_type_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::IssuesEvent.queue(
    action: :typed,
    issue_id: issue_id,
    actor_id: actor_id,
    issue_type_id: issue_type_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "issue.untyped" do |_name, start, _ending, _transaction_id, payload|
  issue_id, actor_id, issue_type_id = payload.values_at(:issue_id, :actor_id, :issue_type_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::IssuesEvent.queue(
    action: :untyped,
    issue_id: issue_id,
    actor_id: actor_id,
    issue_type_id: issue_type_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Aissue\.event\.(milestoned|demilestoned)\Z/ do |_name, start, _ending, _transaction_id, payload|
  event, issue_id, pull_request_id, actor_id, milestone_id = payload.values_at(:event, :issue_id, :pull_request_id, :actor_id, :milestone_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  # We send both `pull_request` and `issue` events for now. The `pull_request` event
  # was added after the fact so to prevent breaking existing workflows we send both.
  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: event.to_sym,
      pull_request_id: pull_request_id,
      actor_id: actor_id,
      milestone_id: milestone_id,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      business_id: payload[:business_id],
    )
  end
  Hook::Event::IssuesEvent.queue(
    action: event.to_sym,
    issue_id: issue_id,
    actor_id: actor_id,
    milestone_id: milestone_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Aissue\.(delete|transferred|pinned|unpinned)\Z/ do |_name, start, _ending, _transaction_id, payload|
  event, issue_id, actor_id = payload.values_at(:event, :issue_id, :actor_id)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::IssuesEvent.queue(
    action: event.to_sym,
    actor_id: actor_id,
    triggered_at: start,
    issue_id: issue_id,
  )
end

HookEventSubscriber.subscribe "issue.update" do |_name, start, _ending, _transaction_id, payload|
  issue_id, pull_request_id, actor_id, old_title, title, old_body, body = payload.values_at(:issue_id, :pull_request_id, :actor_id, :old_title, :title, :old_body, :body)
  next if spammy_user_acting_outside_own_repos?(payload)

  changes = {
    old_title: old_title,
    title: title,
    old_body: old_body,
    body: body,
  }

  if pull_request_id
    Hook::Event::PullRequestEvent.queue(
      action: :edited,
      pull_request_id: pull_request_id,
      actor_id: actor_id,
      changes: changes,
      triggered_at: start,
      primary_resource: payload[:primary_resource],
      repository_id: payload[:repo_id],
      organization_id: payload[:org_id],
      business_id: payload[:business_id],
    )
  else
    Hook::Event::IssuesEvent.queue(
      action: :edited,
      issue_id: issue_id,
      actor_id: actor_id,
      changes: changes,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe(/\Aclose_issue_reference\.(create|destroy)\Z/) do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]

  actor_id, issue_id, repository_id, organization_id = payload.values_at(
    :actor_id, :issue_id, :repository_id, :organization_id
  )

  QueueMemexProjectItemWebhooksJob.perform_later(
    actor_id: actor_id,
    pull_request_id: nil,
    issue_id: issue_id,
    repository_id: repository_id,
    organization_id: organization_id,
    changed_field_data_type: "linked_pull_requests"
  )
end

HookEventSubscriber.subscribe "label.create" do |_name, start, _ending, _transaction_id, payload|
  label_id, actor_id = payload.values_at(:label_id, :actor_id)

  Hook::Event::LabelEvent.queue(
    action: :created,
    label_id: label_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "label.update" do |_name, start, _ending, _transaction_id, payload|
  label_id, actor_id, changes = payload.values_at(:label_id, :actor_id, :changes)
  Hook::Event::LabelEvent.queue(
    action: :edited,
    label_id: label_id,
    actor_id: actor_id,
    changes:  changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "pull_request.synchronize" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id, before, after = payload.values_at(:pull_request_id, :actor_id, :before, :after)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::PullRequestEvent.queue(
    action: :synchronize,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    before: before,
    after: after,
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe "pull_request.change_base" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id, before_base_ref, before_base_sha, after_base_ref, after_base_sha = payload.values_at(:pull_request_id, :actor_id, :before_base_ref, :before_base_sha, :after_base_ref, :after_base_sha)
  next if spammy_user_acting_outside_own_repos?(payload)

  Hook::Event::PullRequestEvent.queue(
    action: :edited,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    primary_resource: payload[:primary_resource],
    changes: {
      old_base_ref: before_base_ref,
      old_base_sha: before_base_sha,
      base_ref: after_base_ref,
      base_sha: after_base_sha,
      triggered_at: start,
      repository_id: payload[:repo_id],
      organization_id: payload[:org_id],
      business_id: payload[:business_id],
    },
  )
end

HookEventSubscriber.subscribe "pull_request.ready_for_review" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id = payload.values_at(:pull_request_id, :actor_id)
  Hook::Event::PullRequestEvent.queue(
    action: :ready_for_review,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe "pull_request.converted_to_draft" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id = payload.values_at(:pull_request_id, :actor_id)
  Hook::Event::PullRequestEvent.queue(
    action: :converted_to_draft,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe "pull_request.auto_merge_enabled" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id = payload.values_at(:pull_request_id, :actor_id)
  Hook::Event::PullRequestEvent.queue(
    action: :auto_merge_enabled,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe "pull_request.auto_merge_disabled" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id, reason = payload.values_at(:pull_request_id, :actor_id, :reason)
  Hook::Event::PullRequestEvent.queue(
    action: :auto_merge_disabled,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start,
    reason: reason,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe "pull_request.enqueued" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id = payload.values_at(:pull_request_id, :actor_id)
  Hook::Event::PullRequestEvent.queue(
    action: :enqueued,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe "pull_request.dequeued" do |_name, start, _ending, _transaction_id, payload|
  pull_request_id, actor_id, reason = payload.values_at(:pull_request_id, :actor_id, :reason)

  Hook::Event::PullRequestEvent.queue(
    action: :dequeued,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start,
    reason: reason,
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repo_id],
    organization_id: payload[:org_id],
    business_id: payload[:business_id],
)
end

HookEventSubscriber.subscribe /\Apull_request_review_thread\.(resolved|unresolved)\Z/ do |_name, start, _ending, _transaction_id, payload|
  thread_id, pull_request_id, actor_id, action = payload.values_at(:thread_id, :pull_request_id, :actor_id, :action)

  Hook::Event::PullRequestReviewThreadEvent.queue(
    action: action.to_sym,
    thread_id: thread_id,
    pull_request_id: pull_request_id,
    actor_id: actor_id,
    triggered_at: start
  )
end

HookEventSubscriber.subscribe "wiki.push" do |_name, start, _ending, _transaction_id, payload|
  actor_id, repo_id, updates = payload.values_at(:actor_id, :repo_id, :updates)
  Hook::Event::GollumEvent.queue(
    actor_id: actor_id,
    repository_id: repo_id,
    updates: updates,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "user.create" do |_name, start, _ending, _transaction_id, payload|
  if GitHub.user_hooks_enabled?
    user_id, actor_id = payload.values_at(:user_id, :actor_id)
    Hook::Event::UserEvent.queue(
      action: :created,
      user_id: user_id,
      triggered_at: start,
      actor_id: actor_id,
    )
  end
end

HookEventSubscriber.subscribe "org.create" do |_name, start, _ending, _transaction_id, payload|
  if GitHub.extended_org_hooks_enabled?
    actor_id, org_id = payload.values_at(:actor_id, :org_id)
    Hook::Event::OrganizationEvent.queue(
      action: :created,
      actor_id: actor_id,
      organization_id: org_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "org.add_member" do |_name, start, _ending, _transaction_id, payload|
  actor_id, user_id, org_id = payload.values_at(:actor_id, :user_id, :org_id)
  Hook::Event::OrganizationEvent.queue(
    action: :member_added,
    actor_id: actor_id,
    user_id: user_id,
    organization_id: org_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "org.remove_member" do |_name, start, _ending, _transaction_id, payload|
  actor_id, user_id, org_id = payload.values_at(:actor_id, :user_id, :org_id)
  Hook::Event::OrganizationEvent.queue(
    action: :member_removed,
    actor_id: actor_id,
    user_id: user_id,
    organization_id: org_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "org.invite_member" do |_name, start, _ending, _transaction_id, payload|
  actor_id, org_id, invitation_id, user_id = payload.values_at(:actor_id, :org_id, :invitation_id, :user_id)
  Hook::Event::OrganizationEvent.queue(
    action: :member_invited,
    actor_id: actor_id,
    invitation_id: invitation_id,
    organization_id: org_id,
    user_id: user_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "org.rename" do |_name, start, _ending, _transaction_id, payload|
  org_id, actor_id = payload.values_at(:org_id, :actor_id)
  changes = payload.slice(:old_login)

  Hook::Event::OrganizationEvent.queue(
    action: :renamed,
    organization_id: org_id,
    actor_id: actor_id,
    triggered_at: start,
    changes: changes,
  )

  Hook::Event::InstallationTargetEvent.queue(
    actor_id: actor_id,
    changes: changes,
    target_id: org_id,
    target_type: "Organization",
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "user.rename" do |_name, start, _ending, _transaction_id, payload|
  user_id, actor_id = payload.values_at(:user_id, :actor_id)
  changes = payload.slice(:old_login)

  Hook::Event::InstallationTargetEvent.queue(
    actor_id: actor_id,
    changes: changes,
    target_id: user_id,
    target_type: "User",
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "business.rename_slug" do |_name, start, _ending, _transaction_id, payload|
  business_id, actor_id = payload.values_at(:business_id, :actor_id)
  changes = payload.slice(:slug_was)

  Hook::Event::InstallationTargetEvent.queue(
    actor_id: actor_id,
    changes: changes,
    target_id: business_id,
    target_type: "Business",
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "repo.update_member" do |_name, start, _ending, _transaction_id, payload|
  actor_id, user_id, repo_id, old_permission, new_permission = payload.values_at(:actor_id, :user_id, :repo_id, :old_repo_permission, :new_repo_permission)

  changes = {
    old_permission: old_permission,
    new_permission: new_permission,
  }

  Hook::Event::MemberEvent.queue(
    action: :edited,
    actor_id: actor_id,
    user_id: user_id,
    repo_id: repo_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project.create" do |_name, start, _ending, _transaction_id, payload|
  project_id, actor_id, org_id = payload.values_at(:project_id, :actor_id, :org_id)

  if payload[:project_kind] == "MemexProject"
    next if GitHub.flipper.enabled?(:projects_classic_migration_disable_webhooks) && MemexProject::Migrator.migrating?
    next unless org_id
    Hook::Event::ProjectsV2Event.queue(
      action: :created,
      project_id: project_id,
      actor_id: actor_id,
      org_id: org_id
    )
  else
    Hook::Event::ProjectEvent.queue(
      action: :created,
      project_id: project_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "project.update" do |_name, start, _ending, _transaction_id, payload|
  project_id, actor_id, changes, org_id = payload.values_at(:project_id, :actor_id, :changes, :org_id)

  if payload[:project_kind] == "MemexProject"
    next unless org_id
    next unless changes
    next unless changes.has_key?(:title) || changes.has_key?(:description) || changes.has_key?(:short_description)
    Hook::Event::ProjectsV2Event.queue(
      action: :edited,
      project_id: project_id,
      actor_id: actor_id,
      changes: changes,
      org_id: org_id,
    )
  else
    next unless changes.has_key?(:name) || changes.has_key?(:body)

    Hook::Event::ProjectEvent.queue(
      action: :edited,
      project_id: project_id,
      actor_id: actor_id,
      changes: changes,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "project.close" do |_name, start, _ending, _transaction_id, payload|
  project_id, actor_id, org_id = payload.values_at(:project_id, :actor_id, :org_id)

  if payload[:project_kind] == "MemexProject"
    next unless org_id
    Hook::Event::ProjectsV2Event.queue(
      action: :closed,
      project_id: project_id,
      actor_id: actor_id,
      org_id: org_id
    )
  else
    Hook::Event::ProjectEvent.queue(
      action: :closed,
      project_id: project_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe /\Aproject.(visibility_public|visibility_private)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  project_kind, project_id, actor_id, org_id, changes = payload.values_at(
    :project_kind, :project_id, :actor_id, :org_id, :changes
  )
  next unless project_kind == "MemexProject"
  next unless org_id

  Hook::Event::ProjectsV2Event.queue(
    action: :edited,
    project_id: project_id,
    actor_id: actor_id,
    org_id: org_id,
    changes: changes,
  )
end

HookEventSubscriber.subscribe "project.open" do |_name, start, _ending, _transaction_id, payload|
  project_id, actor_id, org_id = payload.values_at(:project_id, :actor_id, :org_id)

  if payload[:project_kind] == "MemexProject"
    next unless org_id
    Hook::Event::ProjectsV2Event.queue(
      action: :reopened,
      project_id: project_id,
      actor_id: actor_id,
      org_id: org_id
    )
  else
    Hook::Event::ProjectEvent.queue(
      action: :reopened,
      project_id: project_id,
      actor_id: actor_id,
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "project.soft_delete" do |_name, _start, _ending, _transaction_id, payload|
  project_kind, project_id, actor_id, org_id = payload.values_at(:project_kind, :project_id, :actor_id, :org_id)

  next unless project_kind == "MemexProject"
  next unless org_id

  Hook::Event::ProjectsV2Event.queue(
    action: :deleted,
    project_id: project_id,
    actor_id: actor_id,
    org_id: org_id
  )
end

HookEventSubscriber.subscribe "project_column.create" do |_name, start, _ending, _transaction_id, payload|
  project_column_id, actor_id = payload.values_at(:project_column_id, :actor_id)

  Hook::Event::ProjectColumnEvent.queue(
    action: :created,
    project_column_id: project_column_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project_column.update" do |_name, start, _ending, _transaction_id, payload|
  project_column_id, actor_id, changes = payload.values_at(:project_column_id, :actor_id, :changes)

  next unless changes[:name].present?

  Hook::Event::ProjectColumnEvent.queue(
    action: :edited,
    project_column_id: project_column_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project_column.move" do |_name, start, _ending, _transaction_id, payload|
  project_column_id, actor_id, after_id = payload.values_at(:project_column_id, :actor_id, :after_id)

  Hook::Event::ProjectColumnEvent.queue(
    action: :moved,
    project_column_id: project_column_id,
    actor_id: actor_id,
    after_id: after_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project_card.create" do |_name, start, _ending, _transaction_id, payload|
  project_card_id, actor_id = payload.values_at(:project_card_id, :actor_id)

  Hook::Event::ProjectCardEvent.queue(
    action: :created,
    project_card_id: project_card_id,
    actor_id: actor_id,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project_card.update" do |_name, start, _ending, _transaction_id, payload|
  project_card_id, actor_id, changes = payload.values_at(:project_card_id, :actor_id, :changes)

  Hook::Event::ProjectCardEvent.queue(
    action: :edited,
    project_card_id: project_card_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project_card.convert" do |_name, start, _ending, _transaction_id, payload|
  project_card_id, actor_id, changes = payload.values_at(:project_card_id, :actor_id, :changes)

  Hook::Event::ProjectCardEvent.queue(
    action: :converted,
    project_card_id: project_card_id,
    actor_id: actor_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "project_card.move" do |_name, start, _ending, _transaction_id, payload|
  project_card_id, actor_id, after_id, changes = payload.values_at(:project_card_id, :actor_id, :after_id, :changes)

  Hook::Event::ProjectCardEvent.queue(
    action: :moved,
    project_card_id: project_card_id,
    actor_id: actor_id,
    after_id: after_id,
    changes: changes,
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Amemex_project_item\.(create)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]
  next if GitHub.flipper.enabled?(:projects_classic_migration_disable_webhooks) && MemexProject::Migrator.migrating?

  Hook::Event::ProjectsV2ItemEvent.queue(
    action: :created,
    memex_project_item_id: payload[:memex_project_item_id],
    actor_id: payload[:actor_id],
    organization_id: payload[:organization_id]
  )
end

HookEventSubscriber.subscribe /\Amemex_project_item\.(reorder)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]

  Hook::Event::ProjectsV2ItemEvent.queue(
    action: :reordered,
    memex_project_item_id: payload[:memex_project_item_id],
    actor_id: payload[:actor_id],
    organization_id: payload[:organization_id],
    changes: payload[:changes]
  )
end

HookEventSubscriber.subscribe /\Amemex_project_item\.(update)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]

  priority_only_changes = payload
    .dig(:changes)
    .except(:updated_at, :priority, :priority_numerator, :priority_denominator)
    .empty?
  next if priority_only_changes

  archived_at_changes = payload.dig(:changes).dig(:archived_at)
  content_type_changes = payload.dig(:changes).dig(:content_type)

  action, changes = if archived_at_changes.present?
    [
      archived_at_changes.first.nil? ? :archived : :restored,
      { archived_at: [:from, :to].zip(archived_at_changes.map { |dt| dt&.iso8601 }).to_h },
    ]
  elsif content_type_changes.present?
    [
      :converted,
      { content_type: [:from, :to].zip(content_type_changes).to_h },
    ]
  else
    [
      :edited,
      nil
    ]
  end

  if changes.present?
    Hook::Event::ProjectsV2ItemEvent.queue(
      action: action,
      memex_project_item_id: payload[:memex_project_item_id],
      actor_id: payload[:actor_id],
      organization_id: payload[:organization_id],
      changed_field_id: payload[:changed_field_id],
      changes: changes
    )
  # If changes are not present, a changed_field_id is required
  elsif payload.dig(:changed_field_id).present?
    Hook::Event::ProjectsV2ItemEvent.queue(
      action: action,
      memex_project_item_id: payload[:memex_project_item_id],
      actor_id: payload[:actor_id],
      organization_id: payload[:organization_id],
      changed_field_id: payload[:changed_field_id]
    )
  end
end

HookEventSubscriber.subscribe /\Amemex_project_column_value\.(create|update|delete)\Z/ do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:organization_id]
  next if GitHub.flipper.enabled?(:projects_classic_migration_disable_webhooks) && MemexProject::Migrator.migrating?

  Hook::Event::ProjectsV2ItemEvent.queue(
    action: :edited,
    memex_project_item_id: payload[:memex_project_item_id],
    changed_field_id: payload[:changed_field_id],
    actor_id: payload[:actor_id],
    organization_id: payload[:organization_id],
    changes: payload[:changes]
  )
end

HookEventSubscriber.subscribe "memex_project_status.create" do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:org_id]

  Hook::Event::ProjectsV2StatusUpdateEvent.queue(
    action: :created,
    memex_project_status_id: payload[:memex_project_status_id],
    actor_id: payload[:actor_id],
    org_id: payload[:org_id]
  )
end

HookEventSubscriber.subscribe "memex_project_status.update" do |_name, _start, _ending, _transaction_id, payload|
  next unless payload[:org_id]

  Hook::Event::ProjectsV2StatusUpdateEvent.queue(
    action: :edited,
    memex_project_status_id: payload[:memex_project_status_id],
    actor_id: payload[:actor_id],
    org_id: payload[:org_id],
    changes: payload[:changes]
  )
end

# We disallow spammy users from triggering webhooks if they are operating
# outside of repos they have been granted write access to
#
# payload - Hash of data to be sent to the webhook
#
# Returns Boolean
def spammy_user_acting_outside_own_repos?(payload)
  payload[:spammy] && !payload[:allowed]
end

HookEventSubscriber.subscribe "org.block_user" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::OrgBlockEvent.queue({
    org_id: payload[:org_id],
    blocked_user_id: payload[:blocked_user_id],
    actor_id: payload[:actor_id],
    action: :blocked,
    triggered_at: start,
  })
end

HookEventSubscriber.subscribe "org.unblock_user" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::OrgBlockEvent.queue({
    org_id: payload[:org_id],
    blocked_user_id: payload[:blocked_user_id],
    actor_id: payload[:actor_id],
    action: :unblocked,
    triggered_at: start,
  })
end

# Marketplace hook events
HookEventSubscriber.subscribe /marketplace\_purchase\..*/ do |name, start, _ending, _transaction_id, payload|
  Hook::Event::MarketplacePurchaseEvent.queue \
    payload.merge(action: name.split(".").last, triggered_at: start)
end

# Sponsors hook events
HookEventSubscriber.subscribe "sponsors.sponsor_sponsorship_payment_complete" do |_name, _start, _ending, _transaction_id, payload|
  if payload[:first_payment] && !payload[:is_concurrent_payment]
    Hook::Event::SponsorshipEvent.queue(
      action: :created,
      sponsorship_id: payload[:sponsorship_id],
      actor_id: payload[:actor_id],
      current_tier_id: payload[:current_tier_id],
    )
  end
end

HookEventSubscriber.subscribe "sponsors.sponsor_sponsorship_cancel" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::SponsorshipEvent.queue(
    action: :cancelled,
    sponsorship_id: payload[:sponsorship_id],
    actor_id: payload[:actor_id],
    current_tier_id: payload[:current_tier_id],
  )
end

HookEventSubscriber.subscribe "sponsors.sponsor_sponsorship_pending_cancellation" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::SponsorshipEvent.queue(
    action: :pending_cancellation,
    sponsorship_id: payload[:sponsorship_id],
    actor_id: payload[:actor_id],
    current_tier_id: payload[:current_tier_id],
    pending_change_on: payload[:pending_change_on],
  )
end

HookEventSubscriber.subscribe "sponsors.sponsor_sponsorship_edited" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::SponsorshipEvent.queue(
    action: :edited,
    sponsorship_id: payload[:sponsorship_id],
    actor_id: payload[:actor_id],
    current_tier_id: payload[:current_tier_id],
    changes: payload[:changes],
  )
end

HookEventSubscriber.subscribe "sponsors.sponsor_sponsorship_tier_change" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::SponsorshipEvent.queue(
    action: :tier_changed,
    sponsorship_id: payload[:sponsorship_id],
    actor_id: payload[:actor_id],
    current_tier_id: payload[:current_tier_id],
    previous_tier_id: payload[:previous_tier_id],
  )
end

HookEventSubscriber.subscribe "sponsors.sponsor_sponsorship_pending_tier_change" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::SponsorshipEvent.queue(
    action: :pending_tier_change,
    sponsorship_id: payload[:sponsorship_id],
    actor_id: payload[:actor_id],
    current_tier_id: payload[:current_tier_id],
    pending_change_tier_id: payload[:pending_change_tier_id],
    pending_change_on: payload[:pending_change_on],
  )
end

# Check related events
HookEventSubscriber.subscribe "check_suite.request" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckSuiteEvent.queue(
    action: :requested,
    check_suite_id: payload[:check_suite_id],
    specific_app_only: true,
    actor_id: payload[:actor_id],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "check_suite.rerequest" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckSuiteEvent.queue(
    action: :rerequested,
    check_suite_id: payload[:check_suite_id],
    specific_app_only: true,
    actor_id: payload[:actor_id],
    actions_meta: payload[:actions_meta],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "check_suite.complete" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckSuiteEvent.queue(
    action: :completed,
    check_suite_id: payload[:check_suite_id],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "check_run.create" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckRunEvent.queue(
    action: :created,
    check_run_id: payload[:check_run_id],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "check_run.rerequest" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckRunEvent.queue(
    action: :rerequested,
    check_run_id: payload[:check_run_id],
    specific_app_only: true,
    actor_id: payload[:actor_id],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "check_run.request_action" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckRunEvent.queue(
    action: :requested_action,
    check_run_id: payload[:check_run_id],
    specific_app_only: true,
    actor_id: payload[:actor_id],
    requested_action: payload[:requested_action],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "check_run.complete" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::CheckRunEvent.queue(
    action: :completed,
    check_run_id: payload[:check_run_id],
    primary_resource: payload[:primary_resource],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe /\Aworkflow_job\.(queued|in_progress|completed|waiting)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::WorkflowJobEvent.queue(
    action: payload[:action],
    job_id: payload[:job_id],
    triggered_at: start,
    primary_resource: payload[:primary_resource],
    actor_id: payload[:actor_id],
    repository_id: payload[:repository_id],
    organization_id: payload[:organization_id],
    business_id: payload[:business_id]
  )
end

HookEventSubscriber.subscribe "repo.config.enable_anonymous_git_access" do |_name, start, _ending, _transaction_id, payload|
  if GitHub.anonymous_git_access_enabled?
    Hook::Event::RepositoryEvent.queue(
      action: :anonymous_access_enabled,
      repository_id: payload[:repo_id],
      actor_id: payload[:actor_id],
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "repo.config.disable_anonymous_git_access" do |_name, start, _ending, _transaction_id, payload|
  if GitHub.anonymous_git_access_enabled?
    Hook::Event::RepositoryEvent.queue(
      action: :anonymous_access_disabled,
      repository_id: payload[:repo_id],
      actor_id: payload[:actor_id],
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe "repository_import.import" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RepositoryImportEvent.queue(
    status: payload[:status],
    repository_id: payload[:repo_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

if GitHub.enterprise?
  HookEventSubscriber.subscribe "enterprise.config.enable_anonymous_git_access" do |_name, start, _ending, _transaction_id, payload|
    Hook::Event::EnterpriseEvent.queue(
      action: :anonymous_access_enabled,
      actor_id: payload[:actor_id],
      triggered_at: start,
    )
  end

  HookEventSubscriber.subscribe "enterprise.config.disable_anonymous_git_access" do |_name, start, _ending, _transaction_id, payload|
    Hook::Event::EnterpriseEvent.queue(
      action: :anonymous_access_disabled,
      actor_id: payload[:actor_id],
      triggered_at: start,
    )
  end
end

HookEventSubscriber.subscribe("public_key.create") do |_name, start, _, _, payload|
  next unless payload[:repo_id]

  attrs = {
    action: :created,
    triggered_at: start,
    key_id: payload[:public_key_id],
    repository_id: payload[:repo_id],
    actor_id: payload[:actor_id],
  }

  Hook::Event::DeployKeyEvent.queue(attrs)
end

HookEventSubscriber.subscribe "merge_queue_entry.created" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::MergeQueueEntryEvent.queue(
    action: :created,
    merge_queue_entry_id: payload[:merge_queue_entry_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "merge_queue_entry.deleted" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::MergeQueueEntryEvent.queue(
    action: :deleted,
    actor_id: payload[:actor_id],
    merge_queue_entry_id: payload[:merge_queue_entry_id],
    merge_queue_id: payload[:merge_queue_id],
    message: payload[:message],
    pull_request_id: payload[:pull_request_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "merge_group.checks_requested" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::MergeGroupEvent.queue(
    action: :checks_requested,
    merge_group_entry_id: payload[:merge_group_entry_id],
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "merge_group.destroyed" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::MergeGroupEvent.queue(
    action: :destroyed,
    destroyed_reason: payload[:reason],
    merge_group_props: payload.slice(
      :pull_request_id,
      :qualified_head_ref,
      :head_sha,
      :base_sha,
    ),
    actor_id: payload[:actor_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "protected_branch.create" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::BranchProtectionRuleEvent.queue(
    action: :created,
    authorized_actor_names: payload[:authorized_actor_names],
    protected_branch_id: payload[:protected_branch_id],
    actor_id: payload[:user_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe "protected_branch.update" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::BranchProtectionRuleEvent.queue(
    action: :edited,
    authorized_actor_names: payload[:authorized_actor_names],
    previous_authorized_actor_names: payload[:previous_authorized_actor_names],
    previous_authorized_actors_only: payload[:previous_authorized_actors_only],
    previous_authorized_dismissal_actors_only: payload[:previous_authorized_dismissal_actors_only],
    previous_changes: payload[:previous_changes],
    previous_status_checks_contexts: payload[:previous_status_checks_contexts],
    protected_branch_id: payload[:protected_branch_id],
    actor_id: payload[:user_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Arepository_branch_protection_evaluation\.(disable|enable)\Z/ do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::BranchProtectionConfigurationEvent.queue(
    action: payload[:value],
    actor_id: payload[:user_id],
    repository_id: payload[:repo_id],
    triggered_at: start
  )
end

HookEventSubscriber.subscribe "slash_command.posted" do |_name, _start, _ending, _transaction_id, payload|
  Hook::Event::SlashCommandEvent.queue(
    command: payload[:command],
    subject_type: payload[:subject_type],
    subject_id: payload[:subject_id],
  )
end

HookEventSubscriber.subscribe "repository_ruleset.create" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::RepositoryRulesetEvent.queue(
    action: :created,
    actor_id: GitHub.context[:actor_id] || payload[:actor_id],
    repository_ruleset_id: payload[:ruleset_id],
    triggered_at: start,
  )
end

HookEventSubscriber.subscribe /\Acustom_property_definition\.(create|destroy|update)\Z/ do |name, start, _ending, _transaction_id, payload|
  action = case name.split(".").last
  when "create" then :created
  when "destroy" then :deleted
  when "update" then :updated
  end

  next unless action

  Hook::Event::CustomPropertyEvent.queue(
    action: action,
    triggered_at: start,
    actor_id: GitHub.context[:actor_id],
    org_id: payload[:org_id],
    business_id: payload[:business_id],
    property_name: payload[:property_name],
    definition_id: payload[:definition_id],
  )
end

HookEventSubscriber.subscribe "repo.update_custom_property_values" do |_name, start, _ending, _transaction_id, payload|
  Hook::Event::CustomPropertyValuesEvent.queue(
    triggered_at: start,
    actor_id: GitHub.context[:actor_id],
    organization_id: payload[:org_id],
    repository_id: payload[:repo_id],
    new_property_values: payload[:new_values],
    old_property_values: payload[:old_values],
  )
end

HookEventSubscriber.subscribe /\Aexemption_request\.(create|cancel|complete)\Z/ do |name, start, _ending, _transaction_id, payload|
  action = case name.split(".").last
  when "create" then :created
  when "cancel" then :cancelled
  when "complete" then :completed
  end

  next unless action

  event = case payload[:request_type]
  when "push_ruleset_bypass"
    Hook::Event::ExemptionRequestPushRulesetEvent
  when SecretScanning::Constants::EXEMPTION_REQUEST_TYPE
    Hook::Event::ExemptionRequestSecretScanningEvent
  end

  event.queue(
    action:,
    triggered_at: start,
    exemption_request_id: payload[:exemption_request_id],
    exemption_response_id: payload[:exemption_response_id]
  ) if event
end

HookEventSubscriber.subscribe /\Aexemption_response\.(approve|reject|dismiss)\Z/ do |name, start, _ending, _transaction_id, payload|
  action = case name.split(".").last
  when "approve", "reject" then :response_submitted
  when "dismiss" then :response_dismissed
  end

  next unless action

  event = case payload[:request_type]
  when "push_ruleset_bypass"
    Hook::Event::ExemptionRequestPushRulesetEvent
  when SecretScanning::Constants::EXEMPTION_REQUEST_TYPE
    Hook::Event::ExemptionRequestSecretScanningEvent
  end

  event.queue(
    action:,
    triggered_at: start,
    exemption_request_id: payload[:exemption_request_id],
    exemption_response_id: payload[:exemption_response_id]
  ) if event
end

HookEventSubscriber.subscribe /\Asub_issues\.(sub_issue|parent_issue)_(add|remove)\Z/ do |name, start, _ending, _transaction_id, payload|
  parent_issue_id, child_issue_id, actor_id, audit_only = payload.values_at(:parent_issue_id, :child_issue_id, :actor_id, :audit_only)
  next if spammy_user_acting_outside_own_repos?(payload)

  action = case name.split(".").last
  when "sub_issue_add" then :sub_issue_added
  when "sub_issue_remove" then :sub_issue_removed
  when "parent_issue_add" then :parent_issue_added
  when "parent_issue_remove" then :parent_issue_removed
  end

  Hook::Event::SubIssuesEvent.queue(
    action: action,
    parent_issue_id: parent_issue_id,
    child_issue_id: child_issue_id,
    actor_id: actor_id,
    audit_only: audit_only,
    triggered_at: start,
  )
end
