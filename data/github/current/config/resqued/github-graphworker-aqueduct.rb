# frozen_string_literal: true

# Configuration for github-graphworker hosts. Loads after github-environment.rb.

GitHub.role = :graphworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-graphworker"
end

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[30m 2h])
  )
end

worker_pool GitHub.environment.fetch("RESQUED_GRAPH_WORKERS", 15).to_i, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :graphworker, machine_type: :vm)
