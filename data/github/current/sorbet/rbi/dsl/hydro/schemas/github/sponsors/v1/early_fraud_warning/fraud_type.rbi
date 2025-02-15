# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType`.

module Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::CARD_NEVER_RECEIVED = 1
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::FRAUDULENT_CARD_APPLICATION = 2
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::MADE_WITH_COUNTERFEIT_CARD = 3
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::MADE_WITH_LOST_CARD = 4
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::MADE_WITH_STOLEN_CARD = 5
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::MISC = 6
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::UNAUTHORIZED_USE_OF_CARD = 7
Hydro::Schemas::Github::Sponsors::V1::EarlyFraudWarning::FraudType::UNKNOWN = 0
