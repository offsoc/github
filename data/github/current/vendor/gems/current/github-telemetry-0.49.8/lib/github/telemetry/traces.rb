# frozen_string_literal: true

module GitHub
  module Telemetry
    # Namespace for custom traces
    module Traces
    end
  end
end

require_relative "traces/stacktrace_filter"
require_relative "traces/span_patches"
require_relative "traces/export"
require_relative "traces/traceable"
