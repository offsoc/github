# frozen_string_literal: true

# These are Hydro event subscriptions related to Gists.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("gist.create") do |payload|
    gist = payload[:gist]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_gist = serializer.gist(gist)
    serialized_gist_owner = serializer.repository_owner(gist.owner)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_description = serializer.specimen_data(gist.description)

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      gist: serialized_gist,
      head_sha: gist.sha.to_s,
      files: serializer.gist_files(gist, payload[:files]),
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_files: serializer.gist_specimen_files(payload[:files].first(3)),
      specimen_gist_description: serialized_specimen_description,
      specimen_files_path: serializer.gist_specimen_files_path(payload[:files].first(3)),
      feature_flags: payload[:feature_flags]
    }

    publish(message, schema: "github.v1.GistCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :GIST,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.GistCreate"),
      content_database_id: serialized_gist[:id],
      content_global_relay_id: serialized_gist[:global_relay_id],
      content_created_at: serialized_gist[:created_at],
      content_updated_at: gist.updated_at,
      title: nil,
      content: serializer.specimen_data(gist.description),
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_gist_owner,
      repository: nil,
      content_visibility: serialized_gist[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    payload[:files].first(3).each do |file|
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serialized_spamurai_form_signals,
        action_type: :CREATE,
        content_type: :GIST_FILE,
        actor: serialized_actor,
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.GistCreate"),
        content_database_id: serialized_gist[:id],
        content_global_relay_id: serialized_gist[:global_relay_id],
        content_created_at: serialized_gist[:created_at],
        content_updated_at: gist.updated_at,
        title: serializer.specimen_data(file.name),
        content: serializer.specimen_data(file.data),
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_gist_owner,
        repository: nil,
        content_visibility: serialized_gist[:visibility],
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("gist.update") do |payload|
    gist = payload[:gist]
    previous_gist_snapshot = payload[:previous_gist_snapshot]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(payload[:actor])
    serialized_gist = serializer.gist(gist)
    serialized_gist_owner = serializer.repository_owner(gist.owner)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_description = serializer.specimen_data(gist.description)

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      current_head_sha: gist.sha,
      current_gist: serialized_gist,
      current_files: serializer.gist_files(gist, payload[:files]),
      previous_head_sha: previous_gist_snapshot[:head_sha],
      previous_gist: serializer.gist(previous_gist_snapshot[:gist]),
      previous_files: serializer.gist_files(previous_gist_snapshot[:gist], previous_gist_snapshot[:files]),
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_files: serializer.gist_specimen_files(payload[:files].first(3)),
      specimen_gist_description: serialized_specimen_description,
      specimen_files_path: serializer.gist_specimen_files_path(payload[:files].first(3)),
      feature_flags: payload[:feature_flags]
    }

    publish(message, schema: "github.v1.GistUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :GIST,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.GistUpdate"),
      content_database_id: serialized_gist[:id],
      content_global_relay_id: serialized_gist[:global_relay_id],
      content_created_at: serialized_gist[:created_at],
      content_updated_at: gist.updated_at,
      title: nil,
      content: serializer.specimen_data(gist.description),
      parent_content_author: nil,
      parent_content_database_id: nil,
      parent_content_global_relay_id: nil,
      parent_content_created_at: nil,
      parent_content_updated_at: nil,
      owner: serialized_gist_owner,
      repository: nil,
      content_visibility: serialized_gist[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    payload[:files].first(3).each do |file|
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serialized_spamurai_form_signals,
        action_type: :UPDATE,
        content_type: :GIST_FILE,
        actor: serialized_actor,
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.GistUpdate"),
        content_database_id: serialized_gist[:id],
        content_global_relay_id: serialized_gist[:global_relay_id],
        content_created_at: serialized_gist[:created_at],
        content_updated_at: gist.updated_at,
        title: serializer.specimen_data(file.name),
        content: serializer.specimen_data(file.data),
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_gist_owner,
        repository: nil,
        content_visibility: serialized_gist[:visibility],
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("gist_comment.create") do |payload|
    gist_comment = payload[:gist_comment]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(gist_comment.user)
    serialized_gist = serializer.gist(gist_comment.gist)
    serialized_gist_comment = serializer.gist_comment(gist_comment)
    serialized_gist_owner = serializer.repository_owner(gist_comment.gist.owner)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(gist_comment.body)

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      gist: serialized_gist,
      gist_comment: serialized_gist_comment,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
    }.merge(serializer.gist_comment_gist_fields(gist_comment))

    publish(message, schema: "github.v1.GistCommentCreate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :CREATE,
      content_type: :GIST_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.GistCommentCreate"),
      content_database_id: serialized_gist_comment[:id],
      content_global_relay_id: serialized_gist_comment[:global_relay_id],
      content_created_at: serialized_gist_comment[:created_at],
      content_updated_at: serialized_gist_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serializer.user(gist_comment.gist.user),
      parent_content_database_id: serialized_gist[:id],
      parent_content_global_relay_id: serialized_gist[:global_relay_id],
      parent_content_created_at: serialized_gist[:created_at],
      parent_content_updated_at: gist_comment.gist.updated_at,
      owner: serialized_gist_owner,
      repository: nil,
      content_visibility: serialized_gist[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("gist_comment.update") do |payload|
    gist_comment = payload[:gist_comment]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_actor = serializer.user(gist_comment.user)
    serialized_gist = serializer.gist(gist_comment.gist)
    serialized_gist_comment = serializer.gist_comment(gist_comment)
    serialized_gist_owner = serializer.repository_owner(gist_comment.gist.owner)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(gist_comment.body)

    message = {
      request_context: serialized_request_context,
      actor: serialized_actor,
      gist: serialized_gist,
      gist_comment: serialized_gist_comment,
      spamurai_form_signals: serialized_spamurai_form_signals,
      current_specimen_body: serialized_specimen_body,
      previous_specimen_body: serializer.specimen_data(payload[:previous_body]),
    }.merge(serializer.gist_comment_gist_fields(gist_comment))

    publish(message, schema: "github.v1.GistCommentUpdate", publisher: GitHub.legacy_user_generated_content_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat

    user_generated_content_msg = {
      request_context: serialized_request_context,
      spamurai_form_signals: serialized_spamurai_form_signals,
      action_type: :UPDATE,
      content_type: :GIST_COMMENT,
      actor: serialized_actor,
      original_type_url: GitHub::Config::HydroConfig.build_type_url("github.v1.GistCommentUpdate"),
      content_database_id: serialized_gist_comment[:id],
      content_global_relay_id: serialized_gist_comment[:global_relay_id],
      content_created_at: serialized_gist_comment[:created_at],
      content_updated_at: serialized_gist_comment[:updated_at],
      title: nil,
      content: serialized_specimen_body,
      parent_content_author: serializer.user(gist_comment.gist.user),
      parent_content_database_id: serialized_gist[:id],
      parent_content_global_relay_id: serialized_gist[:global_relay_id],
      parent_content_created_at: serialized_gist[:created_at],
      parent_content_updated_at: gist_comment.gist.updated_at,
      owner: serialized_gist_owner,
      repository: nil,
      content_visibility: serialized_gist[:visibility],
    }

    publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
