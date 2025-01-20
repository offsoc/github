# typed: true
# frozen_string_literal: true

# Configuration github-exportsworker hosts. Loads after github-environment.rb.

GitHub.role = :exportsworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-exportsworker"
end

T.unsafe(self).worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[30m 2h])
  )
end

T.unsafe(self).worker_pool GitHub.environment.fetch("RESQUED_EXPORTS_WORKERS", 10).to_i, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :exportsworker, machine_type: :vm)
