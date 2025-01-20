# frozen_string_literal: true

# Configuration for github-depworker hosts. Loads after github-environment.rb.

GitHub.role = :depworker
Aqueduct::Worker.configure do |config|
  config.worker_pool = "github-depworker"
end

default_pool = 24
repo_dep_pool = GitHub.environment.fetch("DEPWORKER_REPOSITORY_DEPENDENCIES_POOL", default_pool).to_i
vuln_id_pool = GitHub.environment.fetch("DEPWORKER_VULNERABILITY_IDENTIFICATION_POOL", default_pool).to_i
dependabot_pool = GitHub.environment.fetch("DEPWORKER_DEPENDABOT_POOL", default_pool).to_i

worker_pool [repo_dep_pool, vuln_id_pool, dependabot_pool].max, shuffle_queues: true

BackgroundJobQueues.apply_dotcom(self, worker_role: :depworker, machine_type: :vm)
