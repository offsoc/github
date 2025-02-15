# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Billing::V0::Entities::ActionType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Billing::V0::Entities::ActionType`.

module Hydro::Schemas::Github::Billing::V0::Entities::ActionType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Billing::V0::Entities::ActionType::RENEWAL = 1
Hydro::Schemas::Github::Billing::V0::Entities::ActionType::UNKNOWN_ACTION_TARGET = 0
Hydro::Schemas::Github::Billing::V0::Entities::ActionType::UPDATE = 2
