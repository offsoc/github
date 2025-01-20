# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.actions.execution_graph_click") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      repository: serializer.repository(repository),
      session_id: payload[:session_id],
      click_area: serializer.enum_from_string(payload[:click_area]),
    }

    publish(message, schema: "github.actions.v0.ExecutionGraphClick")
  end

  subscribe("actions.invocation_blocked") do |payload|
    message = {
      account: serializer.user(payload[:account])
    }
    publish(message, schema: "github.actions.v0.InvocationBlocked", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("actions.invocation_unblocked") do |payload|
    message = {
      account: serializer.user(payload[:account])
    }
    publish(message, schema: "github.actions.v0.InvocationUnblocked")
  end

  subscribe("workflow.action_required_approved") do |payload|
    message = {
      pull_request_id: payload[:pull_request_id],
      actor_id: payload[:actor_id],
      repo_id: payload[:repo_id],
      workflow_run_ids: payload[:workflow_run_ids],
    }

    publish(message, schema: "github.actions.v0.ActionRequiredWorkflowApproved")
  end

  subscribe("actions.connect_resolve_request") do |payload|
    message = {
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
      resolved_repository: serializer.repository(payload[:resolved_repository]),
      ref: payload[:ref]
    }

    publish(message, schema: "github.actions.v0.ConnectResolveRequest")
  end

  subscribe("actions.resolve_actions_request") do |payload|
    message = {
      resolved_repository: serializer.repository(payload[:resolved_repository]),
      ref: payload[:ref],
      resolved_ref: payload[:resolved_ref],
      resolved_sha: payload[:resolved_sha],
      user: serializer.user(payload[:user]),
      connect_request: payload[:connect_request],
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
      workflow_run_id: payload[:workflow_run_id],
      job_id: payload[:job_id],
      workflow_repository_id: payload[:workflow_repository_id],
      action_nwo: payload[:action_nwo],
      package_id: payload[:package_id]
    }

    partition_key = payload[:resolved_repository]&.id || payload[:package_id]
    publish(message,
      schema: "github.actions.v0.ResolveActionRequest",
      partition_key: partition_key, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 } # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end

  subscribe("repository_actions.recommended_templates") do |payload|
    repository = Repository.find_by(id: payload[:repository_id])
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      repository: serializer.repository(repository),
      category: payload[:category],
      templates: payload[:templates],
      commit_sha: payload[:commit_sha]
    }

    publish(message, schema: "github.actions.v0.OnboardingRecommendedWorkflowTemplate")
  end

  subscribe("gate_request.created") do |payload|
    message = {
      gate_request_id: payload[:gate_request_id],
      gate_id: payload[:gate_id],
      gate_type: serializer.enum_from_string(payload[:gate_type]),
      check_suite_id: payload[:check_suite_id],
      check_run_id: payload[:check_run_id],
      repository: serializer.repository(payload[:repository]),
      integration: serializer.integration(payload[:integration])
    }

    publish(message, schema: "github.actions.v0.GateRequestCreated")
  end
end

Hydro::EventForwarder.configure(source: GitHub) do
  subscribe("repo.actions_enabled") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    repository = Repository.find_by(id: payload[:repo_id])

    message = {
      actor: Hydro::EntitySerializer.user(actor),
      repository: Hydro::EntitySerializer.repository(repository),
    }

    publish(message, schema: "github.actions.v0.RepoEnabled", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("workflow.pinning_activity") do |payload|
    message = {
      workflow_id: payload[:workflow_id],
      actor_id: payload[:actor_id],
      workflow_repository_id: payload[:workflow_repository_id],
      event: serializer.enum_from_string(payload[:event])
    }

    publish(message, schema: "github.actions.v0.PinnedWorkflowsActivity")
  end
end
