# frozen_string_literal: true

module GitHub
  module Telemetry
    module Datadog
      # MetricsReporter tracks the performance of the OTel SDK using Datadog Statsd custom metrics
      class MetricsReporter < ::GitHub::Telemetry::Statsd::MetricsReporter
        # https://github.com/open-telemetry/opentelemetry-ruby/blob/c0872228a92f0e82a4c9d07b980a341286af207c/sdk/lib/opentelemetry/sdk/trace/export/batch_span_processor.rb#L167
        def add_to_counter(metric, increment: 1, labels: {})
          statsd&.increment(metric, { by: increment }.merge(tags: format_tags(labels)))
        rescue StandardError => e
          OpenTelemetry.handle_error(exception: e, message: "Failed to record value for metrics")
        end

        private

        # github/github uses Datadog Statsd 4.1.0, which assumes tags must be an array of colon separated key:value pairs and not a hash
        # https://github.com/DataDog/dogstatsd-ruby/blob/v4.1.0/lib/datadog/statsd.rb#L491
        # https://github.com/github/github/blob/master/Gemfile#L85
        def format_tags(labels)
          labels.map { |k, v| "#{k}:#{v}" }
        end
      end
    end
  end
end
