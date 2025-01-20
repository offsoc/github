# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      module Export
        class SpanProcessorFactory
          PENDING_SPANS_ENABLED = "GITHUB_TELEMETRY_PENDING_SPANS_ENABLED"

          # Creation method that instantiates a span processor based on the exporter
          #
          # - OTLP Exporters will always be paired with a BatchSpanProcessor
          # - Non-OTLP Exporters will always be paired with a SimpleSpanProcessor
          #
          # If the environment variable GITHUB_TELEMETRY_PENDING_SPANS_ENABLED is set to true, then
          # the BatchSpanProcessor will be wrapped in a PendingSpanProcessor to avoid dropping
          # spans when the application exits gracefully.
          #
          # @return OpenTelemetry::SDK::Trace::SpanProcessor
          def self.new_span_processor(exporter, metrics_reporter:)
            case exporter
            when OpenTelemetry::Exporter::OTLP::Exporter
              batch_processor = OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(exporter, metrics_reporter: metrics_reporter)

              if ENV.fetch(PENDING_SPANS_ENABLED, "true") == "true" && defined?(ActiveSupport::ForkTracker)
                pending_span_processor = GitHub::Telemetry::Traces::Export::PendingSpanProcessor.new(batch_processor, metrics_reporter: metrics_reporter, reset_on_fork: false)
                ActiveSupport::ForkTracker.after_fork { pending_span_processor.reset }
                return pending_span_processor
              end

              return batch_processor
            else
              OpenTelemetry::SDK::Trace::Export::SimpleSpanProcessor.new(exporter)
            end
          end
        end
      end
    end
  end
end
