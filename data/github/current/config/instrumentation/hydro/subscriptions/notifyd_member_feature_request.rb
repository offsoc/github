# typed: strict
# frozen_string_literal: true

# These are Hydro event subscriptions related to Member Feature Request.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("member_feature_request.notification") do |payload|
    subject = MemberFeatureRequest::Notification.find_by(id: payload[:notification_id])

    next unless subject
    next unless actor = subject.user
    next unless entity = subject.entity

    next unless actor.feature_enabled?(:raf_email_notifications_notifyd)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: actor.id,
      subject_id: subject.id,
      subject_klass: "MemberFeatureRequest::Notification",
      context: {
        actor_id: actor.id,
        entity_id: entity.id,
        operation: subject.feature
      }
    )
  end
end
