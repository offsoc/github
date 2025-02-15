# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::SponsorsFraudReviewCreate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::SponsorsFraudReviewCreate`.

class Hydro::Schemas::Github::Sponsors::V1::SponsorsFraudReviewCreate
  sig do
    params(
      fraud_review: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsFraudReview),
      listing: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing),
      listing_stafftools_metadata: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListingStafftoolsMetadata),
      sponsorable: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(fraud_review: nil, listing: nil, listing_stafftools_metadata: nil, sponsorable: nil); end

  sig { void }
  def clear_fraud_review; end

  sig { void }
  def clear_listing; end

  sig { void }
  def clear_listing_stafftools_metadata; end

  sig { void }
  def clear_sponsorable; end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsFraudReview)) }
  def fraud_review; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsFraudReview)).void }
  def fraud_review=(value); end

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

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def sponsorable; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def sponsorable=(value); end
end
