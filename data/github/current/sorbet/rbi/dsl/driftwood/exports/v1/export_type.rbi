# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Driftwood::Exports::V1::ExportType`.
# Please instead update this file by running `bin/tapioca dsl Driftwood::Exports::V1::ExportType`.

module Driftwood::Exports::V1::ExportType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Driftwood::Exports::V1::ExportType::EXPORT_TYPE_GIT = 2
Driftwood::Exports::V1::ExportType::EXPORT_TYPE_UNKNOWN = 0
Driftwood::Exports::V1::ExportType::EXPORT_TYPE_WEB = 1
