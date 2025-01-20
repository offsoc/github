# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      module Export
        # A customized Span exporter, which logs a span more effectively
        # than the default {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-sdk/latest/OpenTelemetry/SDK/Trace/Export/ConsoleSpanExporter.html ConsoleSpanExporter}.
        # The spans will be logged using the default OpenTelemetry logger. For convenience,
        # you can also configure a desired logging object via {GitHub::Telemetry.configure}.
        #
        # Sample output:
        #
        #     I, [2021-03-04T15:09:34.115467 #45202]  INFO -- : {:trace_id=>"34dd71b4edf058e2616e854524f1b65b", :span_id=>"4fa1c290e71f011a", :name=>"test span", :kind=>nil, :start_timestamp=>2021-03-04 15:09:31.48832 -0600, :end_timestamp=>2021-03-04 15:09:31.488405 -0600}
        #     I, [2021-03-04T15:09:34.115579 #45202]  INFO -- : {:trace_id=>"34dd71b4edf058e2616e854524f1b65b", :span_id=>"4fa1c290e71f011a", :event=>{:name=>"exception", :timestamp=>2021-03-04 15:09:31.488383 -0600}}
        #
        # @example
        #   log_exporter = GitHub::Telemetry::Traces::Export::LogSpanExporter.new
        #   GitHub::Telemetry.configure(service_name: "my_service", exporter: log_exporter)
        class LogSpanExporter < ::OpenTelemetry::SDK::Trace::Export::ConsoleSpanExporter
          include OpenTelemetry::SDK::Trace::Export

          def export(spans, timeout: nil)
            return FAILURE if @stopped

            Array(spans).each do |s|
              fields = s.to_h.slice(:name, :kind, :start_timestamp, :end_timestamp)

              details = {
                "trace_id" => s.hex_trace_id,
                "span_id" => s.hex_span_id,
                :message => fields[:name],
                :"span.kind" => fields[:kind],
                :"span.start_timestamp" => fields[:start_timestamp],
                :"span.end_timestamp" => fields[:end_timestamp],
              }

              OpenTelemetry.logger.debug(details)
            end

            SUCCESS
          end
        end
      end
    end
  end
end
