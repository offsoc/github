# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::MetaDataBlobEvent::Actions`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::MetaDataBlobEvent::Actions`.

module Hydro::Schemas::Github::V1::MetaDataBlobEvent::Actions
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::MetaDataBlobEvent::Actions::CREATED = 0
Hydro::Schemas::Github::V1::MetaDataBlobEvent::Actions::DELETED = 2
Hydro::Schemas::Github::V1::MetaDataBlobEvent::Actions::UPDATED = 1
