# frozen_string_literal: true

# Configuration for lab and review-lab environments.
# Loads after github-environment.rb.

require "resqued/metrics_server"
require "resqued/worker_readiness"

# Provide aqueduct.workers.count metrics
before_fork { Resqued::MetricsServer.start }

# If running in Kubernetes, drop a file on disk to indicate that the workers are ready.
after_fork { |_worker| Resqued::WorkerReadiness.report_ready }

# When adding new staff hosts/environments, you'll want to be sure you adjust
# GitHub.background_job_queue_prefix in lib/github/config/environments/production/staff.rb
# as well
queue_prefix = ENV.fetch("RESQUED_QUEUE_PREFIX") do
  case GitHub.lab_type
  when "gitauth-lab", "garage"
    GitHub.lab_type
  else
    "lab"
  end
end

GitHub.role = :lab

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[30m 2h])
  )
end

worker_pool 8, shuffle_queues: true

BackgroundJobQueues.apply_simple(self, environment: :staff, queue_prefix: "#{queue_prefix}_")
