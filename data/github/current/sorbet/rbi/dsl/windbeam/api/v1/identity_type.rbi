# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Windbeam::Api::V1::IdentityType`.
# Please instead update this file by running `bin/tapioca dsl Windbeam::Api::V1::IdentityType`.

module Windbeam::Api::V1::IdentityType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Windbeam::Api::V1::IdentityType::ANALYTICS_TRACKING_ID = 3
Windbeam::Api::V1::IdentityType::EMAIL = 2
Windbeam::Api::V1::IdentityType::IDENTITY_TYPE_UNKNOWN = 1
Windbeam::Api::V1::IdentityType::IDENTITY_TYPE_UNSPECIFIED = 0
