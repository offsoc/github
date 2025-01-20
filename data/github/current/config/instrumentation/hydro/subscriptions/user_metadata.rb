# frozen_string_literal: true

# These are Hydro event subscriptions related to UserMetadata.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("user_metadata.recalculation.trigger") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    target_user = User.find_by(id: payload[:target_user_id])

    message = {
      actor: serializer.user(actor),
      request_context: serializer.request_context(
        GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload),
      ),
      target_user: serializer.user(target_user),
      target_stream_processor: payload.fetch(:target_stream_processor, :TARGET_UNKNOWN),
    }

    publish(message, schema: "github.user_metadata.v1.Recalculation", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
