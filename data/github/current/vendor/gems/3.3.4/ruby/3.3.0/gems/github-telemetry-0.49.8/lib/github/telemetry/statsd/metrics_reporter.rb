# frozen_string_literal: true

module GitHub
  module Telemetry
    module Statsd
      # MetricsReporter tracks the performance of the OTel SDK using StatsD::Instrument
      class MetricsReporter
        include OpenTelemetry::SDK::Trace::Export::MetricsReporter
        attr_reader :statsd

        def initialize(statsd:)
          @statsd = statsd
        end

        # https://github.com/open-telemetry/opentelemetry-ruby/blob/c0872228a92f0e82a4c9d07b980a341286af207c/exporter/otlp/lib/opentelemetry/exporter/otlp/exporter.rb
        def record_value(metric, value:, labels: {})
          statsd&.distribution(metric, value, tags: format_tags(labels))
        rescue StandardError => e
          OpenTelemetry.handle_error(exception: e, message: "Failed to record value for metrics")
        end

        # https://github.com/open-telemetry/opentelemetry-ruby/blob/c0872228a92f0e82a4c9d07b980a341286af207c/sdk/lib/opentelemetry/sdk/trace/export/batch_span_processor.rb#L167
        def observe_value(metric, value:, labels: {})
          statsd&.gauge(metric, value, tags: format_tags(labels))
        rescue StandardError => e
          OpenTelemetry.handle_error(exception: e, message: "Failed to record value for metrics")
        end

        # https://github.com/open-telemetry/opentelemetry-ruby/blob/c0872228a92f0e82a4c9d07b980a341286af207c/sdk/lib/opentelemetry/sdk/trace/export/batch_span_processor.rb#L167
        def add_to_counter(metric, increment: 1, labels: {})
          statsd&.increment(metric, increment, tags: format_tags(labels))
        rescue StandardError => e
          OpenTelemetry.handle_error(exception: e, message: "Failed to record value for metrics")
        end

        private

        def format_tags(labels)
          # statsd-instrument 3.6 no longer accepts empty tags
          # https://github.com/Shopify/statsd-instrument/commit/8ad20ca6f6c386ac8946af4677c0862323f8e5b0#diff-159199da19215c151cdb6c706e74716865f0eb240a041cc1c03564685dae8dc9R83
          !labels&.empty? ? labels : nil
        end
      end
    end
  end
end
