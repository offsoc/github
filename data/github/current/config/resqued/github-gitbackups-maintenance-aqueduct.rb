# frozen_string_literal: true

# Configuration for gitbackups-maintenance hosts. Loads after github-environment.rb.

require "etc"

GitHub.role = :gitbackupsworker

# Allow manually overriding the worker count
worker_count = if File.exist?("/etc/github/background-job-worker-count")
  File.read("/etc/github/background-job-worker-count").to_i
end

if !worker_count || worker_count < 2
  worker_count = Etc.nprocessors
end

worker_pool worker_count + 1

# Unlike other queues, we don't configure this one in config/background_job_queues/gitbackups.yml because we don't
# want to configure it per-environment and we never want it being processed by any other types of workers (e.g.
# generic aqueduct workers in proxima). Defining it here means that it can be processed only by gitbackups-maintenance
# workers in whichever environments those are deployed.
queue "gitbackups_maintenance"

# These queues are special because they require a gitbackups deployment (i.e. they directly spawn git-backup
# processes). In Proxima, we don't have backupworkers, so run them on the gitbackups-maintenance workers instead.
if GitHub.multi_tenant_enterprise?
  queue "gitbackups_sweeper"
  queue "gitbackups_scheduler"
  queue "gitbackups_encryption"
end
