# typed: true
# frozen_string_literal: true
REQUIRED_VALUES = %w[server_id invoking_event_type workflow_repository_id workflow_repository_global_id
  workflow_repository_visibility workflow_build_id job_id job_runtime check_run_id start_time
  end_time runner_type]

# Hydro event subscriptions related to GHES usage metrics transmitted over GitHub Connect
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("ghes_actions_job_execution.event") do |payload|
    next unless REQUIRED_VALUES.none? do |key|
      payload[key.to_sym].nil?
    end

    message = {
      server_id: payload[:server_id],
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
      invoking_event_type: payload[:invoking_event_type],
      workflow_repository_id: payload[:workflow_repository_id],
      workflow_repository_global_id: payload[:workflow_repository_global_id],
      workflow_repository_visibility: payload[:workflow_repository_visibility].to_sym,
      workflow_build_id: payload[:workflow_build_id],
      check_suite_id: payload[:check_suite_id],
      organization_id: payload[:organization_id],
      job_check_run_conclusion: payload[:job_check_run_conclusion].nil? ? nil : payload[:job_check_run_conclusion].to_sym,
      job_id: payload[:job_id],
      job_runtime: payload[:job_runtime].to_sym,
      job_runtime_version: payload[:job_runtime_version].nil? ? nil : payload[:job_runtime_version].to_sym,
      check_run_id: payload[:check_run_id],
      start_time: payload[:start_time].to_time.utc,
      end_time: payload[:end_time].to_time.utc,
      job_execution_billable_ms: payload[:job_execution_billable_ms],
      runner_properties: payload[:runner_properties].to_json,
      runner_type: payload[:runner_type].to_sym
    }

    publish(message, schema: "github.actions.v0.EnterpriseServerJobExecution")
  end
end
