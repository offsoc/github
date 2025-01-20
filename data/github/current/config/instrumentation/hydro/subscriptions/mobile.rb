# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("mobile.event") do |payload|
    hydro_payload = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      application: serializer.enum_from_string(payload[:application].upcase),
      element: serializer.enum_from_string(payload[:element].upcase),
      action: serializer.enum_from_string(payload[:action].upcase),
      device: serializer.enum_from_string(payload[:device].upcase),
      performed_at: Time.parse(payload[:performed_at].to_s)
    }

    if !payload[:subject_type].nil?
      hydro_payload[:subject_type] = serializer.enum_from_string(payload[:subject_type].upcase)
    end

    if !payload[:context].nil?
      hydro_payload[:context] = serializer.enum_from_string(payload[:context].upcase)
    end

    publish(hydro_payload, schema: "github.mobile.v0.Event", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
