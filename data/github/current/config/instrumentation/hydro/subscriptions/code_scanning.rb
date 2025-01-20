# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Code Scanning.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("code_scanning.new_analysis") do |payload|
    repo_id = payload[:repository_id]
    payload.freeze
    publish(payload, schema: "code_scanning.v0.Analysis", topic: "code_scanning.v0.NewAnalysis", partition_key: repo_id)
  end

  subscribe("code_scanning.status_report") do |params|
    # Most params come in from JSON as string keys,
    # but are expected as symbol keys by instrumenter.
    message = {
      action_name: params["action_name"],
      action_oid: params["action_oid"],
      action_ref: params["action_ref"],
      action_started_at: params["action_started_at"],
      action_version: params["action_version"],
      actions_event_name: params["actions_event_name"],
      analysis_key: params["analysis_key"],
      analysis_name: params["workflow_name"], # Field had to be renamed in the protobuf schema
      analyze_builtin_queries_cpp_duration_ms: params["analyze_builtin_queries_cpp_duration_ms"]&.to_i,
      analyze_builtin_queries_csharp_duration_ms: params["analyze_builtin_queries_csharp_duration_ms"]&.to_i,
      analyze_builtin_queries_go_duration_ms: params["analyze_builtin_queries_go_duration_ms"]&.to_i,
      analyze_builtin_queries_java_duration_ms: params["analyze_builtin_queries_java_duration_ms"]&.to_i,
      analyze_builtin_queries_javascript_duration_ms: params["analyze_builtin_queries_javascript_duration_ms"]&.to_i,
      analyze_builtin_queries_python_duration_ms: params["analyze_builtin_queries_python_duration_ms"]&.to_i,
      analyze_builtin_queries_ruby_duration_ms: params["analyze_builtin_queries_ruby_duration_ms"]&.to_i,
      analyze_builtin_queries_swift_duration_ms: params["analyze_builtin_queries_swift_duration_ms"]&.to_i,
      analyze_custom_queries_cpp_duration_ms: params["analyze_custom_queries_cpp_duration_ms"]&.to_i,
      analyze_custom_queries_csharp_duration_ms: params["analyze_custom_queries_csharp_duration_ms"]&.to_i,
      analyze_custom_queries_go_duration_ms: params["analyze_custom_queries_go_duration_ms"]&.to_i,
      analyze_custom_queries_java_duration_ms: params["analyze_custom_queries_java_duration_ms"]&.to_i,
      analyze_custom_queries_javascript_duration_ms: params["analyze_custom_queries_javascript_duration_ms"]&.to_i,
      analyze_custom_queries_python_duration_ms: params["analyze_custom_queries_python_duration_ms"]&.to_i,
      analyze_custom_queries_ruby_duration_ms: params["analyze_custom_queries_ruby_duration_ms"]&.to_i,
      analyze_custom_queries_swift_duration_ms: params["analyze_custom_queries_swift_duration_ms"]&.to_i,
      analyze_failure_language: params["analyze_failure_language"],
      autobuild_failure: params["autobuild_failure"],
      autobuild_languages: params["autobuild_languages"],
      build_mode: params["build_mode"],
      cause: params["cause"],
      codeql_version: params["codeql_version"],
      commit_oid: params["commit_oid"],
      completed_at: params["completed_at"],
      config_file: params["config_file"],
      disable_default_queries: params["disable_default_queries"],
      event_reports: params["event_reports"]&.map do |event_report| {
        event: event_report["event"],
        started_at: event_report["started_at"],
        completed_at: event_report["completed_at"],
        exit_status: event_report["exit_status"],
        language: event_report["language"],
        properties: event_report["properties"].to_json
      }
                     end,
      exception: params["exception"],
      first_party_analysis: params["first_party_analysis"],
      feature_flags_status: params["feature_flags_status"].map { |flag, value| { name: flag, enabled: value } },
      interpret_results_cpp_duration_ms: params["interpret_results_cpp_duration_ms"]&.to_i,
      interpret_results_csharp_duration_ms: params["interpret_results_csharp_duration_ms"]&.to_i,
      interpret_results_go_duration_ms: params["interpret_results_go_duration_ms"]&.to_i,
      interpret_results_java_duration_ms: params["interpret_results_java_duration_ms"]&.to_i,
      interpret_results_javascript_duration_ms: params["interpret_results_javascript_duration_ms"]&.to_i,
      interpret_results_python_duration_ms: params["interpret_results_python_duration_ms"]&.to_i,
      interpret_results_ruby_duration_ms: params["interpret_results_ruby_duration_ms"]&.to_i,
      interpret_results_swift_duration_ms: params["interpret_results_swift_duration_ms"]&.to_i,
      job_name: params["job_name"],
      job_run_uuid: params["job_run_uuid"],
      job_status: params["job_status"],
      languages: params["languages"],
      matrix_vars: params["matrix_vars"],
      ml_powered_javascript_queries: params["ml_powered_javascript_queries"],
      num_results_in_sarif: params["num_results_in_sarif"],
      packs: params["packs"],
      paths_ignore: params["paths_ignore"],
      paths: params["paths"],
      queries: params["queries"],
      query_filters: params["query_filters"],
      raw_upload_size_bytes: params["raw_upload_size_bytes"],
      ref: params["ref"],
      registries: params["registries"],
      repository_id: params[:repository_id],
      repository_nwo: params[:repository_nwo],
      runner_arch: params["runner_arch"],
      runner_available_disk_space_bytes: params["runner_available_disk_space_bytes"],
      runner_image_version: params["runner_image_version"],
      runner_os_release: params["runner_os_release"],
      runner_os: params["runner_os"],
      runner_total_disk_space_bytes: params["runner_total_disk_space_bytes"],
      scanned_language_extraction_duration_ms: params["scanned_language_extraction_duration_ms"]&.to_i,
      started_at: params["started_at"],
      status: params["status"],
      steady_state_default_setup: params["steady_state_default_setup"],
      testing_environment: params["testing_environment"],
      tools_download_duration_ms_opt: params["tools_download_duration_ms"]&.to_i, # Field renamed with _opt in the protobuf schema
      tools_feature_flags_valid_opt: params["tools_feature_flags_valid"], # Field renamed with _opt in the protobuf schema
      tools_input: params["tools_input"],
      tools_resolved_version: params["tools_resolved_version"],
      tools_source: params["tools_source"],
      trap_cache_cleanup_error: params["trap_cache_cleanup_error"],
      trap_cache_cleanup_size_bytes: params["trap_cache_cleanup_size_bytes"]&.to_i,
      trap_cache_cleanup_skipped_because: params["trap_cache_cleanup_skipped_because"],
      trap_cache_download_duration_ms: params["trap_cache_download_duration_ms"]&.to_i,
      trap_cache_download_size_bytes: params["trap_cache_download_size_bytes"],
      trap_cache_languages: params["trap_cache_languages"],
      trap_cache_upload_duration_ms: params["trap_cache_upload_duration_ms"]&.to_i,
      trap_cache_upload_size_bytes: params["trap_cache_upload_size_bytes"],
      trap_import_duration_ms: params["trap_import_duration_ms"]&.to_i,
      upload_failed_run_error: params["upload_failed_run_error"],
      upload_failed_run_skipped_because: params["upload_failed_run_skipped_because"],
      upload_failed_run_stack_trace: params["upload_failed_run_stack_trace"],
      workflow_languages: params["workflow_languages"],
      workflow_run_attempt: params["workflow_run_attempt"],
      workflow_run_id: params["workflow_run_id"],
      zipped_upload_size_bytes: params["zipped_upload_size_bytes"],
    }
    repo_id = params[:repository_id]
    publish(message, schema: "code_scanning.v0.StatusReport", partition_key: repo_id)
  end

  subscribe("code_scanning.codeql_database_upload") do |payload|
    partition_key = payload[:repository].id
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      uploaded_at: payload[:uploaded_at],
      language: payload[:language],
      size: payload[:size],
      oid: payload[:oid]
    }
    publish(message,
      schema: "code_scanning.v0.CodeqlDatabaseUpload",
      topic: "code_scanning.v0.CodeqlDatabaseUpload",
      partition_key: partition_key)
  end

  subscribe("code_scanning.codeql_database_download") do |payload|
    partition_key = payload[:repository].id
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      downloaded_at: payload[:downloaded_at],
      language: payload[:language],
      size: payload[:size],
      oid: payload[:oid]
    }
    publish(message,
      schema: "code_scanning.v0.CodeqlDatabaseDownload",
      topic: "code_scanning.v0.CodeqlDatabaseDownload",
      partition_key: partition_key)
  end

  subscribe("code_scanning.remote_query_run") do |payload|
    partition_key = payload[:controller_repository].id
    message = {
      controller_repository: serializer.repository(payload[:controller_repository]),
      actor: serializer.user(payload[:actor]),
      created_at: payload[:created_at],
      language: payload[:language],
      repositories_count: payload[:repositories_count],
    }
    publish(message,
      schema: "code_scanning.v0.RemoteQueryRun",
      topic: "code_scanning.v0.RemoteQueryRun",
      partition_key: partition_key)
  end

  subscribe("code_scanning.codeql_bulk_builder_status") do |payload|
    partition_key = payload[:repository_id]
    publish(payload,
      schema: "code_scanning.v0.CodeqlBulkBuilderStatus",
      topic: "code_scanning.v0.CodeqlBulkBuilderStatus",
      partition_key: partition_key)
  end

  subscribe("code_scanning.tool_status") do |payload|
    partition_key = payload[:repository_id]
    delivery_origin_status = payload[:delivery_origin_status].transform_values do |status|
      tool_status_to_symbol(status)
    end
    message = {
      status_trigger: payload[:status_trigger],
      repository_id: payload[:repository_id],
      ref: payload[:ref],
      tool_name: payload[:tool_name],
      status: tool_status_to_symbol(payload[:status]),
      messages: serialise_tool_status_messages(payload[:messages]),
      total_extracted: payload[:total_extracted].to_h,
      languages_extracted: payload[:languages_extracted].to_h,
      delivery_origins: payload[:delivery_origins],
      delivery_origin_status: delivery_origin_status,
    }
    publish(message,
      schema: "hydro.schemas.code_scanning.v0.ToolStatus",
      topic: "code_scanning.v0.ToolStatus",
      partition_key: partition_key)
  end

  subscribe("code_scanning.enable") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: true
    }

    publish(
      message,
      schema: "code_scanning.v0.CodeScanningFeatureToggled",
      topic: "github.code_scanning.v0.CodeScanningFeatureToggled",
      partition_key: payload[:repository_id],
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end

  subscribe("code_scanning.disable") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: false
    }

    publish(
      message,
      schema: "code_scanning.v0.CodeScanningFeatureToggled",
      topic: "github.code_scanning.v0.CodeScanningFeatureToggled",
      partition_key: payload[:repository_id],
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end

  subscribe("browser.code_scanning_autofix.patch_copied") do |payload|
    message =
      payload.slice(:repository_id, :alert_number, :pull_request_id, :pull_request_number)
      .merge(event_type: :AUTOFIX_EVENT_TYPE_PATCH_COPIED)

    publish(
      message,
      schema: "code_scanning.v0.AutofixEvent",
      topic: "code_scanning.v0.AutofixEvent",
      partition_key: payload[:repository_id],
    )
  end

  subscribe("browser.code_scanning_autofix.diff_lines_copied") do |payload|
    message =
      payload.slice(:repository_id, :alert_number, :pull_request_id, :pull_request_number)
      .merge(event_type: :AUTOFIX_EVENT_TYPE_DIFF_LINES_COPIED)

    publish(
      message,
      schema: "code_scanning.v0.AutofixEvent",
      topic: "code_scanning.v0.AutofixEvent",
      partition_key: payload[:repository_id],
    )
  end

  subscribe("code_scanning.autofix_event") do |payload|
    publish(
      payload,
      schema: "code_scanning.v0.AutofixEvent",
      topic: "code_scanning.v0.AutofixEvent",
      partition_key: payload[:repository_id],
    )
  end

  def tool_status_to_symbol(status)
    case status
    when CodeScanning::Status::SUCCESS
      :SUCCESS
    when CodeScanning::Status::ATTENTION
      :ATTENTION
    when CodeScanning::Status::DANGER
      :DANGER
    else
      :UNKNOWN
    end
  end

  # messages are CodeScanning::Status::Error
  def serialise_tool_status_messages(messages)
    messages.map do |message|
      {
        title: message.title,
        # message.message is an ActiveSupport::SafeBuffer. This can't
        # be serialised and overrides to_s to return itself so we need
        # to use to_str instead
        message: message.message.to_str.dup.force_encoding("utf-8").scrub!,
        level: tool_status_to_symbol(message.level),
        analysis_id: message.analysis_id
      }
    end
  end

  subscribe("code_scanning.pull_request_review_comment_reply") do |payload|
    publish(
      GitHub::StreamProcessors::EnvelopeGenerator.new.transform_message_value(payload),
      schema: "github.v1.PullRequestReviewCommentCreate", # we re-use this schema
      topic: "code_scanning.v0.CodeScanningReviewCommentReply",
      partition_key: payload[:repository][:id],
    )
  end

  subscribe("code_scanning.pull_request_review_comment_resolve") do |payload|
    publish(
      GitHub::StreamProcessors::EnvelopeGenerator.new.transform_message_value(payload),
      schema: "github.pull_requests.v1.PullRequestReviewThreadResolveOrUnresolve", # we re-use this schema
      topic: "code_scanning.v0.CodeScanningReviewResolve",
      partition_key: payload[:repository][:id],
    )
  end

  subscribe("code_scanning.pull_request_review_comment_unresolve") do |payload|
    publish(
      GitHub::StreamProcessors::EnvelopeGenerator.new.transform_message_value(payload),
      schema: "github.pull_requests.v1.PullRequestReviewThreadResolveOrUnresolve", # we re-use this schema
      topic: "code_scanning.v0.CodeScanningReviewUnresolve",
      partition_key: payload[:repository][:id],
    )
  end

  subscribe("code_scanning.repository_metrics") do |payload|
    message = {
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      ghas_enabled: payload[:ghas_enabled],
      code_scanning_enabled: payload[:code_scanning_enabled],
      private_repository: payload[:private_repository],
      metric_created_at: payload[:metric_created_at],
    }
    publish(message, schema: "code_scanning.v0.RepositoryMetrics")
  end
end
