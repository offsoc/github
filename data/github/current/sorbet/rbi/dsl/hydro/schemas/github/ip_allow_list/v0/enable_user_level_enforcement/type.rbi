# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::IpAllowList::V0::EnableUserLevelEnforcement::Type`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::IpAllowList::V0::EnableUserLevelEnforcement::Type`.

module Hydro::Schemas::Github::IpAllowList::V0::EnableUserLevelEnforcement::Type
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::IpAllowList::V0::EnableUserLevelEnforcement::Type::BUSINESS = 2
Hydro::Schemas::Github::IpAllowList::V0::EnableUserLevelEnforcement::Type::ORG = 1
Hydro::Schemas::Github::IpAllowList::V0::EnableUserLevelEnforcement::Type::UNKNOWN = 0
