# frozen_string_literal: true

# Configuration for github-dfs hosts. Loads after github-environment.rb.

require "progeny"

GitHub.role = :fsworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-dfs"
end

# During provisioning, temporarily increase the number of workers so that
# the host can pick up replicas from rebalancing more quickly.
# See https://github.com/github/dgit-project/blob/033ad3463d78ba79042d90934ab20c73c4e8c52a/docs/provisioning.md
worker_count = if File.exist?("/etc/github/background-job-worker-count")
  File.read("/etc/github/background-job-worker-count").to_i
end
if !worker_count || worker_count < 2
  # Give mostly empty DFS servers more workers, because they're going to run
  # a larger number of migration jobs to absorb networks and gists from
  # hosts that are evacuating or mostly full.
  df_line = Progeny::Command.new("df", "-P", "/data/repositories").out.lines.grep(/repositories/).first || ""
  df_pct = df_line.split[4].to_i   # % used
  if df_pct < 75
    worker_count = 8
  else
    worker_count = 2
  end
end

# By default, a feature flag controls the percentage of aqueduct workers assigned to aqueduct primary
# vs. aqueduct secondary (the backup cluster). Each DFS host works its own dedicated queues, so the
# hosts are not good candidates for an actor-based feature flag because a 1% rollout over 30 workers
# could yield 0 workers for the secondary. Dark ship feature flagging (i.e. a % of dequeues per worker)
# also doesn't work well because workers with a primary backlog will get stuck dequeueing from  the
# empty secondary. This problem is compounded by DFS worker backoff.
#
# To avoid problems with actor-based feature flagging, we need to ensure that at least one worker
# is assigned to the secondary.
GitHub.at_least_one_aqueduct_secondary_worker = true

# Configure worker pool sizes for aqueduct
worker_pool worker_count

BackgroundJobQueues.apply_dotcom(self, worker_role: :fs, machine_type: :vm)

after_fork  do |_worker|
  # make maint worker very cpu and io nice
  Process.setpriority(Process::PRIO_PROCESS, 0, 15)   # nice 15
  system("ionice", "-c", "3", "-p", Process.pid.to_s) # wish list: ioprio_set(2)
end
