# frozen_string_literal: true

# These Hydro event subscriptions are related to feed posts.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do

  subscribe("feed_post.create") do |payload|
    feed_post_publish(payload, true, :CREATE)
  end

  subscribe("feed_post.update") do |payload|
    feed_post_publish(payload, true, :UPDATE)
  end

  subscribe("feed_post.delete") do |payload|
    feed_post_publish(payload)
  end

  subscribe("browser.feed_post.cancel") do |payload|
    user ||= payload[:client] && payload[:client][:user]
    method = Conduit::AnalyticsHelper::InteractionMethod::INTERACTION_METHOD_CANCEL
    request_context = serializer.request_context(GitHub.context.to_hash)
    message = {
      user_post: { author: serializer.user(user) },
      method:,
      request_context:,
    }
    publish(message, schema: "hydro.schemas.github.feeds.v0.UserPost")
  end

  def feed_post_publish(payload, publish_user_generated_content = false, action = nil)
    feed_post = payload[:feed_post]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_feed_post = serializer.feed_post(feed_post)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(feed_post.body)
    message = {
      request_context: serialized_request_context,
      user_post: serialized_feed_post,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      method: payload[:method],
    }
    publish(message, schema: "hydro.schemas.github.feeds.v0.UserPost")

    if publish_user_generated_content
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serialized_spamurai_form_signals,
        action_type: action,
        content_type: :FEED_POST,
        actor: serialized_feed_post[:author],
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.feeds.v0.UserPost"),
        content_database_id: feed_post.id,
        content_global_relay_id: feed_post.global_relay_id,
        content_created_at: feed_post.created_at,
        content_updated_at: feed_post.updated_at,
        content: serialized_specimen_body,
        content_visibility: :PUBLIC,
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_feed_post[:owner],
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end


  subscribe("feed_post_comment.create") do |payload|
    feed_post_comment_publish(payload, true, :CREATE)
  end

  subscribe("feed_post_comment.update") do |payload|
    feed_post_comment_publish(payload, true, :UPDATE)
  end

  subscribe("feed_post_comment.delete") do |payload|
    feed_post_comment_publish(payload)
  end

  def feed_post_comment_publish(payload, publish_user_generated_content = false, action = nil)
    feed_post_comment = payload[:feed_post_comment]
    serialized_request_context = serializer.request_context(GitHub.context.to_hash)
    serialized_feed_post_comment = serializer.feed_post_comment(feed_post_comment)
    serialized_spamurai_form_signals = serializer.spamurai_form_signals(GitHub.context[:spamurai_form_signals])
    serialized_specimen_body = serializer.specimen_data(feed_post_comment.body)
    message = {
      request_context: serialized_request_context,
      user_post_comment: serialized_feed_post_comment,
      spamurai_form_signals: serialized_spamurai_form_signals,
      specimen_body: serialized_specimen_body,
      method: payload[:method],
      user_post_id: payload[:feed_post_id],
    }
    publish(message, schema: "hydro.schemas.github.feeds.v0.UserPostComment")
    if publish_user_generated_content
      user_generated_content_msg = {
        request_context: serialized_request_context,
        spamurai_form_signals: serialized_spamurai_form_signals,
        action_type: action,
        content_type: :FEED_POST_COMMENT,
        actor: serialized_feed_post_comment[:author],
        original_type_url: GitHub::Config::HydroConfig.build_type_url("github.feeds.v0.UserPostComment"),
        content_database_id: feed_post_comment.id,
        content_global_relay_id: feed_post_comment.global_relay_id,
        content_created_at: feed_post_comment.created_at,
        content_updated_at: feed_post_comment.updated_at,
        content: serialized_specimen_body,
        content_visibility: :PUBLIC,
        parent_content_author: nil,
        parent_content_database_id: nil,
        parent_content_global_relay_id: nil,
        parent_content_created_at: nil,
        parent_content_updated_at: nil,
        owner: serialized_feed_post_comment[:author],
      }

      publish(user_generated_content_msg, schema: "github.platform_health.v1.UserGeneratedContent", publisher: GitHub.user_generated_content_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end
end
