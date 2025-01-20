# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GitHub) do
  subscribe(/feature_enrollment\.(enrolled|unenrolled)/) do |payload|
    actor = User.find_by(id: payload[:actor_id])

    message = {
      toggleable_feature: payload[:toggleable_feature],
      actor: serializer.user(actor),
      enrollee_id: payload[:enrollee_id],
      enrollee_type: serializer.enum_from_string(payload[:enrollee_type]),
      action: payload[:enrolled] ? FeatureEnrollment::ENROLLED_ACTION : FeatureEnrollment::UNENROLLED_ACTION,
    }

    publish(message, schema: "github.v1.FeatureEnrollmentEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
