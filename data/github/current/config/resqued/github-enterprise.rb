# frozen_string_literal: true

# Shared configuration for all job workers in Enterprise. Loads after
# github-environment.rb.

GitHub.role = :enterpriseworker

require "github/logging/logfmt_formatter"
Resqued::Logging.logger.formatter = ::GitHub::Logging::LogfmtFormatter.new(GitHub::Logger.default_log_data.merge(ns: "resqued"))

high_num  = ENV["ENTERPRISE_RESQUED_HIGH_WORKERS"].to_i
low_num   = ENV["ENTERPRISE_RESQUED_LOW_WORKERS"].to_i
maint_num = ENV["ENTERPRISE_RESQUED_MAINT_WORKERS"].to_i

casts = { "" => nil, "1" => true, "0" => false, "true" => true, "false" => false }

jobs_enabled = casts[ENV["ENTERPRISE_RESQUED_JOBS_ENABLED"]]
maintenance_enabled = casts[ENV["ENTERPRISE_RESQUED_MAINTENANCE_ENABLED"]]

# Trigger loading license so each worker doesn't have to
GitHub::Enterprise.license if GitHub.enterprise?

worker_factory do |queues|
  Resqued::AqueductWorkerAdapter.new(*queues)
end

# all non-maint workers process the high queues.
# low queues are processed only by low workers.
if jobs_enabled
  BackgroundJobQueues.apply_enterprise(
    self,
    high_priority_worker_count: high_num,
    low_priority_worker_count: low_num,
  )
end

if maintenance_enabled
  # Without a specific queue we'll default to one based on the provided local
  # git host name. This is deprecated behavior and should be removed once
  # explicit queues are configured everywhere.
  maintenance_queue = ENV.fetch("ENTERPRISE_RESQUED_MAINTENANCE_QUEUES",
                                "maint_#{GitHub.local_git_host_name}")
  maintenance_queue.split(",").each do |q|
    maint_num.times { worker q }
  end
end

before_fork do |_x|
  # enterprise uses environment variables to inject customer configuration. When
  # resqued reloads due to a customer update, it needs to slurp up the latest
  # environment variables from the shared/env.d/*.sh files.
  lines = Progeny::Command.new(". #{ENV["ENTERPRISE_APP_INSTANCE"]}/.app-config/production.sh && env").out.split("\n")
  enterprise_variables = lines.grep(/\A(ENTERPRISE|GH_|GITHUB)/).map { |l| l.split("=", 2) }
  enterprise_variables.each do |(key, value)|
    ENV[key] = value
  end
end

after_fork do |worker|
  # renice maint worker to very low cpu/io priority
  if worker.queues.any? { |q| q.start_with? "maint_" }
    Process.setpriority(Process::PRIO_PROCESS, 0, 15) # nice 15
    system("ionice", "-c", "3", "-p", $$.to_s) # wish list: ioprio_set(2)
  end
end
