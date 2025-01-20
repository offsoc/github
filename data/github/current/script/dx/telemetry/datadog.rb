# typed: strict
# frozen_string_literal: true

require "datadog_api_client"
require "sorbet-runtime"

module DX
  module Datadog
    class MetricsBackend
      extend T::Sig

      sig do
        params(metric: String,
               time: Integer,
               value: Integer,
               tags: T::Array[String]
              ).void
      end
      def submit_count(metric, time, value, tags = [])
        return unless ENV["DX_TELEMETRY_DATADOG_API_KEY"]
        client = create_new_datadog_client(ENV["DX_TELEMETRY_DATADOG_API_KEY"])
        client.submit_metrics(DatadogAPIClient::V1::MetricsPayload.new({ series: [
          {
            metric: metric,
            type: "count",
            points: [[time, value]],
            tags: tags
          }] }))
      rescue DatadogAPIClient::APIError => e
        # If this error message causes trouble in certain situations, we could silence it optionally.
        puts "Failed to send count to Datadog: #{e.message}"
      end

      sig do
        params(metric: String,
               time: Integer,
               values: T::Array[Numeric],
               tags: T::Array[String]
              ).void
      end
      def submit_distribution_points(metric, time, values, tags = [])
        return unless ENV["DX_TELEMETRY_DATADOG_API_KEY"]
        client = create_new_datadog_client(ENV["DX_TELEMETRY_DATADOG_API_KEY"])
        client.submit_distribution_points(DatadogAPIClient::V1::DistributionPointsPayload.new({
          series: [
            DatadogAPIClient::V1::DistributionPointsSeries.new({
              metric: metric,
              points: [[time, values]],
              tags: tags,
            })
          ] }))
      rescue DatadogAPIClient::APIError => e
        # If this error message causes trouble in certain situations, we could silence it optionally.
        puts "Failed to send distribution points to Datadog: #{e.message}"
      end

      sig do
        params(metric: String,
               time: Integer,
               value: Numeric,
               tags: T::Array[String]
              ).void
      end
      def submit_guage(metric, time, value, tags = [])
        return unless ENV["DX_TELEMETRY_DATADOG_API_KEY"]
        client = create_new_datadog_client(ENV["DX_TELEMETRY_DATADOG_API_KEY"])
        client.submit_metrics(DatadogAPIClient::V1::MetricsPayload.new({ series: [
          DatadogAPIClient::V1::Series.new({
            metric: metric,
            type: "gauge",
            tags: tags,
            points: [[time, value]]
          })
        ] }))
      rescue DatadogAPIClient::APIError => e
        # If this error message causes trouble in certain situations, we could silence it optionally.
        puts "Failed to send distribution points to Datadog: #{e.message}"
      end
      alias_method :submit_gauge, :submit_guage

      private

      sig { params(api_key: T.nilable(String)).returns(DatadogAPIClient::V1::MetricsAPI) }
      def create_new_datadog_client(api_key)
        DatadogAPIClient.configure do |config|
          config.api_key = api_key
        end
        DatadogAPIClient::V1::MetricsAPI.new
      end
    end
  end
end
