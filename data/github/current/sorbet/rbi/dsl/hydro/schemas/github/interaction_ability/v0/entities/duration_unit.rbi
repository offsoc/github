# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit`.

module Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit::DAY = 1
Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit::MONTH = 3
Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit::UNKNOWN_DURATION_UNIT = 0
Hydro::Schemas::Github::InteractionAbility::V0::Entities::DurationUnit::WEEK = 2
