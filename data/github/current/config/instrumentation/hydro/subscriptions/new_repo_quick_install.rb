# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("marketplace.new_repo_quick_install") do |payload|
    listings_payload = {}
    payload[:categorized_listings].each do |category, listings|
      listings_payload[category] = listings.map { |listing| serializer.marketplace_listing_from_database_id(listing.id) }
    end

    message = {
        request_context: serializer.request_context(GitHub.context.to_hash),
        actor: serializer.user(payload[:user]),
        action: payload[:action],
        repository: serializer.repository(payload[:repository])
    }.merge(listings_payload)

    publish(message, schema: "github.marketplace.v0.NewRepoQuickInstall", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
