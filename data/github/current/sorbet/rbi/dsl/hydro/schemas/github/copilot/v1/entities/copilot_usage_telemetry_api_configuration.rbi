# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration`.

module Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration::USAGE_TELEMETRY_API_DISABLED = 2
Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration::USAGE_TELEMETRY_API_ENABLED = 1
Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration::USAGE_TELEMETRY_API_NO_POLICY = 3
Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUsageTelemetryApiConfiguration::USAGE_TELEMETRY_API_UNKNOWN = 0
