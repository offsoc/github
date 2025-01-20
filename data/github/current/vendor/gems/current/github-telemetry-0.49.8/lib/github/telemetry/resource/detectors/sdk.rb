# frozen_string_literal: true

module GitHub
  module Telemetry
    module Resource
      module Detectors
        # Provides resource attributes to identify the SDK
        module SDK
          module_function

          def detect
            resource_attributes = {
              "gh.sdk.name" => "github-telemetry-ruby",
              "gh.sdk.version" => ::GitHub::Telemetry::VERSION,
            }

            OpenTelemetry::SDK::Resources::Resource.create(resource_attributes)
          end
        end
      end
    end
  end
end
