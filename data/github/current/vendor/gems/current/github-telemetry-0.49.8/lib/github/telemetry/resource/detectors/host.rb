# frozen_string_literal: true

module GitHub
  module Telemetry
    module Resource
      module Detectors
        # Provides resource attributes for Host Related attributes
        #
        # https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/sdk.md
        # https://github.com/open-telemetry/opentelemetry-ruby/tree/main/resource_detectors
        module Host
          module_function

          def detect
            constants = OpenTelemetry::SemanticConventions::Resource

            resource_attributes = {
              constants::HOST_NAME => hostname_or_default,
            }.reject { |_, value| value.nil? || value.empty? }

            OpenTelemetry::SDK::Resources::Resource.create(resource_attributes)
          end

          # Returns the HOSTNAME environment variable if it is set by puppet
          # or attempts to determine the hostname from a socket call
          # otherwise returns `invalid_hostname` as a default
          # @return [String] the hostname
          def hostname_or_default
            ENV.fetch("HOSTNAME") do
              Socket.gethostname
            rescue StandardError
              "invalid_hostname"
            end
          end
        end
      end
    end
  end
end
