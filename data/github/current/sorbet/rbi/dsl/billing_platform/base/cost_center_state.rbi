# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Base::CostCenterState`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Base::CostCenterState`.

module BillingPlatform::Base::CostCenterState
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

BillingPlatform::Base::CostCenterState::CostCenterActive = 0
BillingPlatform::Base::CostCenterState::CostCenterArchived = 1
