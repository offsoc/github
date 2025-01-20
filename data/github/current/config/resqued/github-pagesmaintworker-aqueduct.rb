# frozen_string_literal: true

# Configuration for github-pagesmaintworker hosts. Loads after github-environment.rb.

GitHub.role = :pagesmaintworker

# If the host is missing the enabled file (and we're not in test mode), then worker_pool should be 0.
if !(GitHub::AppEnvironment.test? || File.file?("/etc/github/enabled"))
  # Disable the workers if the host isn't enabled.
  worker_pool 0
else
  worker_pool GitHub.environment.fetch("RESQUED_PAGESMAINT_WORKERS", 30).to_i
end

BackgroundJobQueues.apply_dotcom(self, worker_role: :pagesmaintworker, machine_type: :vm)
