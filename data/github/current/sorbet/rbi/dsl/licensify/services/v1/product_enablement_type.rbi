# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Licensify::Services::V1::ProductEnablementType`.
# Please instead update this file by running `bin/tapioca dsl Licensify::Services::V1::ProductEnablementType`.

module Licensify::Services::V1::ProductEnablementType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Licensify::Services::V1::ProductEnablementType::PRODUCT_ENABLEMENT_TYPE_ORG = 1
Licensify::Services::V1::ProductEnablementType::PRODUCT_ENABLEMENT_TYPE_REPO = 2
Licensify::Services::V1::ProductEnablementType::PRODUCT_ENABLEMENT_TYPE_UNSPECIFIED = 0
