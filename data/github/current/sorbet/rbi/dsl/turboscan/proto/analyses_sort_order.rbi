# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::AnalysesSortOrder`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::AnalysesSortOrder`.

module Turboscan::Proto::AnalysesSortOrder
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Turboscan::Proto::AnalysesSortOrder::ANALYSES_CREATED_ASCENDING = 1
Turboscan::Proto::AnalysesSortOrder::ANALYSES_CREATED_DESCENDING = 0
