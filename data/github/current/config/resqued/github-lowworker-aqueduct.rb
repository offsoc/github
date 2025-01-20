# frozen_string_literal: true

# Configuration github-lowworker hosts. Loads after github-environment.rb.

GitHub.role = :lowworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-lowworker"
end

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[30m 2h])
  )
end

worker_pool GitHub.environment.fetch("RESQUED_LOW_WORKERS", 20).to_i, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :lowworker, machine_type: :vm)
