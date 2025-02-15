# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V0::SponsorshipTierChange`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V0::SponsorshipTierChange`.

class Hydro::Schemas::Github::Sponsors::V0::SponsorshipTierChange
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      current_tier: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListingBillingPlan),
      marketplace_listing: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListing),
      previous_tier: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListingBillingPlan),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      sponsorship: T.nilable(Hydro::Schemas::Github::Sponsors::V0::Entities::Sponsorship)
    ).void
  end
  def initialize(actor: nil, current_tier: nil, marketplace_listing: nil, previous_tier: nil, request_context: nil, sponsorship: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_current_tier; end

  sig { void }
  def clear_marketplace_listing; end

  sig { void }
  def clear_previous_tier; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_sponsorship; end

  sig { returns(T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListingBillingPlan)) }
  def current_tier; end

  sig do
    params(
      value: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListingBillingPlan)
    ).void
  end
  def current_tier=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListing)) }
  def marketplace_listing; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListing)).void }
  def marketplace_listing=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListingBillingPlan)) }
  def previous_tier; end

  sig do
    params(
      value: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListingBillingPlan)
    ).void
  end
  def previous_tier=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V0::Entities::Sponsorship)) }
  def sponsorship; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V0::Entities::Sponsorship)).void }
  def sponsorship=(value); end
end
