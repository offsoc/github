# frozen_string_literal: true

# Configuration for github-highworker hosts. Loads after github-environment.rb.

GitHub.role = :highworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-highworker"
end

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[10m 30m])
  )
end

# Configure worker pool sizes for aqueduct
worker_pool GitHub.environment.fetch("RESQUED_HIGH_WORKERS", 20).to_i, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :highworker, machine_type: :vm)
