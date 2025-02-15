# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::OrgRemoveBillingManagerAuditEntryReason`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::OrgRemoveBillingManagerAuditEntryReason`.

module PlatformTypes::OrgRemoveBillingManagerAuditEntryReason
  sig { returns(T::Boolean) }
  def saml_external_identity_missing?; end

  sig { returns(T::Boolean) }
  def saml_sso_enforcement_requires_external_identity?; end

  sig { returns(T::Boolean) }
  def two_factor_requirement_non_compliance?; end

  SAML_EXTERNAL_IDENTITY_MISSING = T.let("SAML_EXTERNAL_IDENTITY_MISSING", String)
  SAML_SSO_ENFORCEMENT_REQUIRES_EXTERNAL_IDENTITY = T.let("SAML_SSO_ENFORCEMENT_REQUIRES_EXTERNAL_IDENTITY", String)
  TWO_FACTOR_REQUIREMENT_NON_COMPLIANCE = T.let("TWO_FACTOR_REQUIREMENT_NON_COMPLIANCE", String)
end
