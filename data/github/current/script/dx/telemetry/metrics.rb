# typed: true
# frozen_string_literal: true

require "json"

module DX
  module Metrics
    # A metric that basically adds a count of 1 each time submit is called.
    class Usage
      def initialize(metric_name, tags, metrics_backend, clock: lambda { Time.now.to_f })
        @metric_name = metric_name
        @tags = tags
        @metrics_backend = metrics_backend
        @start_time = clock.call
      end

      def submit(tags = [])
        @metrics_backend.submit_count(@metric_name, @start_time.to_i, 1, @tags | tags)
      end
    end

    # A metric that registers the runtime since its creation each time submit is called.
    class Runtime
      def initialize(metric_name, tags, metrics_backend, clock: lambda { Time.now.to_f })
        @metric_name = metric_name
        @tags = tags
        @metrics_backend = metrics_backend
        @clock = clock
        @start_time = clock.call
      end

      def submit(tags = [])
        runtime_ms = ((@clock.call - @start_time) * 1000).to_i
        @metrics_backend.submit_distribution_points(@metric_name, @start_time.to_i, [runtime_ms], @tags | tags)
      end
    end

    class RuntimeWithValue
      def initialize(metric_name, tags, metrics_backend, value, clock: lambda { Time.now.to_f })
        @metric_name = metric_name
        @tags = tags
        @metrics_backend = metrics_backend
        @clock = clock
        @start_time = clock.call
        @value = value
      end

      def submit(tags = [])
        @metrics_backend.submit_distribution_points(@metric_name, @start_time.to_i, [@value], @tags | tags)
      end
    end

    # A wrapper for metrics that makes them resilient to StandardErrors.
    class ResilientMetric
      def initialize(metric)
        @metric = metric
      end

      def submit(tags = [])
        @metric.submit(tags)
        # This is a valid use case for a blanket rescue of StandardError (not just Exception), because we do not want
        # to interfere with the normal execution of a script if metrics submission fails.
      rescue => e
        # If this error message causes trouble in certain situations, we could silence it optionally.
        puts "Failed to submit metric: #{e.message}"
      end
    end

    # A wrapper for metrics which adds a success tag that captures whether the code executed since the creation of
    # the metric succeeded or not.
    # The outcome is based on the value of `$!` (the last error). In this way we can capture the success of a block of
    # code as well as the success of a script using the `at_exit`` hook.
    class SuccessTagWrapper
      def initialize(metric, last_error: lambda { $! })
        @metric = metric
        @last_error = last_error
      end

      def submit(tags = [])
        last_error = @last_error.call
        # The execution is considered successful if there was no error or if the error was a SystemExit which itself
        # is indicating success.
        success = last_error.nil? || (last_error.is_a?(SystemExit) && last_error.success?)
        @metric.submit(tags | ["success:#{success}"])
      end
    end

    # A wrapper for metrics which adds a tag capturing the Rails environment.
    class EnvironmentTagWrapper
      def initialize(metric)
        @metric = metric
      end

      def submit(tags = [])
        @metric.submit(tags | ["env:#{Rails.env}"])
      end
    end

    # A wrapper for metrics which adds a tag capturing a hash of the current GitHub user.
    class UserTagWrapper
      def initialize(metric)
        @metric = metric
      end

      def submit(tags = [])
        user = ENV["GITHUB_USER"] || "none"
        @metric.submit(tags | ["user:#{user}"])
      end
    end

    class DevcontainerTagWrapper
      CODESPACES_MERGED_DEVCONTAINER = "/workspaces/.codespaces/shared/merged_devcontainer.json"

      def initialize(metric)
        @metric = metric
      end

      def self.devcontainer_name
        if File.exist?(CODESPACES_MERGED_DEVCONTAINER)
          devcontainer_json = JSON.parse(File.read(CODESPACES_MERGED_DEVCONTAINER))
          devcontainer_json["name"]
        else
          "unknown"
        end
      end

      def submit(tags = [])
        @metric.submit(tags | ["devcontainer:#{DevcontainerTagWrapper::devcontainer_name}"])
      end
    end

    class ServerFeaturesTagWrapper
      def initialize(metric)
        @metric = metric
      end

      def ngrok?
        !!ENV["NGROK_AUTHTOKEN"]
      end

      def multi_tenant?
        !!ENV["MULTI_TENANT_ENTERPRISE"]
      end

      def is_runtime_environment_enterprise?
        %w(ENTERPRISE E FI).any? { |var| !ENV[var].to_s.empty? } ||
        (File.exist?("tmp/runtime/current") && File.read("tmp/runtime/current").chomp == "enterprise")
      end

      def server_feature_tags
        server_features = []
        server_features << "ngrok:true" if ngrok?
        server_features << "multi_tenant:true" if multi_tenant?
        server_features << "runtime_environment:enterprise" if is_runtime_environment_enterprise?
        server_features
      end

      def submit(tags = [])
        @metric.submit(tags | server_feature_tags)
      end
    end
  end
end
