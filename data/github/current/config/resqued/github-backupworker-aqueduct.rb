# frozen_string_literal: true

# Configuration for github-backupworker hosts. Loads after github-environment.rb.

GitHub.role = :backupworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-backupworker"
end

# Allow manually overriding the worker count
worker_count = if File.exist?("/etc/github/background-job-worker-count")
  File.read("/etc/github/background-job-worker-count").to_i
end

if !worker_count || worker_count < 2
  worker_count = Etc.nprocessors
end

worker_pool worker_count + 1

BackgroundJobQueues.apply_dotcom(self, worker_role: :backupworker, machine_type: :vm)
