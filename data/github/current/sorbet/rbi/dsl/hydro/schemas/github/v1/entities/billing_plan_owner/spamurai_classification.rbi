# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::BillingPlanOwner::SpamuraiClassification`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::BillingPlanOwner::SpamuraiClassification`.

module Hydro::Schemas::Github::V1::Entities::BillingPlanOwner::SpamuraiClassification
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::Entities::BillingPlanOwner::SpamuraiClassification::HAMMY = 1
Hydro::Schemas::Github::V1::Entities::BillingPlanOwner::SpamuraiClassification::SPAMMY = 2
Hydro::Schemas::Github::V1::Entities::BillingPlanOwner::SpamuraiClassification::SPAMURAI_CLASSIFICATION_UNKNOWN = 0
