# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Milestones.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("milestone.update") do |payload|
    publish(milestone_update_message(payload), schema: "github.v1.MilestoneUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("milestone.delete") do |payload|
    publish(base_milestone_message(payload), schema: "github.v1.MilestoneDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  def milestone_update_message(payload)
    T.bind(self, Hydro::EventForwarder)

    base_milestone_message(payload)
      .merge(payload.slice(*Milestone::HYDRO_UPDATE_EVENT_PREVIOUS_VALUE_ATTRIBUTES))
      .transform_values { |v| v.is_a?(String) ? serializer.force_utf8(v) : v }
  end

  def base_milestone_message(payload)
    T.bind(self, Hydro::EventForwarder)

    {
      actor: serializer.user(payload[:actor]),
      milestone: serializer.milestone(payload[:milestone]),
    }
  end
end
