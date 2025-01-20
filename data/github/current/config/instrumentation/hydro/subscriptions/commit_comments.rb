# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to commit comments.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("commit_comment.create") do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_commit_comment = serializer.commit_comment(payload[:commit_comment])
    serialized_repository = serializer.repository(payload[:repository])
    serialized_repository_owner = serializer.repository_owner(payload[:repository])
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:commit_comment]&.body)

    message = {
      actor: serialized_actor,
      actor_is_member: serializer.user_repository_member?(payload[:repository], payload[:actor]),
      body: payload[:commit_comment].body,
      commit_comment: serialized_commit_comment,
      repository: serialized_repository,
      repository_owner: serialized_repository_owner,
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(payload[:repository]).commit_comment_scanning_service_flags,
    }

    publish(message, schema: "github.v1.CommitCommentCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :COMMIT_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.CommitCommentCreate"),
      content_database_id: serialized_commit_comment[:id],
      content_global_relay_id: serialized_commit_comment[:global_relay_id],
      content_created_at: serialized_commit_comment[:created_at],
      content_updated_at: serialized_commit_comment[:updated_at],
      title: nil,
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
  end

  subscribe("commit_comment.update") do |payload|
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_commit_comment = serializer.commit_comment(payload[:commit_comment])
    serialized_repository = serializer.repository(payload[:repository])
    serialized_repository_owner = serializer.repository_owner(payload[:repository])
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(payload[:commit_comment]&.body)

    message = {
      actor: serialized_actor,
      actor_is_member: serializer.user_repository_member?(payload[:repository], payload[:actor]),
      current_body: serializer.force_utf8(payload[:commit_comment].body),
      commit_comment: serialized_commit_comment,
      previous_body: serializer.force_utf8(payload[:previous_body]),
      repository: serializer.repository(payload[:repository]),
      repository_owner: serialized_repository_owner,
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      feature_flags: SecretScanning::Instrumentation::RepositoryServiceFlags.new(payload[:repository]).commit_comment_scanning_service_flags,
    }

    publish(message, schema: "github.v1.CommitCommentUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :COMMIT_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.CommitCommentCreate"),
      content_database_id: serialized_commit_comment[:id],
      content_global_relay_id: serialized_commit_comment[:global_relay_id],
      content_created_at: serialized_commit_comment[:created_at],
      content_updated_at: serialized_commit_comment[:updated_at],
      title: nil,
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
  end
end
