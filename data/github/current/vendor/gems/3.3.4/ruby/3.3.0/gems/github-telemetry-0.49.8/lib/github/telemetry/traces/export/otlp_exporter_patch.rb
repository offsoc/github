# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      module Export
      # Extended version of the `OpenTelemetry::Exporter::OTLP::Exporter` class
      # that forces the HTTP client to re-connect on 503 errors
        module OTLPExporterPatch
          def backoff?(retry_count:, reason:, retry_after: nil)
            @http.finish if @http.started?
            super
          end
        end
      end
    end
  end
end

OpenTelemetry::Exporter::OTLP::Exporter.prepend(GitHub::Telemetry::Traces::Export::OTLPExporterPatch)
