# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Marketplace::V0::MarketplaceOnboardingProgress`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Marketplace::V0::MarketplaceOnboardingProgress`.

class Hydro::Schemas::Github::Marketplace::V0::MarketplaceOnboardingProgress
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      contact_info_completed: T.nilable(T::Boolean),
      listing_description_completed: T.nilable(T::Boolean),
      listing_details_completed: T.nilable(T::Boolean),
      logo_and_feature_card_completed: T.nilable(T::Boolean),
      marketplace_listing: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListing),
      naming_and_links_completed: T.nilable(T::Boolean),
      plans_and_pricing_completed: T.nilable(T::Boolean),
      product_screenshots_completed: T.nilable(T::Boolean),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      webhook_completed: T.nilable(T::Boolean)
    ).void
  end
  def initialize(actor: nil, contact_info_completed: nil, listing_description_completed: nil, listing_details_completed: nil, logo_and_feature_card_completed: nil, marketplace_listing: nil, naming_and_links_completed: nil, plans_and_pricing_completed: nil, product_screenshots_completed: nil, request_context: nil, webhook_completed: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_contact_info_completed; end

  sig { void }
  def clear_listing_description_completed; end

  sig { void }
  def clear_listing_details_completed; end

  sig { void }
  def clear_logo_and_feature_card_completed; end

  sig { void }
  def clear_marketplace_listing; end

  sig { void }
  def clear_naming_and_links_completed; end

  sig { void }
  def clear_plans_and_pricing_completed; end

  sig { void }
  def clear_product_screenshots_completed; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_webhook_completed; end

  sig { returns(T::Boolean) }
  def contact_info_completed; end

  sig { params(value: T::Boolean).void }
  def contact_info_completed=(value); end

  sig { returns(T::Boolean) }
  def listing_description_completed; end

  sig { params(value: T::Boolean).void }
  def listing_description_completed=(value); end

  sig { returns(T::Boolean) }
  def listing_details_completed; end

  sig { params(value: T::Boolean).void }
  def listing_details_completed=(value); end

  sig { returns(T::Boolean) }
  def logo_and_feature_card_completed; end

  sig { params(value: T::Boolean).void }
  def logo_and_feature_card_completed=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListing)) }
  def marketplace_listing; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::MarketplaceListing)).void }
  def marketplace_listing=(value); end

  sig { returns(T::Boolean) }
  def naming_and_links_completed; end

  sig { params(value: T::Boolean).void }
  def naming_and_links_completed=(value); end

  sig { returns(T::Boolean) }
  def plans_and_pricing_completed; end

  sig { params(value: T::Boolean).void }
  def plans_and_pricing_completed=(value); end

  sig { returns(T::Boolean) }
  def product_screenshots_completed; end

  sig { params(value: T::Boolean).void }
  def product_screenshots_completed=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T::Boolean) }
  def webhook_completed; end

  sig { params(value: T::Boolean).void }
  def webhook_completed=(value); end
end
