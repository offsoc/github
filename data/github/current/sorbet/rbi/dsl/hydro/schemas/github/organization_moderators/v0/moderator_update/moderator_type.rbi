# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::OrganizationModerators::V0::ModeratorUpdate::ModeratorType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::OrganizationModerators::V0::ModeratorUpdate::ModeratorType`.

module Hydro::Schemas::Github::OrganizationModerators::V0::ModeratorUpdate::ModeratorType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::OrganizationModerators::V0::ModeratorUpdate::ModeratorType::TEAM = 2
Hydro::Schemas::Github::OrganizationModerators::V0::ModeratorUpdate::ModeratorType::UNKNOWN = 0
Hydro::Schemas::Github::OrganizationModerators::V0::ModeratorUpdate::ModeratorType::USER = 1
