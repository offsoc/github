# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("interaction_limit.update") do |payload|
    message = {
      target_type: serializer.enum_from_string(payload[:target_type].to_s),
      target_id: payload[:target_id],
      limit: serializer.enum_from_string(payload[:limit].to_s),
      actor: serializer.user(payload[:actor]),
      staff_actor: payload[:staff_actor],
    }

    if payload[:duration].present?
      duration = RepositoryInteractionAbility::DURATION_OPTIONS[payload[:duration]]
      message = message.merge({
        duration_value: duration[:value],
        duration_unit: duration[:unit],
      })
    end

    schema = "github.interaction_ability.v0.InteractionLimit#{payload[:action].capitalize}"
    publish(message, schema: schema, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
