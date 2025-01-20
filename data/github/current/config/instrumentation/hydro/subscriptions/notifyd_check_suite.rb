# frozen_string_literal: true

require "notifyd-client"

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("check_suite.notification_triggered") do |payload|
    next unless payload[:check_suite].present?
    check_suite = payload[:check_suite]
    next if check_suite.action_required?

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: check_suite.safe_actor.id,
      subject_id: check_suite.id,
      subject_klass: check_suite.class.name,
      context: {
        operation: "completed",
        actor_login: check_suite.safe_actor.display_login,
        actor_id: check_suite.safe_actor.id,
      }
    )
  end
end
