# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::UpdateTierWelcomeMessage`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::UpdateTierWelcomeMessage`.

class Hydro::Schemas::Github::Sponsors::V1::UpdateTierWelcomeMessage
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      listing: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      sponsorable: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      tier: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier),
      total_active_sponsors: T.nilable(Integer)
    ).void
  end
  def initialize(actor: nil, listing: nil, request_context: nil, sponsorable: nil, tier: nil, total_active_sponsors: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_listing; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_sponsorable; end

  sig { void }
  def clear_tier; end

  sig { void }
  def clear_total_active_sponsors; end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing)) }
  def listing; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing)).void }
  def listing=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def sponsorable; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def sponsorable=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier)) }
  def tier; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier)).void }
  def tier=(value); end

  sig { returns(Integer) }
  def total_active_sponsors; end

  sig { params(value: Integer).void }
  def total_active_sponsors=(value); end
end
