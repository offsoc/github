# frozen_string_literal: true

# Hydro event subscriptions related to background jobs.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("performed.job") do |payload|
    time_since_boot = Process.clock_gettime(Process::CLOCK_MONOTONIC).to_i - GitHub::BootMetrics.initial_boot_time.to_i

    if error = GitHub::JobStats.error
      exception = "#{error.class}: #{error}"
      backtrace = format_backtrace(error)
      will_retry = GitHub::JobStats.will_retry?
    end

    freno_stats, mysql_stats, rpc_stats = payload.values_at(:freno_stats, :mysql_stats, :rpc_stats)

    message = {
      queue: payload[:queue],
      backend: :AQUEDUCT,
      job_class: payload[:job_class],
      active_job_id: payload[:active_job_id],
      aqueduct_job_id: payload[:aqueduct_job_id],
      success: payload[:success],
      exception: exception,
      exception_backtrace: backtrace,
      will_retry: will_retry,
      execution_time_ms: payload[:timer]&.elapsed_ms,
      cpu_time_ms: payload[:timer]&.elapsed_cpu_ms,
      idle_time_ms: payload[:timer]&.elapsed_idle_ms,
      worker_pool: Aqueduct::Worker.config.worker_pool || "",
      hostname: GitHub.local_host_name,
      pid: Process.pid,
      process_runtime_seconds: time_since_boot,
      current_ref: GitHub.current_ref,
      revision: GitHub.current_sha,
      catalog_service: payload[:catalog_service],
      mysql_queries: mysql_stats[:query_count],
      mysql_primary_queries: mysql_stats[:primary_query_count],
      mysql_time_ms: mysql_stats[:query_time_ms],
      mysql_time_ms_by_cluster: mysql_stats[:query_times_ms_by_db]&.transform_keys(&:to_s),
      mysql_queries_by_cluster: mysql_stats[:query_count_by_db],
      mysql_query_types_per_host: mysql_stats[:queries_count_by_type]&.flat_map do |host, counts|
        counts.map do |type, count|
          { host: host, type: type, count: count }
        end
      end,
      gitrpc_count: rpc_stats[:gitrpc_count],
      gitrpc_time_ms: rpc_stats[:gitrpc_time_ms],
      freno_timeouts: freno_stats[:timeouts],
      freno_errors: freno_stats[:errors],
      freno_time_ms_by_cluster: freno_stats[:total_waited_ms_by_cluster]&.transform_keys(&:to_s),
    }

    initial_mem_usage, current_mem_usage = GitHub::JobStats.memory_usage_report
    if initial_mem_usage.present? && current_mem_usage.present?
      delta = current_mem_usage.delta(initial_mem_usage)
      message.merge!({
        memory_usage_recorded: true,
        memory_rss_bytes: current_mem_usage.rss,
        memory_shared_bytes: current_mem_usage.shared,
        memory_private_bytes: current_mem_usage.priv,
        memory_rss_delta_bytes: delta.rss,
        memory_shared_delta_bytes: delta.shared,
        memory_private_delta_bytes: delta.priv,
      })
    end

    if GitHub::JobStats.enqueued.any?
      message[:enqueue_time_ms] = GitHub::JobStats.enqueue_time_ms
      message[:enqueue_time_ms_by_backend] = GitHub::JobStats.enqueue_time_per_backend_ms.transform_keys(&:to_s)
      message[:jobs_enqueued] = GitHub::JobStats.enqueued.transform_keys(&:to_s)
      message[:jobs_enqueued_by_backend] = GitHub::JobStats.enqueue_count_per_backend_ms.transform_keys(&:to_s)
    end

    publish(message, schema: "github.v1.JobComplete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  def format_backtrace(error)
    Failbot::BacktraceParser.call(error).first(500).join("\n")
  rescue Failbot::Backtrace::Frame::ParseError
    "#{error.class.name}: " + (error.try(:backtrace) || []).first.to_s
  end
end
