# frozen_string_literal: true

# Configuration for hydroworker deployment in Kubernetes. Loads after github-environment.rb.

require "resqued/metrics_server"
require "resqued/worker_readiness"

GitHub.role = :hydroworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-hydroworker"
end

# Provide aqueduct.workers.count metrics
before_fork { Resqued::MetricsServer.start }

# Drop a file on disk to indicate that the workers are ready.
after_fork { |_worker| Resqued::WorkerReadiness.report_ready }


worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[30m 2h])
  )
end

worker_pool ENV.fetch("RESQUED_WORKER_POOL_SIZE", 10).to_i, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :hydroworker, machine_type: :kube)
