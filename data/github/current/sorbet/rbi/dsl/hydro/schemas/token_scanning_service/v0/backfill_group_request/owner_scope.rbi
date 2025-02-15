# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope`.

module Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope::BUSINESS_SCOPE = 2
Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope::ORGANIZATION_SCOPE = 1
Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope::UNKNOWN_SCOPE = 0
Hydro::Schemas::TokenScanningService::V0::BackfillGroupRequest::OwnerScope::USER_SCOPE = 3
