# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Turboscan::V0::AlertEvent::EventType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Turboscan::V0::AlertEvent::EventType`.

module Hydro::Schemas::Turboscan::V0::AlertEvent::EventType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_APPEARED_IN_BRANCH = 1
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_CLOSED_BECAME_FIXED = 2
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_CLOSED_BECAME_OUTDATED = 8
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_CLOSED_BY_USER = 3
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_CREATED = 4
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_DELETED_BY_USER = 7
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_REAPPEARED = 5
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::ALERT_REOPENED_BY_USER = 6
Hydro::Schemas::Turboscan::V0::AlertEvent::EventType::UNKNOWN = 0
