# frozen_string_literal: true

# These Hydro event subscriptions are related to the news feed.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do

  subscribe("browser.feed.show_less_activity_button.click") do |payload|
    message = {
      actor_id: payload[:actor_id],
      resource_id:  payload[:resource_id],
      resource_type:  payload[:resource_type],
      event_id: payload[:event_id],
      event_type_string:  payload[:event_type_string],
      clicked_at: payload[:clicked_at],
      request_context:  serializer.request_context(GitHub.context.to_hash),
      identifier:   payload[:identifier],
      source:   payload[:source],
      originating_url:  payload[:originating_url],
    }

    publish(message, schema: "hydro.schemas.github.feeds.v0.ShowLessActivityClick")
  end

  subscribe("browser.news_feed.event.click") do |payload|
    target_type = if payload[:target_type]
      payload[:target_type].upcase.to_sym
    else
      :TARGET_TYPE_UNKNOWN
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      client_timestamp: payload[:client][:timestamp].try(:to_i),
      server_timestamp: Time.zone.now,
      actor: serializer.user(payload[:client][:user]),
      originating_request_id: payload[:originating_request_id],
      action_target: payload[:action_target],
      context: payload[:org_id] ? :ORG : :USER,
      event: serializer.news_feed_event(payload[:event]),
      target_type: target_type,
      event_group: serializer.news_feed_event_group(payload[:event_group]),
      unique_card_retrieved_id: payload.dig(:feed_card, :card_retrieved_id),
    }

    if payload[:org_id]
      organization = Organization.find_by(id: payload[:org_id])
      message[:org] = serializer.organization(organization)
    end

    publish(message, schema: "github.v1.NewsFeedClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/(browser\.)?news_feed.event.view/) do |payload|
    org = if payload[:org]
      serializer.organization(payload[:org])
    elsif payload[:org_id]
      { id: payload[:org_id] }
    end

    user = payload[:actor]
    user ||= payload[:client] && payload[:client][:user]

    target_type = if payload[:target_type]
      payload[:target_type].upcase.to_sym
    else
      :TARGET_TYPE_UNKNOWN
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(user),
      org: org,
      context: org.nil? ? :USER : :ORG,
      event: serializer.news_feed_event(payload[:event]),
      target_type: target_type,
      event_group: serializer.news_feed_event_group(payload[:event_group]),
      unique_card_retrieved_id: payload.dig(:feed_card, :card_retrieved_id),
    }

    publish(message, schema: "github.v1.NewsFeedView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("conduit.timeline_update") do |payload|
    message = {
      actor_id: payload[:actor_id],
    }

    publish(message, schema: "github.v1.ConduitTimelineUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.feeds.feed_click") do |payload|
    user ||= payload[:client] && payload[:client][:user]
    ranking_model_id = payload[:feed_card] ? payload[:feed_card][:ranking_model_id] : nil
    feed_card_id = payload[:feed_card] ? serializer.feed_card(payload[:feed_card]) : nil

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      click_target: payload[:click_target],
      actor: serializer.user(user),
      feed_card_id: feed_card_id,
      clicked_at: payload[:client][:timestamp].try(:to_i),
      ranking_model_id: ranking_model_id,
      original_request_id: payload[:original_request_id],
      metadata: payload[:metadata],
    }

    publish(message, schema: "hydro.schemas.github.feeds.v0.FeedClick")
  end

  subscribe("feeds.feed_retrieved") do |payload|
    feed_cards = payload[:feed_cards].map do |feed_card|
      serializer.feed_card(feed_card.analytics_attributes)
    end

    ranking_model_id = if payload[:feed_cards].any?
      attrs = payload[:feed_cards].first.analytics_attributes
      attrs[:ranking_model_id]
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      feed_card_id: feed_cards,
      actor: serializer.user(payload[:actor]),
      retrieved_at: payload[:retrieved_at],
      ranking_model_id:      ranking_model_id,
      original_request_id: payload[:original_request_id],
      metadata: payload[:metadata],
    }

    publish(message, schema: "hydro.schemas.github.feeds.v0.FeedRetrieved")
  end

  subscribe("browser.feeds.feed_visible") do |payload|
    user ||= payload[:client] && payload[:client][:user]
    ranking_model_id = payload[:feed_card][:ranking_model_id]
    timestamp = payload[:client][:timestamp].try(:to_i)

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(user),
      feed_card_id: serializer.feed_card(payload[:feed_card]),
      ranking_model_id: ranking_model_id,
      viewed_at: timestamp,
      original_request_id: payload[:original_request_id],
    }

    publish(message, schema: "hydro.schemas.github.feeds.v0.FeedVisible")
  end

  subscribe("feeds.user_disinterest") do |payload|
    payload[:request_context] = serializer.request_context(GitHub.context.to_hash)
    publish(serializer.user_disinterest(payload), schema: "hydro.schemas.github.feeds.v0.UserDisinterest")
  end
end
