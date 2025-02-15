# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility`.

module Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility::INTERNAL = 3
Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility::PRIVATE = 2
Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility::PUBLIC = 1
Hydro::Schemas::Github::SecurityCenter::V1::Entities::Repository::Visibility::VISIBILITY_UNKNOWN = 0
