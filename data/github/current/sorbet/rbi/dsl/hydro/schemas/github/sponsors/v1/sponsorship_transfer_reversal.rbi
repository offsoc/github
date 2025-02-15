# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::SponsorshipTransferReversal`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::SponsorshipTransferReversal`.

class Hydro::Schemas::Github::Sponsors::V1::SponsorshipTransferReversal
  sig do
    params(
      currency_code: T.nilable(Google::Protobuf::StringValue),
      listing: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListing),
      listing_stafftools_metadata: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsListingStafftoolsMetadata),
      match_amount_in_subunits: T.nilable(Integer),
      payment_amount_in_subunits: T.nilable(Integer),
      sponsorship: T.nilable(Hydro::Schemas::Github::Sponsors::V0::Entities::Sponsorship),
      tier: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier),
      total_amount_in_subunits: T.nilable(Integer)
    ).void
  end
  def initialize(currency_code: nil, listing: nil, listing_stafftools_metadata: nil, match_amount_in_subunits: nil, payment_amount_in_subunits: nil, sponsorship: nil, tier: nil, total_amount_in_subunits: nil); end

  sig { void }
  def clear_currency_code; end

  sig { void }
  def clear_listing; end

  sig { void }
  def clear_listing_stafftools_metadata; end

  sig { void }
  def clear_match_amount_in_subunits; end

  sig { void }
  def clear_payment_amount_in_subunits; end

  sig { void }
  def clear_sponsorship; end

  sig { void }
  def clear_tier; end

  sig { void }
  def clear_total_amount_in_subunits; end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def currency_code; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def currency_code=(value); end

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

  sig { returns(Integer) }
  def match_amount_in_subunits; end

  sig { params(value: Integer).void }
  def match_amount_in_subunits=(value); end

  sig { returns(Integer) }
  def payment_amount_in_subunits; end

  sig { params(value: Integer).void }
  def payment_amount_in_subunits=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V0::Entities::Sponsorship)) }
  def sponsorship; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V0::Entities::Sponsorship)).void }
  def sponsorship=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier)) }
  def tier; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Sponsors::V1::Entities::SponsorsTier)).void }
  def tier=(value); end

  sig { returns(Integer) }
  def total_amount_in_subunits; end

  sig { params(value: Integer).void }
  def total_amount_in_subunits=(value); end
end
