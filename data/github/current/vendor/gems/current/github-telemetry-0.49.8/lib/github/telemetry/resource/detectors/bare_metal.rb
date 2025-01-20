# frozen_string_literal: true

module GitHub
  module Telemetry
    module Resource
      module Detectors
        # Provides resource attributes injected via Environment Variables into Bare Metal Apps
        #
        # https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/sdk.md
        # https://github.com/open-telemetry/opentelemetry-ruby/tree/main/resource_detectors
        module BareMetal
          module_function

          def detect
            constants = OpenTelemetry::SemanticConventions::Resource

            resource_attributes = {
              constants::DEPLOYMENT_ENVIRONMENT => ENV["HEAVEN_DEPLOYED_ENV"],
              "gh.release.git.ref" => ::GitHub::Telemetry::Utils.current_ref,
              constants::SERVICE_VERSION => ::GitHub::Telemetry::Utils.current_sha,
            }.reject { |_, value| value.nil? || value.empty? }

            OpenTelemetry::SDK::Resources::Resource.create(resource_attributes)
          end
        end
      end
    end
  end
end
