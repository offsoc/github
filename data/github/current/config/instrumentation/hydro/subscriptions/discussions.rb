# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Discussions.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("repository.enable_discussions") do |payload|
    repo = payload[:repository]

    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
    }.freeze

    publish(message, schema: "github.discussions.v1.EnableDiscussions",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository.disable_discussions") do |payload|
    repo = payload[:repository]

    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
    }.freeze

    publish(message, schema: "github.discussions.v1.DisableDiscussions",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion.create") do |payload|
    discussion = payload[:discussion]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(discussion.author)
    serialized_repository = serializer.repository(discussion.repository)
    serialized_repository_owner = serializer.repository_owner(discussion.repository)
    serialized_discussion = serializer.discussion(discussion)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = discussion.public? ? serializer.specimen_data(discussion.body) : nil
    serialized_specimen_title = discussion.public? ? serializer.specimen_data(discussion.title) : nil
    serialized_discussion_poll = serializer.discussion_poll(discussion.poll)

    message = {
      request_context: serialized_request_context,
      discussion: serialized_discussion,
      category: serializer.discussion_category(discussion.category),
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      specimen_title: serialized_specimen_title,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      body: discussion.body,
      body_html: "#{discussion.body_html}",
      author: serialized_actor,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(discussion.repository).discussion_scanning_service_flags,
      poll: serialized_discussion_poll,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :DISCUSSION,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.discussions.v1.DiscussionCreate"),
      content_database_id: serialized_discussion[:id],
      content_global_relay_id: serialized_discussion[:global_relay_id],
      content_created_at: serialized_discussion[:created_at],
      content_updated_at: serialized_discussion[:updated_at],
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

    publish_secret_scanning_discussion_scan(discussion, serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("discussion.update") do |payload|
    discussion = payload[:discussion]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_repository = serializer.repository(discussion.repository)
    serialized_repository_owner = serializer.repository_owner(discussion.repository)
    serialized_discussion = serializer.discussion(discussion)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = discussion.public? ? serializer.specimen_data(discussion.body) : nil
    serialized_specimen_title = discussion.public? ? serializer.specimen_data(discussion.title) : nil

    message = {
      request_context: serialized_request_context,
      discussion: serialized_discussion,
      current_category: serializer.discussion_category(discussion.category),
      previous_category: serializer.discussion_category(payload[:previous_category]),
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      specimen_title: serialized_specimen_title,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      author: serializer.user(discussion.user),
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(discussion.repository).discussion_scanning_service_flags,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :DISCUSSION,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.discussions.v1.DiscussionUpdate"),
      content_database_id: serialized_discussion[:id],
      content_global_relay_id: serialized_discussion[:global_relay_id],
      content_created_at: serialized_discussion[:created_at],
      content_updated_at: serialized_discussion[:updated_at],
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

    publish_secret_scanning_discussion_scan(discussion, serialized_repository, serialized_repository_owner, serialized_actor)
  end

  subscribe("discussion.delete") do |payload|
    discussion = payload[:discussion]
    repo = discussion.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion: serializer.discussion(discussion),
      category: serializer.discussion_category(discussion.category),
      actor: serializer.user(payload[:actor]),
      author: serializer.user(discussion.user),
      poll: serializer.discussion_poll(discussion.poll),
    }

    if repo
      message[:repository] = serializer.repository(repo)
      message[:repository_owner] = serializer.repository_owner(repo.owner)
    end

    message = message.freeze

    publish(message, schema: "github.discussions.v1.DiscussionDelete",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion.copilot_summarize") do |payload|
    message = {
      analytics_tracking_id: payload[:analytics_tracking_id],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
    }

    publish(message, schema: "github.discussions.v2.CopilotSummarize")
  end

  subscribe("discussion.give_copilot_summary_feedback") do |payload|
    message = {
      analytics_tracking_id: payload[:analytics_tracking_id],
      feedback_choice: payload[:feedback_choice],
      feedback: payload[:feedback],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      header_request_id: payload[:header_request_id],
      prompt_version: payload[:prompt_version]
    }

    publish(message, schema: "github.discussions.v2.GiveCopilotSummaryFeedback")
  end

  subscribe("discussions") do |payload|
    discussion = payload[:discussion]
    actor = payload[:actor]

    request_context = serializer.request_context(GitHub.context.to_hash)
    repo = serializer.repository(payload[:repository])
    repo_owner = serializer.repository_owner(payload[:repository_owner])

    specimen_title = discussion.public? ? serializer.specimen_data(discussion.title) : nil
    specimen_body = discussion.public? ? serializer.specimen_data(discussion.body) : nil

    message = {
      request_context: request_context,
      repository_id: payload[:repository_id],
      repository: repo,
      repository_owner: repo_owner,
      actor_id: payload[:actor_id],
      actor: serializer.user(actor),
      discussion_id: payload[:discussion_id],
      discussion: serializer.discussion(discussion),
      lock_status: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::LockStatus,
        value: payload[:lock_status],
        default: :LOCK_STATUS_UNKNOWN
      ),
      pin_status: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::PinStatus,
        value: payload[:pin_status],
        default: :PIN_STATUS_UNKNOWN
      ),
      announcement: payload[:announcement],
      org_or_repo_level: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::OrgOrRepoLevel,
        value: payload[:org_or_repo_level],
        default: :ORG_OR_REPO_LEVEL_UNKNOWN
      ),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::Action,
        value: payload[:action],
        default: :ACTION_UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
      discussion_format: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::DiscussionFormat,
        value: payload[:discussion_format],
        default: :DISCUSSION_FORMAT_UNKNOWN
      ),
      category_id: payload[:category_id],
      converted_from_issue: payload[:converted_from_issue],
      converted_issue_id: payload[:converted_issue_id],
      specimen_body: specimen_body,
      specimen_title: specimen_title,
      created_from_category_template: payload[:created_from_category_template],
      state: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::State,
        value: payload[:state],
        default: :STATE_UNKNOWN,
      ),
      state_reason: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::Discussions::StateReason,
        value: payload[:state_reason],
        default: :STATE_REASON_UNKNOWN,
      ),
    }.freeze

    publish(message, schema: "github.discussions.v2.Discussions")
  end

  subscribe("discussion.pin") do |payload|
    discussion = payload[:discussion]
    repo = discussion.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(discussion),
      category: serializer.discussion_category(discussion.category),
    }

    if repo
      message[:repository] = serializer.repository(repo)
      message[:repository_owner] = serializer.repository_owner(repo.owner)
    end

    publish(message.freeze, schema: "github.discussions.v1.DiscussionPin",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion.unpin") do |payload|
    discussion = payload[:discussion]
    repo = discussion.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(discussion),
      category: serializer.discussion_category(discussion.category),
    }

    if repo
      message[:repository] = serializer.repository(repo)
      message[:repository_owner] = serializer.repository_owner(repo.owner)
    end

    publish(message.freeze, schema: "github.discussions.v1.DiscussionUnpin",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion.add_label") do |payload|
    discussion = payload[:discussion]
    label = payload[:label]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(discussion),
      label: serializer.label(label)
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionAddLabel",
     publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion.remove_label") do |payload|
    discussion = payload[:discussion]
    label = payload[:label]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(discussion),
      label: serializer.label(label)
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionRemoveLabel",
     publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_label") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      discussion_id: payload[:discussion_id],
      discussion: serializer.discussion(payload[:discussion]),
      actor_id: payload[:actor_id],
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsLabel::Action,
        value: payload[:action],
        default: :UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
      label_id: payload[:label_id]
    }

    publish(message, schema: "github.discussions.v2.DiscussionsLabel")
  end

  subscribe("discussion_reaction.create") do |payload|
    reaction = payload[:reaction]
    discussion = reaction.discussion
    repo = discussion.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(reaction.user),
      discussion: serializer.discussion(discussion),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      author: serializer.user(discussion.user),
      content: reaction.content,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionReactionCreate",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_reaction.delete") do |payload|
    reaction = payload[:reaction]
    discussion = reaction.discussion
    repo = discussion&.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(reaction.user),
      discussion: serializer.discussion(discussion),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo&.owner),
      author: serializer.user(discussion&.user),
      content: reaction.content,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionReactionDestroy",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_reaction") do |payload|
    reaction = payload[:reaction]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.repository_owner(payload[:repository_owner]),
      discussion_id: payload[:discussion_id],
      discussion: serializer.discussion(payload[:discussion]),
      actor_id: payload[:actor_id],
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsReaction::Action,
        value: payload[:action],
        default: :ACTION_UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
      reaction: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsReaction::Reaction,
        value: payload[:reaction],
        default: :REACTION_UNKNOWN
      ),
    }.freeze

    publish(message, schema: "github.discussions.v2.DiscussionsReaction")
  end

  subscribe("discussion_comment.create") do |payload|
    comment = payload[:discussion_comment]
    discussion = comment.discussion

    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_repository = serializer.repository(discussion.repository)
    serialized_repository_owner = serializer.repository_owner(discussion.repository)
    serialized_discussion_comment = serializer.discussion_comment(comment)
    serialized_discussion_comment_author = serializer.user(comment.user)
    serialized_discussion = serializer.discussion(discussion)
    serialized_discussion_author = serializer.user(discussion.user)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = comment.public? ? serializer.specimen_data(comment.body) : nil

    message = {
      request_context: serialized_request_context,
      discussion_comment: serialized_discussion_comment,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      author: serialized_discussion_comment_author,
      discussion: serialized_discussion,
      discussion_author: serialized_discussion_author,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(discussion.repository).discussion_scanning_service_flags,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :DISCUSSION_COMMENT,
      actor: serialized_discussion_comment_author,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.discussions.v1.DiscussionCommentCreate"),
      content_database_id: serialized_discussion_comment[:id],
      content_global_relay_id: serialized_discussion_comment[:global_relay_id],
      content_created_at: serialized_discussion_comment[:created_at],
      content_updated_at: serialized_discussion_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serialized_discussion_author,
      parent_content_database_id: serialized_discussion[:id],
      parent_content_global_relay_id: serialized_discussion[:global_relay_id],
      parent_content_created_at: serialized_discussion[:created_at],
      parent_content_updated_at: serialized_discussion[:updated_at],
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_discussion_comment_scan(comment, serialized_repository, serialized_repository_owner, serialized_discussion_comment_author)
  end

  subscribe("discussion_comment.update") do |payload|
    comment = payload[:discussion_comment]
    discussion = comment.discussion

    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor] || comment.user)
    serialized_repository = serializer.repository(discussion.repository)
    serialized_repository_owner = serializer.repository_owner(discussion.repository)
    serialized_discussion_comment = serializer.discussion_comment(comment)
    serialized_discussion_comment_author = serializer.user(comment.user)
    serialized_discussion = serializer.discussion(discussion)
    serialized_discussion_author = serializer.user(discussion.user)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = comment.public? ? serializer.specimen_data(comment.body) : nil

    message = {
      request_context: serialized_request_context,
      discussion_comment: serialized_discussion_comment,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      actor: serialized_actor,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      author: serialized_discussion_comment_author,
      discussion: serialized_discussion,
      discussion_author: serialized_discussion_author,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(discussion.repository).discussion_scanning_service_flags,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :DISCUSSION_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.discussions.v1.DiscussionCommentUpdate"),
      content_database_id: serialized_discussion_comment[:id],
      content_global_relay_id: serialized_discussion_comment[:global_relay_id],
      content_created_at: serialized_discussion_comment[:created_at],
      content_updated_at: serialized_discussion_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serialized_discussion_author,
      parent_content_database_id: serialized_discussion[:id],
      parent_content_global_relay_id: serialized_discussion[:global_relay_id],
      parent_content_created_at: serialized_discussion[:created_at],
      parent_content_updated_at: serialized_discussion[:updated_at],
      owner: serialized_repository_owner,
      repository: serialized_repository,
      content_visibility: serialized_repository[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    publish_secret_scanning_discussion_comment_scan(comment, serialized_repository, serialized_repository_owner, serialized_discussion_comment_author)
  end

  subscribe("discussion_comment.delete") do |payload|
    comment = payload[:discussion_comment]
    discussion = comment.discussion
    repo = comment.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion_comment: serializer.discussion_comment(comment),
      actor: serializer.user(payload[:actor]),
      author: serializer.user(comment.user),
    }

    if repo
      message[:repository] = serializer.repository(repo)
      message[:repository_owner] = serializer.repository_owner(repo.owner)
    end

    if discussion
      message[:discussion] = serializer.discussion(discussion)
      message[:discussion_author] = serializer.user(discussion.user)
    end

    message = message.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentDelete",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_comment") do |payload|
    repo = payload[:repository]
    discussion = payload[:discussion]
    discussion_comment = payload[:discussion_comment]
    actor = payload[:actor] || discussion_comment.user
    specimen_body = discussion&.public? ? serializer.specimen_data(discussion_comment.body) : nil

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: repo&.id,
      repository: repo ? serializer.repository(repo) : nil,
      repository_owner: repo ? serializer.repository_owner(repo.owner) : nil,
      discussion_id: discussion&.id,
      discussion: serializer.discussion(discussion),
      actor_id: payload[:actor_id],
      actor: serializer.user(actor),
      discussion_comment_id: discussion_comment.id,
      discussion_comment: serializer.discussion_comment(discussion_comment),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsComment::Action,
        value: payload[:action],
        default: :ACTION_UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
      specimen_body: specimen_body,
    }.freeze

    publish(message, schema: "github.discussions.v2.DiscussionsComment")
  end

  subscribe("discussion_comment_reaction.create") do |payload|
    reaction = payload[:reaction]
    comment = reaction.discussion_comment
    discussion = comment.discussion
    repo = discussion.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      actor: serializer.user(reaction.user),
      discussion_comment: serializer.discussion_comment(comment),
      discussion: serializer.discussion(discussion),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      author: serializer.user(comment.user),
      content: reaction.content,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentReactionCreate",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_comment_reaction.delete") do |payload|
    reaction = payload[:reaction]
    comment = reaction.discussion_comment
    discussion = reaction.discussion
    repo = reaction.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      actor: serializer.user(reaction.user),
      discussion_comment: serializer.discussion_comment(comment),
      discussion: serializer.discussion(discussion),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo&.owner),
      author: serializer.user(comment&.user),
      content: reaction.content,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentReactionDestroy",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_comment_reaction") do |payload|
    repo = payload[:repository]
    discussion = payload[:discussion]
    discussion_comment = payload[:discussion_comment]
    actor = payload[:actor]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: repo&.id,
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo&.owner),
      discussion_id: discussion&.id,
      discussion: serializer.discussion(discussion),
      discussion_comment_id: discussion_comment&.id,
      discussion_comment: serializer.discussion_comment(discussion_comment),
      actor_id: actor.id,
      actor: serializer.user(actor),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentReaction::Action,
        value: payload[:action],
        default: :ACTION_UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
      reaction: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentReaction::Reaction,
        value: payload[:reaction],
        default: :REACTION_UNKNOWN
      ),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
    }.freeze

    publish(message, schema: "github.discussions.v2.DiscussionsCommentReaction")
  end

  subscribe("discussion_comment.mark_as_answer") do |payload|
    comment = payload[:discussion_comment]
    discussion = comment.discussion
    repo = comment.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion_comment: serializer.discussion_comment(comment),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      author: serializer.user(comment.user),
      discussion: serializer.discussion(discussion),
      discussion_author: serializer.user(discussion.user),
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentMarkAsAnswer",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_comment.unmark_as_answer") do |payload|
    comment = payload[:discussion_comment]
    discussion = comment.discussion
    repo = comment.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion_comment: serializer.discussion_comment(comment),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      author: serializer.user(comment.user),
      discussion: serializer.discussion(discussion),
      discussion_author: serializer.user(discussion.user),
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentUnmarkAsAnswer",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_comment_marked_as_answer") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      discussion_comment_id: payload[:discussion_comment_id],
      discussion_id: payload[:discussion_id],
      discussion_comment: serializer.discussion_comment(payload[:discussion_comment]),
      actor_id: payload[:actor_id],
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentMarkedAsAnswer::Action,
        value: payload[:action],
        default: :UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
    }

    publish(message, schema: "github.discussions.v2.DiscussionsCommentMarkedAsAnswer")
  end

  subscribe("discussion_comment.suggest_as_answer") do |payload|
    comment = payload[:discussion_comment]
    discussion = payload[:discussion]
    repo = comment.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(discussion),
      discussion_comment: serializer.discussion_comment(comment),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      author: serializer.user(comment.user),
      discussion_author: serializer.user(discussion.user),
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentSuggestAsAnswer",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_comment.unsuggest_as_answer") do |payload|
    comment = payload[:discussion_comment]
    discussion = payload[:discussion]
    repo = comment.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(discussion),
      discussion_comment: serializer.discussion_comment(comment),
      spamurai_form_signals: serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals]),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      author: serializer.user(comment.user),
      discussion_author: serializer.user(discussion.user),
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCommentUnsuggestAsAnswer",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_category.create") do |payload|
    category = payload[:discussion_category]
    repo = category.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion_category: serializer.discussion_category(category),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      actor: serializer.user(payload[:actor]),
      supports_polls: category.supports_polls?,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCategoryCreate",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_category.update") do |payload|
    category = payload[:discussion_category]
    repo = category.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion_category: serializer.discussion_category(category),
      repository: serializer.repository(repo),
      repository_owner: serializer.repository_owner(repo.owner),
      actor: serializer.user(payload[:actor]),
      supports_polls: category.supports_polls?,
    }.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCategoryUpdate",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_category.delete") do |payload|
    category = payload[:discussion_category]
    repo = category.repository

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion_category: serializer.discussion_category(category),
      actor: serializer.user(payload[:actor]),
      supports_polls: category.supports_polls?,
    }

    if repo
      message[:repository] = serializer.repository(repo)
      message[:repository_owner] = serializer.repository_owner(repo.owner)
    end

    message = message.freeze

    publish(message, schema: "github.discussions.v1.DiscussionCategoryDelete",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_category") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.repository_owner(payload[:repository_owner]),
      actor_id: payload[:actor_id],
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsCategory::Action,
        value: payload[:action],
        default: :ACTION_UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
      category_id: payload[:category_id],
      discussion_format: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsCategory::DiscussionFormat,
        value: payload[:discussion_format],
        default: :DISCUSSION_FORMAT_UNKNOWN
      ),
      category_name: payload[:category_name],
      discussion_section_id: payload[:discussion_section_id],
    }

    message = message.freeze

    publish(message, schema: "github.discussions.v2.DiscussionsCategory")
  end

  subscribe("browser.discussions.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      event_context: payload[:event_context],
      target: payload[:target],
      discussion_id: payload[:discussion_id],
      discussion_comment_id: payload[:discussion_comment_id],
      discussion_repository_id: payload[:discussion_repository_id],
      current_repository_id: payload[:current_repository_id],
      org_level: payload[:org_level]
    }

    publish(message, schema: "github.v1.DiscussionClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.discussions.list_view_filter") do |payload|
    repository = Repositories::Public.find_active!(payload[:repository_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      filter: serializer.enum(
        type: Hydro::Schemas::Github::V1::DiscussionListViewFilter::Filter,
        value: payload[:filter],
        default: :UNKNOWN
      ),
      org_level: payload[:org_level]
    }

    publish(message, schema: "github.v1.DiscussionListViewFilter")
  end

  subscribe("browser.discussions.click_profile") do |payload|
    if payload[:is_discussion_comment]
      comment = DiscussionComment.find(payload[:id].to_i)
      discussion = comment.discussion
    else
      comment = nil
      discussion = Discussion.find(payload[:id].to_i)
    end

    message = {
      actor: serializer.user(payload[:client][:user]),
      discussion: serializer.discussion(discussion),
      discussion_comment: serializer.discussion_comment(comment),
    }

    publish(message, schema: "github.v1.DiscussionClickProfile", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.discussions.apply_filter") do |payload|
    repository = Repositories::Public.find_active!(payload[:repository_id])

    message = {
      actor: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      filter: serializer.enum(
        type: Hydro::Schemas::Github::V1::DiscussionApplyFilter::Filter,
        value: payload[:filter],
        default: :NULL
      ),
      sort: payload[:sort]&.upcase&.to_sym,
    }

    publish(message, schema: "github.v1.DiscussionApplyFilter", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_vote") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: serializer.repository(payload[:repository]),
      discussion_id: payload[:discussion_id],
      discussion: serializer.discussion(payload[:discussion]),
      actor_id: payload[:actor_id],
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsVote::Action,
        value: payload[:action],
        default: :UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
    }
    publish(message, schema: "github.discussions.v2.DiscussionsVote")
  end

  subscribe("discussion_vote.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(payload[:discussion]),
      repository: serializer.repository(payload[:repository]),
      upvote: payload[:upvote],
    }
    publish(message, schema: "github.discussions.v1.DiscussionVoteCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_vote.update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(payload[:discussion]),
      repository: serializer.repository(payload[:repository]),
      was_upvote: payload[:was_upvote],
      is_upvote: payload[:is_upvote]
    }

    publish(message, schema: "github.discussions.v1.DiscussionVoteUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_vote.destroy") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(payload[:discussion]),
      repository: serializer.repository(payload[:repository]),
      upvote: payload[:upvote],
    }

    publish(message, schema: "github.discussions.v1.DiscussionVoteDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_comment_vote.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      discussion: serializer.discussion(payload[:discussion]),
      repository: serializer.repository(payload[:repository]),
      comment: serializer.discussion_comment(payload[:comment]),
      upvote: payload[:upvote],
    }

    publish(message, schema: "github.discussions.v1.DiscussionCommentVoteCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_comment_vote.update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      comment: serializer.discussion_comment(payload[:comment]),
      discussion: serializer.discussion(payload[:discussion]),
      repository: serializer.repository(payload[:repository]),
      was_upvote: payload[:was_upvote],
      is_upvote: payload[:is_upvote],
    }

    publish(message, schema: "github.discussions.v1.DiscussionCommentVoteUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussion_comment_vote.destroy") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      comment: serializer.discussion_comment(payload[:comment]),
      discussion: serializer.discussion(payload[:discussion]),
      repository: serializer.repository(payload[:repository]),
      upvote: payload[:upvote],
    }

    publish(message, schema: "github.discussions.v1.DiscussionCommentVoteDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("discussions_comment_vote") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository_owner]),
      discussion_comment_id: payload[:discussion_comment_id],
      actor_id: payload[:actor_id],
      actor: serializer.user(payload[:actor]),
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::DiscussionsCommentVote::Action,
        value: payload[:action],
        default: :UNKNOWN
      ),
      action_timestamp: payload[:action_timestamp],
    }

    publish(message, schema: "github.discussions.v2.DiscussionsCommentVote")
  end

  subscribe("discussion_poll.create") do |payload|
    poll = payload[:discussion_poll]
    discussion = poll.discussion

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion: serializer.discussion(discussion),
      poll: serializer.discussion_poll(poll),
      author: serializer.user(discussion.author),
      category: serializer.discussion_category(discussion.category),
      question: serializer.discussion_poll_question(poll),
    }

    publish(message, schema: "github.discussions.v1.DiscussionPollCreate")
  end

  subscribe("discussion_poll.delete") do |payload|
    poll = payload[:discussion_poll]
    discussion = poll.discussion

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion: serializer.discussion(discussion),
      poll: serializer.discussion_poll(poll),
      actor: serializer.user(payload[:actor]),
      category: serializer.discussion_category(discussion.category),
    }

    publish(message, schema: "github.discussions.v1.DiscussionPollDelete")
  end

  subscribe("discussion_poll.update") do |payload|
    poll = payload[:discussion_poll]
    discussion = poll.discussion

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      discussion: serializer.discussion(discussion),
      poll: serializer.discussion_poll(poll),
      actor: serializer.user(payload[:actor]),
      category: serializer.discussion_category(discussion.category),
    }

    publish(message, schema: "github.discussions.v1.DiscussionPollUpdate")
  end

  subscribe("discussions_poll") do |payload|
    message = {
      request_context: Hydro::EntitySerializer.request_context(GitHub.context.to_hash),
      repository_id: payload[:repository_id],
      repository: Hydro::EntitySerializer.repository(payload[:repository]),
      repository_owner: Hydro::EntitySerializer.user(payload[:repository_owner]),
      discussion_id: payload[:discussion_id],
      discussion: Hydro::EntitySerializer.discussion(payload[:discussion]),
      actor_id: payload[:actor_id],
      actor: Hydro::EntitySerializer.user(payload[:actor]),
      action: payload[:action],
      action_timestamp: payload[:action_timestamp],
      poll_id: payload[:poll_id],
    }

    publish(message, schema: "github.discussions.v2.DiscussionsPoll")
  end

  subscribe("discussion_poll_vote.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      poll: serializer.discussion_poll(payload[:discussion_poll]),
      author: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.discussions.v1.DiscussionPollVoteCreate")
  end

  subscribe("discussion_poll_vote.destroy") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      poll: serializer.discussion_poll(payload[:discussion_poll]),
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.discussions.v1.DiscussionPollVoteDelete")
  end

  subscribe("team.migrate_team_discussions_submitted") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      team: serializer.team(payload[:team]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serializer.user(payload[:repository].owner),
      include_private: payload[:include_private],
    }

    publish(message, schema: "github.discussions.v1.MigrateTeamDiscussionsSubmitted")
  end

  subscribe("org_discussions") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization_id: payload[:organization_id],
      public_repository_id: payload[:public_repository_id],
      actor_id: payload[:actor_id],
      action: serializer.enum(
        type: Hydro::Schemas::Github::Discussions::V2::OrgDiscussions::Action,
        value: payload[:action],
        default: :UNKNOWN
      ),
    }

    publish(message, schema: "github.discussions.v2.OrgDiscussions")
  end
end

module Hydro::EventForwarder::DiscussionsExtensions
  extend T::Helpers
  extend T::Sig

  requires_ancestor { Hydro::EventForwarder }

  sig do
    params(
      discussion: Discussion,
      serialized_repository: T::Hash[Symbol, T.untyped],
      serialized_repository_owner: T::Hash[Symbol, T.untyped],
      serialized_actor: T.nilable(T::Hash[Symbol, T.untyped])
    ).returns(T.untyped)
  end
  def publish_secret_scanning_discussion_scan(discussion, serialized_repository, serialized_repository_owner, serialized_actor)
    contents = []
    begin
      repo = T.must(discussion.repository)
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(repo)
      if content_scanning.enabled?
        encrypted_title = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(discussion.title, discussion.id, discussion.created_at)
        contents.push({ content_type: :DISCUSSION_TITLE, content: encrypted_title })  unless encrypted_title.nil?

        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(discussion.body, discussion.id, discussion.created_at)
        contents.push({ content_type: :DISCUSSION_BODY, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: discussion.id,
          content_number: discussion.number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(repo).discussion_scanning_service_flags,
          content_created_at: discussion.created_at ? T.must(discussion.created_at).getutc : nil,
          contents: contents,
        }
        publish(scan_msg, topic: "github.secret_scanning.v1.DiscussionScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Discussion Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_discussion_scan",
        "exception.message": e.message,
      )
    end
  end

  sig do
    params(
      comment: DiscussionComment,
      serialized_repository: T::Hash[Symbol, T.untyped],
      serialized_repository_owner: T::Hash[Symbol, T.untyped],
      serialized_actor: T.nilable(T::Hash[Symbol, T.untyped])
    ).returns(T.untyped)
  end
  def publish_secret_scanning_discussion_comment_scan(comment, serialized_repository, serialized_repository_owner, serialized_actor)
    contents = []
    begin
      repo = T.must(comment.repository)
      content_scanning = SecretScanning::Features::Repo::ContentScanning.new(repo)
      if content_scanning.enabled?
        encrypted_body = SecretScanning::Encryption::EncryptedUserContentHelper.encrypt_user_content(comment.body, comment.id, comment.created_at)
        contents.push({ content_type: :DISCUSSION_COMMENT, content: encrypted_body })  unless encrypted_body.nil?

        scan_msg = {
          repository: serialized_repository,
          owner: serialized_repository_owner,
          actor: serialized_actor,
          content_id: comment.id,
          content_number: comment.discussion_number,
          feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(repo).discussion_scanning_service_flags,
          content_created_at: comment.created_at ? T.must(comment.created_at).getutc : nil,
          contents: contents,
        }
        publish(scan_msg, topic: "github.secret_scanning.v1.DiscussionCommentScan", schema: "github.secret_scanning.v1.EncryptedContentScanEvent")
      end
    rescue StandardError => e # rubocop:todo Lint/GenericRescue
      # Prevent secret scanning errors from impacting other teams
      Failbot.report(e)
      GitHub.logger.error(
        "Sending Discussion Scanning message failed",
        "code.namespace": self.class.name,
        "code.function": "publish_secret_scanning_discussion_comment_scan",
        "exception.message": e.message,
      )
    end
  end
end

class Hydro::EventForwarder
  include Hydro::EventForwarder::DiscussionsExtensions
end
