# frozen_string_literal: true

module GitHub
  module Telemetry
    # Mirror of the OpenTelemetry::SDK::Resource dedicated to our internal resources
    module Resource
      module_function

      def build
        GitHub::Telemetry::Resource::Detectors::BareMetal
          .detect
          .merge(GitHub::Telemetry::Resource::Detectors::SDK.detect)
          .merge(GitHub::Telemetry::Resource::Detectors::Host.detect)
          .merge(OpenTelemetry::SDK::Resources::Resource.default)
      end
    end
  end
end

require_relative "resource/detectors"
