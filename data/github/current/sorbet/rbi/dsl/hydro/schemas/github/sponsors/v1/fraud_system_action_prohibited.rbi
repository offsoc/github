# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::FraudSystemActionProhibited`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::FraudSystemActionProhibited`.

class Hydro::Schemas::Github::Sponsors::V1::FraudSystemActionProhibited
  sig do
    params(
      action: T.nilable(T.any(Symbol, Integer)),
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      enforced: T.nilable(T::Boolean),
      listing: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing),
      listing_stafftools_metadata: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListingStafftoolsMetadata),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      sponsor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      sponsor_sift_score: T.nilable(Integer),
      sponsorable: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      sponsorable_sift_score: T.nilable(Integer),
      tier: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier),
      trust_level: T.nilable(T.any(Symbol, Integer)),
      trust_target: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(action: nil, actor: nil, enforced: nil, listing: nil, listing_stafftools_metadata: nil, request_context: nil, sponsor: nil, sponsor_sift_score: nil, sponsorable: nil, sponsorable_sift_score: nil, tier: nil, trust_level: nil, trust_target: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def action; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def action=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_action; end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_enforced; end

  sig { void }
  def clear_listing; end

  sig { void }
  def clear_listing_stafftools_metadata; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_sponsor; end

  sig { void }
  def clear_sponsor_sift_score; end

  sig { void }
  def clear_sponsorable; end

  sig { void }
  def clear_sponsorable_sift_score; end

  sig { void }
  def clear_tier; end

  sig { void }
  def clear_trust_level; end

  sig { void }
  def clear_trust_target; end

  sig { returns(T::Boolean) }
  def enforced; end

  sig { params(value: T::Boolean).void }
  def enforced=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing)) }
  def listing; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing)).void }
  def listing=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListingStafftoolsMetadata)) }
  def listing_stafftools_metadata; end

  sig do
    params(
      value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListingStafftoolsMetadata)
    ).void
  end
  def listing_stafftools_metadata=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def sponsor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def sponsor=(value); end

  sig { returns(Integer) }
  def sponsor_sift_score; end

  sig { params(value: Integer).void }
  def sponsor_sift_score=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def sponsorable; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def sponsorable=(value); end

  sig { returns(Integer) }
  def sponsorable_sift_score; end

  sig { params(value: Integer).void }
  def sponsorable_sift_score=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier)) }
  def tier; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier)).void }
  def tier=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def trust_level; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def trust_level=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def trust_target; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def trust_target=(value); end
end
