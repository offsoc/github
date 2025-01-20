# frozen_string_literal: true

require "notifyd-client"

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("release.published") do |payload|
    next unless payload[:release] && payload[:actor]
    next unless GitHub.flipper[:notifyd_releases_hydro_publisher].enabled?(payload[:release].repository)

    Notifyd::NotifyPublisher.new.async_publish(
      actor_id: payload[:actor].id,
      subject_id: payload[:release].id,
      subject_klass: payload[:release].class.name,
      context: {
        actor_id: payload[:actor].id,
        actor_login: payload[:actor].display_login,
        operation: "create"
      }
    )
  end
end
