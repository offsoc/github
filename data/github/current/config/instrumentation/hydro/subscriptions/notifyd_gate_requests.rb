# frozen_string_literal: true

require "notifyd-client"

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("gate_request.created") do |payload|
    gate_request_id = payload[:gate_request_id]
    next unless gate_request_id
    gate_request = GateRequest.find_by(id: gate_request_id)
    next unless gate_request
    next unless gate_request.requires_manual_action?
    workflow_run = gate_request.workflow_run
    next unless workflow_run.present?
    actor = workflow_run.actor
    next unless actor.present?

    approver_ids = gate_request.approver_ids
    GitHub.dogstats.histogram("notifyd.gate_request.approvers.counts", approver_ids.length)

    approver_ids.each_slice(Notifyd::Scientist.explicit_recipient_batch_size) do |approver_ids_slice|
      Notifyd::NotifyPublisher.new.async_publish(
        actor_id: actor.id,
        subject_id: workflow_run.id,
        subject_klass: workflow_run.class.name,
        context: {
          operation: "approval_requested",
          actor_login: actor.display_login,
          approver_ids: approver_ids_slice,
          gate_request_id: gate_request_id
        }
      )
    end
  end
end
