# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("marketplace.onboarding_progress") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:marketplace_listing_id]),
      webhook_completed: payload[:webhook_completed],
      plans_and_pricing_completed: payload[:plans_and_pricing_completed],
      contact_info_completed: payload[:contact_info_completed],
      listing_description_completed: payload[:listing_description_completed],
      product_screenshots_completed: payload[:product_screenshots_completed],
      listing_details_completed: payload[:listing_details_completed],
      logo_and_feature_card_completed: payload[:logo_and_feature_card_completed],
      naming_and_links_completed: payload[:naming_and_links_completed],
    }

    publish(message, schema: "github.marketplace.v0.MarketplaceOnboardingProgress", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
