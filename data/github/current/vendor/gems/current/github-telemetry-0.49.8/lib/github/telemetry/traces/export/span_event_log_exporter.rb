# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      module Export
        # Exporter that converts Span Events to log events given a logger
        class SpanEventLogExporter
          include GitHub::Telemetry::Logs::Loggable
          include OpenTelemetry::SDK::Trace::Export

          def initialize
            @shutdown = false
          end

          NANOSEC_TO_EPOCH_TIMESTAMP = 1_000_000_000.0

          def export(span_data_batch, _ = nil)
            return FAILURE if @shutdown

            span_data_batch.each do |span_data|
              span_data.events&.each do |event|
                attributes = span_data.attributes.dup || {}
                attributes.merge!(event.attributes)
                attributes["span.kind"] = span_data.kind
                attributes["TraceId"] = span_data.hex_trace_id
                attributes["SpanId"] = span_data.hex_span_id
                attributes["Timestamp"] = to_utc_time(event.timestamp)
                attributes[:message] = event.name
                attributes["InstrumentationScope"] = span_data.instrumentation_scope&.name

                level = (attributes.delete("SeverityText") || "trace")

                logger.send(level, attributes)
              end
            end
            SUCCESS
          rescue StandardError => e
            OpenTelemetry.handle_error(exception: e, message: "Unable to export span events as logs")
            FAILURE
          end

          def force_flush(timeout: nil)
            SUCCESS
          end

          def shutdown(*)
            @shutdown = true
            SUCCESS
          end

          private

          def to_utc_time(nanosecond_precise_timestamp)
            Time.at((nanosecond_precise_timestamp / NANOSEC_TO_EPOCH_TIMESTAMP)).utc
          end
        end
      end
    end
  end
end
