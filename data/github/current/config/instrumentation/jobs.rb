# frozen_string_literal: true

# Reporting timing info for job related events
require "github/config/notifications"
require "github/config/stats"

GitHub.subscribe "dequeued.background_job" do |_, start, ending, _, payload|
  class_name, queue, backend, catalog_service = payload.values_at(:class, :queue, :backend, :catalog_service)
  duration_ms = (ending - start) * 1_000
  tags = [
    "class:#{class_name}",
    "queue:#{queue}",
    "backend:#{backend}",
    "catalog_service:#{catalog_service}",
  ]
  tags.append("backend_name:#{GitHub::JobStats.backend_name}") if GitHub::JobStats.backend_name
  GitHub.dogstats.distribution("job.time_enqueued", duration_ms, { tags: tags })

  queue_should_start_within_secs = BackgroundJobQueues.queue_configurations.dig(queue, :scheduling_hints, :should_start_within_secs)
  if queue_should_start_within_secs && duration_ms > queue_should_start_within_secs * 1000
    GitHub.dogstats.count("job.scheduling_hints.should_start_within.violations", 1, tags: tags)
  end
end

GitHub.subscribe "performed.background_job" do |_, start, ending, _, payload|
  class_name, queue, success, topic, freno_stats, mysql_stats, rpc_stats = payload.values_at(:class, :queue, :success, :topic, :freno_stats, :mysql_stats, :rpc_stats)
  duration_ms = (ending - start) * 1_000

  tags = [
    "class:#{class_name}",
    "queue:#{queue}",
    "status:#{success ? "success" : "failed"}",
    "catalog_service:#{payload[:catalog_service]}",
  ]

  if defined? RubyVM::YJIT.enable
    yjit_enabled_tag = RubyVM::YJIT.enabled? ? "yjit_enabled:true" : "yjit_enabled:false"
    yjit_tags = [yjit_enabled_tag]
    yjit_tags_per_perform = tags + yjit_tags

    if RubyVM::YJIT.enabled?
      yjit_info = GitHub::DataCollector::YJITStatsCollector.get_instance

      GitHub.dogstats.distribution("job.yjit.inline_code_size", yjit_info.inline_code_size, tags: yjit_tags)
      GitHub.dogstats.distribution("job.yjit.inline_code_size_per_perform", yjit_info.inline_code_size_per_req, tags: yjit_tags_per_perform)
      GitHub.dogstats.distribution("job.yjit.outlined_code_size", yjit_info.outlined_code_size, tags: yjit_tags)
      GitHub.dogstats.distribution("job.yjit.outlined_code_size_per_perform", yjit_info.outlined_code_size_per_req, tags: yjit_tags_per_perform)
      GitHub.dogstats.distribution("job.yjit.vm_insns_count", yjit_info.vm_insns_count, tags: yjit_tags)
      GitHub.dogstats.distribution("job.yjit.vm_insns_count_per_perform", yjit_info.vm_insns_count_per_req, tags: yjit_tags_per_perform)
      GitHub.dogstats.distribution("job.yjit.yjit_alloc_size", yjit_info.yjit_alloc_size, tags: yjit_tags)
      GitHub.dogstats.distribution("job.yjit.yjit_alloc_size_per_perform", yjit_info.yjit_alloc_size_per_req, tags: yjit_tags_per_perform)
      GitHub.dogstats.distribution("job.yjit.compile_time_ns", yjit_info.compile_time_ns, tags: yjit_tags)
      GitHub.dogstats.distribution("job.yjit.compile_time_ns_per_perform", yjit_info.compile_time_ns_per_req, tags: yjit_tags_per_perform)

      if RubyVM::YJIT.stats_enabled?
        GitHub.dogstats.distribution("job.yjit.yjit_insns_count", yjit_info.yjit_insns_count, tags: yjit_tags)
        GitHub.dogstats.distribution("job.yjit.yjit_insns_count_per_perform", yjit_info.yjit_insns_count_per_req, tags: yjit_tags_per_perform)
        GitHub.dogstats.distribution("job.yjit.side_exit_count", yjit_info.side_exit_count, tags: yjit_tags)
        GitHub.dogstats.distribution("job.yjit.side_exit_count_per_perform", yjit_info.side_exit_count_per_req, tags: yjit_tags_per_perform)
        GitHub.dogstats.distribution("job.yjit.total_exit_count", yjit_info.total_exit_count, tags: yjit_tags)
        GitHub.dogstats.distribution("job.yjit.total_exit_count_per_perform", yjit_info.total_exit_count_per_req, tags: yjit_tags_per_perform)
        GitHub.dogstats.distribution("job.yjit.ratio_in_yjit", yjit_info.ratio_in_yjit, tags: yjit_tags)
        GitHub.dogstats.distribution("job.yjit.ratio_in_yjit_per_perform", yjit_info.ratio_in_yjit_per_req, tags: yjit_tags_per_perform)
        GitHub.dogstats.distribution("job.yjit.avg_len_in_yjit", yjit_info.avg_len_in_yjit, tags: yjit_tags)
        GitHub.dogstats.distribution("job.yjit.avg_len_in_yjit_per_perform", yjit_info.avg_len_in_yjit_per_req, tags: yjit_tags_per_perform)
      end
    end
  end

  tags_with_backend = tags + ["backend:#{payload[:backend]}"]
  tags_with_backend.append("backend_name:#{GitHub::JobStats.backend_name}") if GitHub::JobStats.backend_name
  tags_with_backend.append("topic:#{topic}") if topic.present?
  GitHub.dogstats.distribution("job.time", duration_ms, { tags: tags_with_backend })

  if payload[:timer].present?
    timer = payload[:timer]
    GitHub.dogstats.distribution("job.cpu.time_ms", timer.elapsed_cpu_ms, { tags: tags_with_backend })
    GitHub.dogstats.distribution("job.idle.time_ms", timer.elapsed_idle_ms, { tags: tags_with_backend })
  end

  queue_slos = BackgroundJobQueues.queue_slos
  if queue_slos.has_key?(queue) && duration_ms > queue_slos[queue]
    GitHub.dogstats.count("job.slo.violations", 1, tags: tags_with_backend)
  end

  job_allocations = GC.stat(:total_allocated_objects) - payload[:pre_perform_allocation_count]
  GitHub.dogstats.gauge "job.gc.eden_pages", GC.stat(:heap_eden_pages), tags: tags
  GitHub.dogstats.gauge "job.gc.live_slots", GC.stat(:heap_live_slots), tags: tags
  GitHub.dogstats.gauge "job.gc.free_slots", GC.stat(:heap_free_slots), tags: tags
  GitHub.dogstats.gauge "job.gc.allocations", job_allocations, tags: tags

  # MySQL metrics reporting
  db_counts = mysql_stats[:db_counts] || {}
  db_counts.each do |db_host, counts|
    counts ||= {}
    tags_with_host = tags + ["rpc_host:#{db_host}"]

    GitHub.dogstats.count("job.rpc.mysql.count.reads", counts[:read].to_i, tags: tags_with_host)
    GitHub.dogstats.count("job.rpc.mysql.count.writes", counts[:write].to_i, tags: tags_with_host)
  end

  query_count_by_db = mysql_stats[:query_count_by_db] || {}
  query_count_by_db.each do |db_cluster, counts|
    GitHub.dogstats.count("job.rpc.mysql.queries", counts, tags: tags + ["cluster:#{db_cluster}"])
  end

  query_times_ms_by_db = mysql_stats[:query_times_ms_by_db] || {}
  query_times_ms_by_db.each do |db_cluster, sum_times|
    GitHub.dogstats.distribution("job.rpc.mysql.time_ms", sum_times, tags: tags + ["cluster:#{db_cluster}"])
  end

  # RPC metrics reporting
  gitrpc_count, gitrpc_time_ms = rpc_stats.values_at(:gitrpc_count, :gitrpc_time_ms)
  if gitrpc_count.present? && gitrpc_time_ms.present?
    GitHub.dogstats.distribution("job.rpc.gitrpc.time_ms", gitrpc_time_ms, tags: tags)
    GitHub.dogstats.count("job.rpc.gitrpc.count", gitrpc_count, tags: tags)
  end

  # Freno metrics reporting
  throttle_calls_by_cluster, total_waited_ms_by_cluster, timeouts_by_cluster, errors_by_cluster, open_circuits_by_cluster = freno_stats.values_at(:throttle_calls_by_cluster, :total_waited_ms_by_cluster, :timeouts_by_cluster, :errors_by_cluster, :open_circuits_by_cluster)

  throttle_calls_by_cluster.each do |cluster, count|
    GitHub.dogstats.count("job.freno.throttle.calls", count, tags: tags + ["cluster:#{cluster}"])
  end

  total_waited_ms_by_cluster.each do |cluster, time|
    GitHub.dogstats.distribution("job.freno.throttle.time_ms", time, tags: tags + ["cluster:#{cluster}"])
  end

  timeouts_by_cluster.each do |cluster, count|
    GitHub.dogstats.count("job.freno.throttle.timeouts", count, tags: tags + ["cluster:#{cluster}"])
  end

  errors_by_cluster.each do |cluster, count|
    GitHub.dogstats.count("job.freno.throttle.errors", count, tags: tags + ["cluster:#{cluster}"])
  end

  open_circuits_by_cluster.each do |cluster, count|
    GitHub.dogstats.count("job.freno.throttle.open_circuits", count, tags: tags + ["cluster:#{cluster}"])
  end

  # Process memory usage reporting
  initial_mem_usage, current_mem_usage = GitHub::JobStats.memory_usage_report
  if initial_mem_usage.present? && current_mem_usage.present?
    usage_delta = current_mem_usage.delta(initial_mem_usage)
    GitHub.dogstats.distribution("job.mem.rss_delta", usage_delta.rss, tags: tags)
    GitHub.dogstats.distribution("job.mem.shared_delta", usage_delta.shared, tags: tags)
    GitHub.dogstats.distribution("job.mem.private_delta", usage_delta.priv, tags: tags)
  end
end

if GitHub::AppEnvironment.staging? || GitHub.enterprise?
  GitHub.subscribe(/\.background_job\Z/) do |name, start, ending, _, payload|
    ms = 1000.0 * (ending - start)
    Rails.logger.info "#{start} [metrics #{name.split('.').reverse.join('.')}]: #{payload.inspect} #{ms}ms"
  end
else
  GitHub.subscribe "dequeued.background_job" do |_, start, ending, _, payload|
    formatted_class = payload[:class].tr("/", "-")
    sec = ending - start

    # We need to maintain old compatibility with graphite keys
    JobReporter.handle_queue(payload.merge(class: formatted_class), sec)
  end

  GitHub.subscribe "performed.background_job" do |_, start, ending, _, payload|
    formatted_class = payload[:class].tr("/", "-")
    sec = ending - start
    # We need to maintain old compatibility with graphite keys
    JobReporter.handle_job(payload.merge(class: formatted_class), sec)
  end
end

GitHub.subscribe("enqueue.active_job") do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)

  event.payload[:job].tap do |job|
    GitHub.dogstats.increment("active_job.enqueued", tags: job.all_stats_tags)
    GitHub.dogstats.distribution("active_job.enqueue.dist.time", event.duration, tags: event.payload[:job].all_stats_tags)
    GitHub::JobStats.record_enqueue(job_class: job.class)
  end
end

GitHub.subscribe("enqueue_at.active_job") do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)

  event.payload[:job].tap do |job|
    GitHub.dogstats.increment("active_job.enqueued_at", tags: job.all_stats_tags)
    GitHub.dogstats.distribution("active_job.enqueue.dist.time", event.duration, tags: event.payload[:job].all_stats_tags)
    GitHub::JobStats.record_enqueue(job_class: job.class)
  end
end

GitHub.subscribe("enqueue_all.active_job") do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)
  tags = ["batch_size:#{event.payload[:enqueued_count]}"]

  GitHub.dogstats.increment("active_job.enqueued_all", tags: tags)
  GitHub.dogstats.distribution("active_job.enqueue_all.dist.time", event.duration, tags: tags)
end

GitHub.subscribe("perform.active_job") do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)
  job, error = event.payload.values_at(:job, :exception_object)
  tags = job.all_stats_tags(error: error)

  result = job.performance_result
  tags << "result:#{result}" if result

  handled_error_name = job.handled_error&.class&.to_s&.underscore
  tags << "handled_error:#{handled_error_name}" if handled_error_name

  GitHub.dogstats.increment("active_job.performed", tags: tags)
  GitHub.dogstats.distribution("active_job.perform.dist.time", event.duration, tags: tags)
end

GitHub.subscribe("error.active_job") do |*, payload|
  if payload[:on] == :enqueue
    payload.values_at(:job, :error).tap do |job, error|
      GitHub.dogstats.increment("active_job.enqueue_error", tags: job.all_stats_tags(error: error))
    end
  end

  payload.values_at(:job, :error, :on).tap do |job, error, on|
    tags = job.all_stats_tags(error: error)
    tags << "on:#{on}" if on
    GitHub.dogstats.increment("active_job.error", tags: tags)
  end
end

GitHub.subscribe("discard.active_job") do |*, payload|
  payload.values_at(:job, :error).tap do |job, error|
    GitHub.dogstats.increment("active_job.discard", tags: job.all_stats_tags(error: error))
  end
end

GitHub.subscribe("enqueue_retry.active_job") do |*, payload|
  payload.values_at(:job, :error, :wait).tap do |job, error, wait|
    if error
      GitHub::JobStats.record_error(error, will_retry: true)
      GitHub.logger.error(
        "Retrying #{job.class} in #{wait} seconds, due to a #{error.class}. The original exception was #{error.cause.inspect}.",
        {
          exception: error,
          "code.namespace": job.class.name,
          "gh.job.attempts": job.executions,
        }
      )
      GitHub.dogstats.increment("active_job.retry", tags: job.all_stats_tags(error: error, attempt_number: job.executions))
    end
  end
end

GitHub.subscribe("retry_stopped.active_job") do |*, payload|
  payload.values_at(:job, :error).tap do |job, error|
    if error
      GitHub::JobStats.record_error(error, will_retry: false)
      GitHub.logger.error("Stopped retrying #{job.class} due to a #{error.class}, which reoccurred on #{job.executions} attempts. The original exception was #{error.cause.inspect}.")
      GitHub.dogstats.increment("active_job.stop_retry", tags: job.all_stats_tags(error: error))
    end
  end
end

module JobReporter
  NEWSLETTER_DELIVERY_RUN_JOB_CLASS_NAME = "github-jobs-newsletter_delivery_run".freeze
  REFRESH_SPONSORS_MEMBERSHIPS_CRITERIA_JOB_CLASS_NAME =
    "github-jobs-refresh_sponsors_memberships_criteria_job".freeze

  BACKGROUND_DESTROY_QUEUE_NAME = "background_destroy".freeze
  BACKUP_QUEUE_TYPE = "backup".freeze
  MAINT_QUEUE_TYPE = "maint".freeze
  VERIFY_QUEUE_TYPE = "verify".freeze

  DEFAULT_MAX_JOB_DURATION = 10.minutes
  MAX_JOB_DURATIONS = {
    NEWSLETTER_DELIVERY_RUN_JOB_CLASS_NAME => 30.minutes,
    REFRESH_SPONSORS_MEMBERSHIPS_CRITERIA_JOB_CLASS_NAME => 30.minutes,
  }.freeze

  DEFAULT_MAX_QUEUE_DELAY = 1.minute
  MAX_QUEUE_DELAYS = {
    BACKGROUND_DESTROY_QUEUE_NAME => 10.minutes,
    BACKUP_QUEUE_TYPE => 10.minutes,
    MAINT_QUEUE_TYPE => 10.minutes,
  }.freeze

  class Error < StandardError
  end

  # Special error classes for tracking jobs that are taking a long time to run
  # or are sitting in the queue for a long time
  class LongRun < Error
  end

  # Threshold, in seconds, to decide a job has been running long enough to report
  def self.threshold_for_job_run(job)
    MAX_JOB_DURATIONS.fetch(job, DEFAULT_MAX_JOB_DURATION)
  end

  # Threshold, in seconds, to decide a job has been queued long enough to report
  def self.threshold_for_queue_delay(queue)
    queue_type = queue_type(queue)
    MAX_QUEUE_DELAYS.fetch(queue_type, DEFAULT_MAX_QUEUE_DELAY)
  end

  # Some queues come in batches, like fs-related queues where each server gets its own
  def self.queue_type(queue)
    case queue
    when /\Abackup_/ then BACKUP_QUEUE_TYPE
    when /\Agitbackups_/ then BACKUP_QUEUE_TYPE
    when /\Amaint_/  then MAINT_QUEUE_TYPE
    when /\Averify_/ then VERIFY_QUEUE_TYPE
    else queue
    end
  end

  def self.handle_job(payload, sec)
    return if skip_exception_reporting?(payload[:queue])
    return unless threshold = threshold_for_job_run(payload[:class])
    return unless sec >= threshold

    sec = "%.2f" % sec
    e = LongRun.new "#{payload[:class]} took #{sec}s"
    e.set_backtrace(caller)

    # roll up long-running job needles based on job class
    report(e, rollup: payload[:class])
  end

  def self.handle_queue(payload, sec)
    return if skip_exception_reporting?(payload[:queue])
    return unless threshold = threshold_for_queue_delay(payload[:queue])
    return unless sec >= threshold

    class_name, queue = payload.values_at(:class, :queue, :success, :db_counts)
    tags = ["class:#{class_name}", "queue:#{queue}"]
    GitHub.dogstats.increment("job.long_delay", tags: tags)
  end

  # report to Sentry, don't raise
  def self.report(e, rollup:)
    return if ENV.fetch("GH_PERF_NEEDLES_DISABLED", 0) != 0

    GitHub::ServiceMapping.remove_failbot_catalog_service!

    Failbot.report!(e,
      app: "github-queue-health",
      rollup: Digest::SHA256.hexdigest([e.class.name, rollup].join("|")),
    )
  end

  def self.skip_exception_reporting?(queue_name)
    queue_type = queue_type(queue_name)
    queue_types = [BACKUP_QUEUE_TYPE, MAINT_QUEUE_TYPE]
    queue_types.include?(queue_type)
  end
end
