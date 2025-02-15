# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Copilot::V1::CopilotEditorNotificationEvent::CopilotNotificationEventType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Copilot::V1::CopilotEditorNotificationEvent::CopilotNotificationEventType`.

module Hydro::Schemas::Github::Copilot::V1::CopilotEditorNotificationEvent::CopilotNotificationEventType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Copilot::V1::CopilotEditorNotificationEvent::CopilotNotificationEventType::ACKNOWLEDGED = 2
Hydro::Schemas::Github::Copilot::V1::CopilotEditorNotificationEvent::CopilotNotificationEventType::SHOWN = 1
Hydro::Schemas::Github::Copilot::V1::CopilotEditorNotificationEvent::CopilotNotificationEventType::UNKNOWN_EVENT_TYPE = 0
