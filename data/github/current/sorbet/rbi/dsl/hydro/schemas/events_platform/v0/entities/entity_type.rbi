# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::EventsPlatform::V0::Entities::EntityType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::EventsPlatform::V0::Entities::EntityType`.

module Hydro::Schemas::EventsPlatform::V0::Entities::EntityType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_ENTERPRISE = 3
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_ISSUE = 7
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_ISSUE_COMMENT = 10
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_MARKETPLACE_LISTING = 4
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_ORGANIZATION = 2
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_PULL_REQUEST = 8
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_PULL_REQUEST_REVIEW = 9
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_REPOSITORY = 1
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_SPONSORS_LISTING = 5
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_UNKNOWN = 0
Hydro::Schemas::EventsPlatform::V0::Entities::EntityType::ENTITY_TYPE_USER = 6
