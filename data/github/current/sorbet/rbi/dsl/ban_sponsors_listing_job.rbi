# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BanSponsorsListingJob`.
# Please instead update this file by running `bin/tapioca dsl BanSponsorsListingJob`.

class BanSponsorsListingJob
  class << self
    sig do
      params(
        sponsors_listing: T.nilable(::SponsorsListing),
        actor: T.nilable(::User),
        ban_reason: T.nilable(::String),
        automated: T::Boolean,
        block: T.nilable(T.proc.params(job: BanSponsorsListingJob).void)
      ).returns(T.any(BanSponsorsListingJob, FalseClass))
    end
    def perform_later(sponsors_listing:, actor:, ban_reason:, automated: T.unsafe(nil), &block); end

    sig do
      params(
        sponsors_listing: T.nilable(::SponsorsListing),
        actor: T.nilable(::User),
        ban_reason: T.nilable(::String),
        automated: T::Boolean
      ).void
    end
    def perform_now(sponsors_listing:, actor:, ban_reason:, automated: T.unsafe(nil)); end
  end
end
