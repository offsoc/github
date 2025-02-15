# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType`.

module Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType::ACTIONS = 2
Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType::CHATOPS = 3
Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType::DELIVERY_TYPE_UNKNOWN = 0
Hydro::Schemas::Github::Webhooks::V0::DeliveryMetadata::DeliveryType::HOOKSHOT = 1
