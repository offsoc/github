# frozen_string_literal: true

# Configuration for github-dfs hosts. Loads after github-environment.rb.

require "etc"

GitHub.role = :gitbackupsworker

# Allow manually overriding the worker count
worker_count = if File.exist?("/etc/github/gitbackups-migration-job-worker-count")
  File.read("/etc/github/gitbackups-migration-job-worker-count").to_i
end

if !worker_count || worker_count < 2
  worker_count = 5
end

worker_pool worker_count

BackgroundJobQueues.apply_dotcom(self, worker_role: :gitbackups_migration, machine_type: :vm)
