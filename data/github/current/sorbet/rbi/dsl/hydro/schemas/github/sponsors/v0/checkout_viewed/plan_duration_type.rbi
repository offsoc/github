# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType`.

module Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType::MONTHLY = 1
Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType::NONE = 3
Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType::NOT_KNOWN = 0
Hydro::Schemas::Github::Sponsors::V0::CheckoutViewed::PlanDurationType::YEARLY = 2
