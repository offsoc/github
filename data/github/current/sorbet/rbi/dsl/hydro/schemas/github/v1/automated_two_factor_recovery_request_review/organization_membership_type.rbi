# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::AutomatedTwoFactorRecoveryRequestReview::OrganizationMembershipType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::AutomatedTwoFactorRecoveryRequestReview::OrganizationMembershipType`.

module Hydro::Schemas::Github::V1::AutomatedTwoFactorRecoveryRequestReview::OrganizationMembershipType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::AutomatedTwoFactorRecoveryRequestReview::OrganizationMembershipType::BUSINESS_AFFILIATION = 2
Hydro::Schemas::Github::V1::AutomatedTwoFactorRecoveryRequestReview::OrganizationMembershipType::LAST_ADMIN = 1
Hydro::Schemas::Github::V1::AutomatedTwoFactorRecoveryRequestReview::OrganizationMembershipType::ORGANIZATION_MEMBERSHIP_TYPE_UNKNOWN = 0
