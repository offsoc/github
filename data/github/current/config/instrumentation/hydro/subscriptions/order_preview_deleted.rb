# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("marketplace.order_preview_deleted") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      order_preview_viewed_at: payload[:order_preview_viewed_at],
      order_preview_email_notification_sent_at: payload[:order_preview_email_notification_sent_at],
      account: serializer.user(payload[:account]),
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:marketplace_listing_id]),
      marketplace_listing_plan: serializer.marketplace_listing_plan_from_database_id(payload[:marketplace_listing_plan_id])
    }

    publish(message, schema: "github.marketplace.v0.OrderPreviewDeleted", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
