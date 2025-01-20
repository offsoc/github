# frozen_string_literal: true

# Shared configuration for all job workers in proxima. Loads after github-environment.rb.

GitHub.role = :worker

Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-worker"
end

require "github/logging/logfmt_formatter"
Resqued::Logging.logger.formatter = ::GitHub::Logging::LogfmtFormatter.new(GitHub::Logger.default_log_data.merge(ns: "resqued"))

# These are required and set in kube configs, use fetch without a default.
high_num  = ENV.fetch("HIGH_WORKERS").to_i
low_num   = ENV.fetch("LOW_WORKERS").to_i

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(*queues)
end

# all workers process the high queues.
# low queues are processed only by low workers.
BackgroundJobQueues.apply_proxima(
  self,
  high_priority_worker_count: high_num,
  low_priority_worker_count: low_num,
)

after_fork { |_worker| Resqued::WorkerReadiness.report_ready }
