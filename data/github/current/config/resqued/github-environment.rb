# frozen_string_literal: true

# Common configuration for production, enterprise, review-lab, and staging-lab.
# Not used in development.

# github-*worker.rb should override this.

require "resqued/aqueduct_worker_adapter"
require "resqued/should_start_within_priority"
require "resqued/metrics_reporter"
require "resqued/version_in_procline"
require "resqued/worker_readiness"
require "background_job_queues"

# GitHub.role is used for a bunch of things, including default tags on
# metrics, as a flipper actor, to look up role-specific config, etc.
ENV["GITHUB_CONFIG_ROLE"] ||= "aqueduct"

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(*queues)
end

before_fork do |x|
  # Load the app in resqued-listener. This keeps startup CPU seconds at
  # N (the time to boot the app once) rather than N*M (where M is the
  # number of workers).
  require "#{Rails.root}/config/environment"

  # We don't have to worry about a 10s request timer in background jobs.
  # TODO: we may need to change this for jobs that run in Kubernetes.
  GitRPC.timeout = 30.minutes.to_i
  SpokesAPI.timeout = 5.minutes.to_i
  SpokesAPI.quality_of_service = :QUALITY_OF_SERVICE_FAIL_FAST
  Elastomer.config.read_timeout = 30.seconds.to_i

  # Flush logs immediately. Jobs infrequently enough that the default of
  # 1000 might result in us missing some log lines.
  Rails.logger.auto_flushing = 1 if Rails.logger.respond_to?(:auto_flushing=)

  # We don't need a database connection before forking the workers.
  ActiveRecord::Base.connection_handler.clear_all_connections!(:all)

  # Annotate resqued-listener's procline with the current app version.
  x.app_version = GitHub.current_sha[0, 7]

  GitHub::BootMetrics.record_state("resqued.before_fork")
  GitHub::BootMetrics.send_to_datadog

  # Collect and report worker activity metrics.
  # Disabled in enterprise since dogstatsd is not available.
  Resqued::MetricsReporter.start
end

after_fork do |worker|
  worker.extend(Resqued::VersionInProcline)
  GitHub.cache.reset
  GitHub.cache_partitions.keys.each do |k|
    next if k == :global
    GitHub.cache.for_partition(k).reset
  end
  GitHub::Logger.setup

  # Disable fork-per-job. It adds unnecessary time to each job. Also, we prefer the graceful shutdown behavior that comes with cant_fork=true.
  worker.cant_fork = true

  worker_type_tag =
    case worker.class.name
    when "Resqued::AqueductWorkerAdapter"
      "worker_type:aqueduct"
    else
      "worker_type:unknown"
    end
  GitHub.dogstats.increment("resqued.after_fork.count", tags: [worker_type_tag])
end

after_exit do |worker_summary|
  tags = GitHub.aqueduct_tags
  if worker_summary.process_status.exited?
    tags["exit_status"] = worker_summary.process_status.exitstatus
  end
  if worker_summary.process_status.signaled?
    signal_name = Signal.signame(worker_summary.process_status.termsig)
    tags["signal"] = signal_name
  end
  GitHub.dogstats.timing("resqued.worker.alive_time_ms", worker_summary.alive_time_sec * 1000, tags: tags)
end
