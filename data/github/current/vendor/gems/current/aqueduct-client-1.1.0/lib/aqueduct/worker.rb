require "aqueduct/worker/result"
require "aqueduct/worker/config"
require "aqueduct/worker/backend"
require "aqueduct/worker/aqueduct_backend"
require "aqueduct/worker/job"
require "aqueduct/worker/job_status"
require "aqueduct/worker/job_killed"
require "aqueduct/worker/worker"
require "aqueduct/worker/switch"

module Aqueduct
  module Worker
    def self.configure
      yield config
    end

    def self.config
      @config ||= Config.new
    end
  end
end
