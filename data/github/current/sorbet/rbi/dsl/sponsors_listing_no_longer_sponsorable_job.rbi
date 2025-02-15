# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SponsorsListingNoLongerSponsorableJob`.
# Please instead update this file by running `bin/tapioca dsl SponsorsListingNoLongerSponsorableJob`.

class SponsorsListingNoLongerSponsorableJob
  class << self
    sig do
      params(
        sponsors_listing: ::SponsorsListing,
        actor: T.nilable(::User),
        reason: T.nilable(::Symbol),
        block: T.nilable(T.proc.params(job: SponsorsListingNoLongerSponsorableJob).void)
      ).returns(T.any(SponsorsListingNoLongerSponsorableJob, FalseClass))
    end
    def perform_later(sponsors_listing:, actor:, reason: T.unsafe(nil), &block); end

    sig { params(sponsors_listing: ::SponsorsListing, actor: T.nilable(::User), reason: T.nilable(::Symbol)).void }
    def perform_now(sponsors_listing:, actor:, reason: T.unsafe(nil)); end
  end
end
