# frozen_string_literal: true

# These are Hydro event subscriptions related to Explore.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.explore.click") do |payload|
    actor = User.find_by(id: payload[:actor_id])

    message = {
      actor: serializer.user(actor),
      click_context: payload[:click_context],
      click_target: payload[:click_target],
      click_visual_representation: payload[:click_visual_representation],
      record_id: payload[:record_id],
      request_context: serializer.request_context(
        GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload),
      ),
      visitor_id: payload[:visitor_id].to_s,
    }

    publish(message, schema: "github.v1.ExploreClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("explore.page_view") do |payload|
    actor = User.find_by(id: payload[:actor_id])

    message = {
      actor: serializer.user(actor),
      request_context: serializer.request_context(GitHub.context.to_hash),
      record_id: payload[:record_id],
      view_context: payload[:view_context],
      visible_good_first_issue_ids: payload[:visible_good_first_issue_ids],
      visible_good_first_issue_id_values: payload[:visible_good_first_issue_ids],
      visible_recommended_repository_ids: payload[:visible_recommended_repository_ids],
      visible_recommended_topic_ids: payload[:visible_recommended_topic_ids],
      visible_trending_developer_ids: payload[:visible_trending_developer_ids],
      visible_trending_repository_ids: payload[:visible_trending_repository_ids],
      visitor_id: payload[:visitor_id].to_s,
    }

    publish(message, schema: "github.v1.ExplorePageView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
