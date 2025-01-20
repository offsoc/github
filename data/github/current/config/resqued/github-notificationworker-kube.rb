# frozen_string_literal: true

# Configuration for notificationworker deployment in Kubernetes. Loads after github-environment.rb.

GitHub.role = ENV.fetch("RESQUED_WORKER_ROLE", "notificationworker").intern
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-notificationworker"
end

before_fork { Resqued::MetricsServer.start }

# Drop a file on disk to indicate that the workers are ready.
after_fork { |_worker| Resqued::WorkerReadiness.report_ready }

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(
    *queues,
    prioritize_by: Resqued::ShouldStartWithinPriority.new(buckets: %w[1m 30m 2h])
  )
end

pool_size = ENV["RESQUED_WORKER_POOL_SIZE"].to_i
pool_size = 1 if pool_size < 1
worker_pool pool_size, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :notificationworker, machine_type: :kube)
