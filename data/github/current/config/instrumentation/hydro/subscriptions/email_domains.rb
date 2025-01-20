# frozen_string_literal: true

# These are Hydro event subscriptions related to email domains.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("email_domain_reputation_record.create") do |payload|
    message = {
      domain: payload[:domain],
      recent_users: payload[:recent_users].map { |user| serializer.user(user) },
      calculation_ms: payload[:calculation_ms],
    }.merge(payload[:metadata]).merge(serializer.spam_reputation(payload[:reputation])).freeze

    publish(message, schema: "github.v1.EmailDomainReputationRecordCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
