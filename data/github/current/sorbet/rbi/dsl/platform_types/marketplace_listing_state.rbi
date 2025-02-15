# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::MarketplaceListingState`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::MarketplaceListingState`.

module PlatformTypes::MarketplaceListingState
  sig { returns(T::Boolean) }
  def archived?; end

  sig { returns(T::Boolean) }
  def draft?; end

  sig { returns(T::Boolean) }
  def rejected?; end

  sig { returns(T::Boolean) }
  def unverified?; end

  sig { returns(T::Boolean) }
  def unverified_pending?; end

  sig { returns(T::Boolean) }
  def verification_pending_from_draft?; end

  sig { returns(T::Boolean) }
  def verification_pending_from_unverified?; end

  sig { returns(T::Boolean) }
  def verified?; end

  sig { returns(T::Boolean) }
  def verified_creator?; end

  ARCHIVED = T.let("ARCHIVED", String)
  DRAFT = T.let("DRAFT", String)
  REJECTED = T.let("REJECTED", String)
  UNVERIFIED = T.let("UNVERIFIED", String)
  UNVERIFIED_PENDING = T.let("UNVERIFIED_PENDING", String)
  VERIFICATION_PENDING_FROM_DRAFT = T.let("VERIFICATION_PENDING_FROM_DRAFT", String)
  VERIFICATION_PENDING_FROM_UNVERIFIED = T.let("VERIFICATION_PENDING_FROM_UNVERIFIED", String)
  VERIFIED = T.let("VERIFIED", String)
  VERIFIED_CREATOR = T.let("VERIFIED_CREATOR", String)
end
