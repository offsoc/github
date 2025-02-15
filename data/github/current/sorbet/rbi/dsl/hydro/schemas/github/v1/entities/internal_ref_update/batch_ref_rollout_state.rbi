# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState`.

module Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState::DRY_RUN = 2
Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState::OFF = 1
Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState::ON = 3
Hydro::Schemas::Github::V1::Entities::InternalRefUpdate::BatchRefRolloutState::UNKNOWN = 0
