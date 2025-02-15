# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Billingplatform::V1::Entities::BudgetKey::PricingTargetType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Billingplatform::V1::Entities::BudgetKey::PricingTargetType`.

module Hydro::Schemas::Billingplatform::V1::Entities::BudgetKey::PricingTargetType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Billingplatform::V1::Entities::BudgetKey::PricingTargetType::PRODUCT_PRICING = 1
Hydro::Schemas::Billingplatform::V1::Entities::BudgetKey::PricingTargetType::SKU_PRICING = 2
Hydro::Schemas::Billingplatform::V1::Entities::BudgetKey::PricingTargetType::UNKNOWN_PRICING_TARGET = 0
