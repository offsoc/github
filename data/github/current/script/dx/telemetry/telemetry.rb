# typed: true
# frozen_string_literal: true

require_relative "metrics"
require_relative "datadog"

module DX
  module Telemetry
    ENVIRONMENT_TAG = :environment_tag
    SUCCESS_TAG = :success_tag
    USER_TAG = :user_tag
    DEVCONTAINER_TAG = :devcontainer_tag
    SERVER_FEATURES = :server_features
    RESILIENT = :resilient

    def self.metric_with_settings(metric, settings)
      resilient = settings.include?(RESILIENT)
      settings.delete(RESILIENT)
      settings.reverse_each do |setting|
        metric = case setting
        when ENVIRONMENT_TAG
          Metrics::EnvironmentTagWrapper.new(metric)
        when SUCCESS_TAG
          Metrics::SuccessTagWrapper.new(metric)
        when USER_TAG
          Metrics::UserTagWrapper.new(metric)
        when DEVCONTAINER_TAG
          Metrics::DevcontainerTagWrapper.new(metric)
        when SERVER_FEATURES
          Metrics::ServerFeaturesTagWrapper.new(metric)
        end
      end
      metric = Metrics::ResilientMetric.new(metric) if resilient
      metric
    end

    # Monitors the usage of the code executed within calling this method and submitting it within the `at_exit` hook.
    def self.monitor_script(metric, settings: [], exit_hook: Kernel.method(:at_exit))
      metric = metric_with_settings(metric, settings)
      exit_hook.call do
        metric.submit
      end
    end

    # Monitors the script usage of the code executed within calling this method and submitting it within the `at_exit` hook.
    def self.monitor_script_usage(metric_name, tags: [], settings: [], metrics_backend: DX::Datadog::MetricsBackend.new, exit_hook: Kernel.method(:at_exit))
      monitor_script(Metrics::Usage.new(metric_name, tags, metrics_backend), settings: settings, exit_hook: exit_hook)
    end

    # Measure the script runtime of the code executed within calling this metric and submitting it within the `at_exit` hook.
    def self.monitor_script_runtime(metric_name, tags: [], settings: [], metrics_backend: DX::Datadog::MetricsBackend.new, exit_hook: Kernel.method(:at_exit))
      monitor_script(Metrics::Runtime.new(metric_name, tags, metrics_backend), settings: settings, exit_hook: exit_hook)
    end

    # Measure the script runtime of the code executed within calling this metric and submitting it within the `at_exit` hook.
    def self.monitor_script_runtime_with_value(metric_name, value, tags: [], settings: [], metrics_backend: DX::Datadog::MetricsBackend.new, exit_hook: Kernel.method(:at_exit))
      monitor_script(Metrics::RuntimeWithValue.new(metric_name, tags, metrics_backend, value), settings: settings, exit_hook: exit_hook)
    end

    # Monitors a block of code.
    def self.monitor(metric, settings: [])
      metric = metric_with_settings(metric, settings)
      begin
        yield
      ensure
        metric.submit
      end
    end

    # Monitors the usage of a block of code.
    def self.monitor_usage(metric_name, tags: [], settings: [], metrics_backend: DX::Datadog::MetricsBackend.new, &block)
      monitor(Metrics::Usage.new(metric_name, tags, metrics_backend), settings: settings, &block)
    end

    # Monitors the runtime of a block of code.
    def self.monitor_runtime(metric_name, tags: [], settings: [], metrics_backend: DX::Datadog::MetricsBackend.new, &block)
      monitor(Metrics::Runtime.new(metric_name, tags, metrics_backend), settings: settings, &block)
    end
  end
end
