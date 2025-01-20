# frozen_string_literal: true

module GitHub
  module Telemetry
    module Resource
      # Detecors namespace
      module Detectors
      end
    end
  end
end

require_relative "detectors/host"
require_relative "detectors/bare_metal"
require_relative "detectors/sdk"
