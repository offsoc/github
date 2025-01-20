# frozen_string_literal: true

module GitHub
  module Telemetry
    module Traces
      # Namespace for custom trace exporters
      module Export
      end
    end
  end
end

require_relative "export/pending_span_processor"
require_relative "export/log_span_exporter"
require_relative "export/span_processor_factory"
require_relative "export/otlp_exporter_patch"
