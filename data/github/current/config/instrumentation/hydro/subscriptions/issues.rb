# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Issues.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("issue.create") do |payload|
    # Only publish the following messages if this Issue is not a Pull Request.
    next if payload[:issue].pull_request?

    serialized_repository_domain, serialized_actor_domain, serialized_repository_owner_domain = T.let(nil, T.untyped)
    ActiveRecord::Base.connected_to(role: :reading) do
      serialized_repository_domain = serializer.repository_domain(payload[:repository])
      serialized_actor_domain = serializer.user_domain(payload[:actor])
      serialized_repository_owner_domain = serializer.user_domain(payload[:repository_owner])
    end

    issue_created_msg = {
      repository: serialized_repository_domain,
      actor: serialized_actor_domain,
      issue: serializer.issue_domain(payload[:issue]),
      repository_owner: serialized_repository_owner_domain,
    }

    publish(issue_created_msg, schema: "github.domain_events.v0.IssueCreated", publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    serialized_actor, serialized_repository, serialized_repository_owner, serialized_issue_creator, serialized_issue_template, serialized_issue_type = T.let(nil, T.untyped)
    ActiveRecord::Base.connected_to(role: :reading) do
      serialized_actor = serializer.user(payload[:actor])
      serialized_repository = serializer.repository(payload[:repository])
      serialized_repository_owner = serializer.user(payload[:repository_owner])
      serialized_issue_creator = serializer.user(payload[:issue_creator])
      serialized_issue_template = serializer.issue_template(payload[:template])
      serialized_issue_type = serializer.issue_type(payload[:issue_type])
    end

    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:issue].body)
    serialized_specimen_title = serializer.specimen_data(payload[:issue].title)
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_issue = serializer.issue(payload[:issue])

    from_template_msg = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_creator: serialized_issue_creator,
      issue_template: serialized_issue_template,
      issue_type: serialized_issue_type,
    }

    publish(from_template_msg, schema: "github.v1.IssueCreateTemplate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :ISSUE,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.IssueCreate"),
      content_database_id: serialized_issue[:id],
      content_global_relay_id: serialized_issue[:global_relay_id],
      content_created_at: serialized_issue[:created_at],
      content_updated_at: serialized_issue[:updated_at],
      title: serialized_specimen_title,
      content: serialized_specimen_body,
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    auto_add_msg = {
      actor_id: serialized_actor[:id],
      repository_id: serialized_repository[:id],
      issue_id: serialized_issue[:id]
    }
    publish(auto_add_msg, topic: "github.memex_automation.v0.IssueCreateEvent", schema: "github.memex_automation.v0.AutoAddEvent")

    publish_secret_scanning_issue(payload, serialized_repository, serialized_repository_owner, serialized_actor)

    # Only publish to the following topics if the repository is public.
    next unless payload[:repository].public?

    issue_create_msg = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_creator: serialized_issue_creator,
      title: payload[:issue].title,
      body: payload[:issue].body,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      specimen_title: serialized_specimen_title,
    }

    publish(issue_create_msg, schema: "github.v1.IssueCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.copilot_summarize") do |payload|
    message = {
      analytics_tracking_id: payload[:analytics_tracking_id],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
    }

    publish(message, schema: "github.v1.CopilotSummarizeIssue")
  end

  subscribe("issue.give_copilot_summary_feedback") do |payload|
    message = {
      analytics_tracking_id: payload[:analytics_tracking_id],
      feedback_choice: payload[:feedback_choice],
      feedback: payload[:feedback],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      header_request_id: payload[:header_request_id],
      prompt_version: payload[:prompt_version],
    }

    publish(message, schema: "github.v1.GiveCopilotIssueSummaryFeedback")
  end

  subscribe("issue.update") do |payload|
    title_change = payload[:previous_title] != payload[:current_title]

    # Skip publishing if the issue is a pull request without a title change.
    next if payload[:issue].pull_request? && !title_change

    serialized_actor, serialized_repository, serialized_repository_owner = T.let(nil, T.untyped)
    ActiveRecord::Base.connected_to(role: :reading) do
      serialized_actor = serializer.user(payload[:actor])
      serialized_repository = serializer.repository(payload[:repository])
      serialized_repository_owner = serializer.user(payload[:repository_owner])
    end

    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:current_body])
    serialized_specimen_title = serializer.specimen_data(payload[:current_title])
    serialized_issue = serializer.issue(payload[:issue])
    serialized_pull_request = serializer.pull_request(payload[:issue].try(:pull_request))
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)

    base_issue_update_payload = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      previous_title: payload[:previous_title],
      current_title: payload[:current_title],
      previous_body: payload[:previous_body],
      current_body: payload[:current_body],
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      specimen_title: serialized_specimen_title,
    }

    if title_change
      issue_update_v2_msg = base_issue_update_payload.merge(pull_request: serialized_pull_request)
      publish(issue_update_v2_msg, schema: "github.v2.IssueUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end

    # Only publish the following messages if this Issue is not a Pull Request.
    next if payload[:issue].pull_request?

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :ISSUE,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.IssueUpdate"),
      content_database_id: serialized_issue[:id],
      content_global_relay_id: serialized_issue[:global_relay_id],
      content_created_at: serialized_issue[:created_at],
      content_updated_at: serialized_issue[:updated_at],
      title: serialized_specimen_title,
      content: serialized_specimen_body,
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    auto_add_msg = {
      actor_id: serialized_actor[:id],
      repository_id: serialized_repository[:id],
      issue_id: serialized_issue[:id]
    }
    publish(auto_add_msg, topic: "github.memex_automation.v0.IssueUpdateEvent", schema: "github.memex_automation.v0.AutoAddEvent")

    publish_secret_scanning_issue(payload, serialized_repository, serialized_repository_owner, serialized_actor)

    # Only publish to the following topics if the repository is public.
    next unless payload[:repository].public?

    issue_update_v1_msg = base_issue_update_payload.merge(issue_updater: serializer.user(payload[:issue_updater]))

    publish(issue_update_v1_msg, schema: "github.v1.IssueUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.events.reopened") do |payload|
    # Only publish if the issue is not a pull request
    next if payload[:issue].pull_request?

    serialized_actor = serializer.user(payload[:actor])
    serialized_issue = serializer.issue(payload[:issue])
    serialized_repository = serializer.repository(payload[:repository])
    issue_msg = {
      actor: serialized_actor,
      issue: serialized_issue,
      repository: serialized_repository,
      repository_owner: serializer.user(payload[:repository_owner]),
    }
    publish(issue_msg, schema: "github.v1.IssueReopen", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.events.closed") do |payload|
    # Only publish if the issue is not a pull request
    next if payload[:issue].pull_request?

    serialized_actor, serialized_repository, serialized_issue_creator = T.let(nil, T.untyped)
    ActiveRecord::Base.connected_to(role: :reading) do
      serialized_actor = serializer.user(payload[:actor])
      serialized_repository = serializer.repository(payload[:repository])
      serialized_issue_creator = serializer.user(payload[:issue].user)
    end

    serialized_issue = serializer.issue(payload[:issue])

    issue_close_msg = {
      actor: serialized_actor,
      issue: serialized_issue,
      repository: serialized_repository,
      repository_owner: serializer.user(payload[:repository_owner]),
      issue_creator: serialized_issue_creator,
    }

    publish(issue_close_msg, schema: "github.v1.IssueClose", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.events.converted_to_discussion") do |payload, _event|
    serialized_actor = serializer.user(payload[:actor])
    serialized_issue = serializer.issue(payload[:issue])
    serialized_repository = serializer.repository(payload[:repository])
    issue_converted_to_discussion_event = {
      actor: serialized_actor,
      issue: serialized_issue,
      repository: serialized_repository
    }

    publish(issue_converted_to_discussion_event, schema: "github.v1.IssueConvertedToDiscussion")
  end

  subscribe(/issue.events.(milestoned|demilestoned)/) do |payload, event|
    issue_msg = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      issue: serializer.issue(payload[:issue]),
      milestone: serializer.milestone(payload[:issue].milestone),
      pull_request: serializer.pull_request(payload[:issue].try(:pull_request)),
      action: event
    }
    publish(issue_msg, schema: "github.v1.IssueUpdateMilestone", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/issue.events.(assigned|unassigned)/) do |payload, event|
    issue_msg = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      issue: serializer.issue(payload[:issue]),
      assignees: serializer.users(payload[:assignees]),
      pull_request: serializer.pull_request(payload[:issue].try(:pull_request)),
      action: event
    }

    publish(issue_msg, schema: "github.v1.IssueUpdateAssignee", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe(/issue.events.(labeled|unlabeled)/) do |payload, event|
    issue_msg = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      issue: serializer.issue(payload[:issue]),
      labels: serializer.labels(payload[:labels]),
      pull_request: serializer.pull_request(payload[:issue].try(:pull_request)),
      action: event
    }

    publish(issue_msg, schema: "github.v1.IssueUpdateLabel", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe(/issue.(typed|untyped)/) do |payload, event|
    issue_msg = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      issue: serializer.issue(payload[:issue]),
      issue_type: serializer.issue_type(payload[:issue_type]),
      action: event
    }
    publish(issue_msg, schema: "github.v1.IssueUpdateIssueType")
  end

  subscribe("issue_type.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      issue_type: serializer.issue_type(payload[:issue_type]),
    }

    publish(message, schema: "github.v1.IssueTypeCreate")
  end

  subscribe("issue_type.update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      issue_type: serializer.issue_type(payload[:issue_type]),
    }

    publish(message, schema: "github.v1.IssueTypeUpdate")
  end

  subscribe("issue_type.destroy") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      issue_type: serializer.issue_type(payload[:issue_type]),
    }

    publish(message, schema: "github.v1.IssueTypeDestroy")
  end

  subscribe("repository_issue_type.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      issue_type: serializer.issue_type(payload[:issue_type]),
      enabled: payload[:enabled],
    }

    publish(message, schema: "github.v1.RepositoryIssueTypeCreate")
  end

  subscribe("repository_issue_type.update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      issue_type: serializer.issue_type(payload[:issue_type]),
      enabled: payload[:enabled],
    }

    publish(message, schema: "github.v1.RepositoryIssueTypeUpdate")
  end

  subscribe("repository_issue_type.destroy") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      issue_type: serializer.issue_type(payload[:issue_type]),
      enabled: payload[:enabled],
    }

    publish(message, schema: "github.v1.RepositoryIssueTypeDestroy")
  end

  subscribe("issue_comment.create") do |payload|
    # Only publish the following messages if this Issue is not a Pull Request.
    next if payload[:issue].pull_request?

    serialized_actor, serialized_repository, serialized_repository_owner, serialized_issue_creator = T.let(nil, T.untyped)
    ActiveRecord::Base.connected_to(role: :reading) do
      serialized_actor = serializer.user(payload[:actor])
      serialized_repository = serializer.repository(payload[:repository])
      serialized_repository_owner = serializer.user(payload[:repository_owner])
      serialized_issue_creator = serializer.user(payload[:issue_creator])
    end

    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:issue_comment].body)
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_issue = serializer.issue(payload[:issue])
    serialized_issue_comment = serializer.issue_comment(payload[:issue_comment])

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :ISSUE_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.IssueCommentCreate"),
      content_database_id: serialized_issue_comment[:id],
      content_global_relay_id: serialized_issue_comment[:global_relay_id],
      content_created_at: serialized_issue_comment[:created_at],
      content_updated_at: serialized_issue_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serialized_issue_creator,
      parent_content_database_id: serialized_issue[:id],
      parent_content_global_relay_id: serialized_issue[:global_relay_id],
      parent_content_created_at: serialized_issue[:created_at],
      parent_content_updated_at: serialized_issue[:updated_at],
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    conduit_msg = {
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_comment: serialized_issue_comment,
    }

    publish(conduit_msg, schema: "github.v1.ConduitIssueCommentCreate")

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_issue_comment(payload, serialized_repository, serialized_repository_owner, serialized_actor)

    # Only publish to the following topics if the repository is public.
    next unless payload[:repository].public?

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_creator: serialized_issue_creator,
      issue_comment: serialized_issue_comment,
      body: payload[:issue_comment].body,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
    }

    publish(message, schema: "github.v1.IssueCommentCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue_comment.update") do |payload|
    # Only publish the following messages if this Issue is not a Pull Request.
    next if payload[:issue].pull_request?

    serialized_actor, serialized_repository, serialized_repository_owner, serialized_issue_creator = T.let(nil, T.untyped)
    ActiveRecord::Base.connected_to(role: :reading) do
      serialized_actor = serializer.user(payload[:actor])
      serialized_repository = serializer.repository(payload[:repository])
      serialized_repository_owner = serializer.user(payload[:repository_owner])
      serialized_issue_creator = serializer.user(payload[:issue_creator])
    end

    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:issue_comment].body)
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_issue = serializer.issue(payload[:issue])
    serialized_issue_comment = serializer.issue_comment(payload[:issue_comment])

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :ISSUE_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.IssueCommentUpdate"),
      content_database_id: serialized_issue_comment[:id],
      content_global_relay_id: serialized_issue_comment[:global_relay_id],
      content_created_at: serialized_issue_comment[:created_at],
      content_updated_at: serialized_issue_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serialized_issue_creator,
      parent_content_database_id: serialized_issue[:id],
      parent_content_global_relay_id: serialized_issue[:global_relay_id],
      parent_content_created_at: serialized_issue[:created_at],
      parent_content_updated_at: serialized_issue[:updated_at],
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_issue_comment(payload, serialized_repository, serialized_repository_owner, serialized_actor)

    # Only publish to the following topics if the repository is public.
    next unless payload[:repository].public?

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      issue: serialized_issue,
      issue_creator: serialized_issue_creator,
      issue_comment: serialized_issue_comment,
      spamurai_form_signals: serialized_spamurai_form_signals,
      current_specimen_body: serialized_specimen_body,
      previous_specimen_body: serializer.specimen_data(payload[:previous_body])
    }

    publish(message, schema: "github.v1.IssueCommentUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/issue_comment\.(pinned|unpinned)/) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      state: payload[:state],
      issue_comment: serializer.issue_comment(payload[:issue_comment]),
      issue: serializer.issue(payload[:issue]),
    }

    publish(message, schema: "github.v1.IssueCommentPinUpdated", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue_links.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      source_repository: serializer.repository(payload[:source_repository]),
      source_issue: serializer.issue(payload[:source_issue]),
      target_repository: serializer.repository(payload[:target_repository]),
      target_issue: serializer.issue(payload[:target_issue]),
      link_type: payload[:link_type],
      new_target_issue: payload[:new_target_issue],
    }

    publish(message, schema: "github.v1.IssueLinkCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue_links.delete") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      source_repository: serializer.repository(payload[:source_repository]),
      source_issue: serializer.issue(payload[:source_issue]),
      target_repository: serializer.repository(payload[:target_repository]),
      target_issue: serializer.issue(payload[:target_issue]),
      link_type: payload[:link_type],
    }

    publish(message, schema: "github.v1.IssueLinkDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("issue.pr_connected") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      pull_request_author: serializer.user(payload[:pull_request_author]),
      source: payload[:source],
    }

    publish(message, schema: "github.v1.CloseIssueReferenceConnected")
  end

  subscribe("issue.pr_disconnected") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      issue_repository: serializer.repository(payload[:issue_repository]),
      issue: serializer.issue(payload[:issue]),
      pull_request: serializer.pull_request(payload[:pull_request]),
      pull_request_author: serializer.user(payload[:pull_request_author]),
      source: payload[:source],
    }

    publish(message, schema: "github.v1.CloseIssueReferenceDisconnected")
  end

  def publish_secret_scanning_issue(payload, serialized_repository, serialized_repository_owner, serialized_actor)
    T.bind(self, Hydro::EventForwarder)

    contents = []
    issue = payload[:issue]
    begin
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(payload[:repository])
      if content_scanning.enabled?
        encrypted_title = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(issue.title, issue.id, issue.created_at)
        contents.push({ content_type: :ISSUE_TITLE, content: encrypted_title })  unless encrypted_title.nil?

        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(issue.body, issue.id, issue.created_at)
        contents.push({ content_type: :ISSUE_BODY, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: issue.id,
          content_number: issue.number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(payload[:repository]).issue_scanning_service_flags,
          content_created_at: issue.created_at ? issue.created_at.getutc : nil,
          contents: contents
        }
        publish(scan_msg, topic: "github.secret_scanning.v1.IssueScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Issue Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_issue_create",
        "exception.message": e.message,
      )
    end
  end

  def publish_secret_scanning_issue_comment(payload, serialized_repository, serialized_repository_owner, serialized_actor)
    T.bind(self, Hydro::EventForwarder)

    contents = []
    comment = payload[:issue_comment]
    begin
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(payload[:repository])
      if content_scanning.enabled?
        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(comment.body, comment.id, comment.created_at)
        contents.push({ content_type: :ISSUE_COMMENT, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: comment.id,
          content_number: payload[:issue].number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(payload[:repository]).issue_scanning_service_flags,
          content_created_at: comment.created_at ? comment.created_at.getutc : nil,
          contents: contents
        }
        publish(scan_msg, topic: "github.secret_scanning.v1.IssueCommentScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Issue Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "issue_comment.update",
        "exception.message": e.message,
      )
    end
  end
end
