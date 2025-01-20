# frozen_string_literal: true

require "notifyd-client"

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  notifyd_publisher = Notifyd::NotifyPublisher.new

  subscribe("memex_project_status.create") do |payload|
    memex_project_status = payload[:memex_project_status]
    actor = payload[:actor]
    next unless memex_project_status && actor

    notifyd_publisher.async_publish(
      actor_id: actor.id,
      subject_id: memex_project_status.id,
      subject_klass: memex_project_status.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        current_body: memex_project_status.body,
        operation: Notifyd::Operations::MemexProjectStatusOperation::Create.serialize,
      }
    )
  end

  subscribe("memex_project_status.update") do |payload|
    memex_project_status = payload[:memex_project_status]
    actor = payload[:actor]
    next unless memex_project_status && actor
    previous_body = payload[:previous_body]
    next unless previous_body

    notifyd_publisher.async_publish(
      actor_id: actor.id,
      subject_id: memex_project_status.id,
      subject_klass: memex_project_status.class.name,
      context: {
        actor_id: actor.id,
        actor_login: actor.display_login,
        previous_body: previous_body,
        current_body: payload[:current_body],
        operation: Notifyd::Operations::MemexProjectStatusOperation::Update.serialize,
      }
    )
  end
end
