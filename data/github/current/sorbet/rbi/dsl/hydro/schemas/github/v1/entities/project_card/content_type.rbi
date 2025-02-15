# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType`.

module Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType::CONTENT_TYPE_UNKNOWN = 0
Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType::ISSUE = 1
Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType::NOTE = 3
Hydro::Schemas::Github::V1::Entities::ProjectCard::ContentType::PULL_REQUEST = 2
