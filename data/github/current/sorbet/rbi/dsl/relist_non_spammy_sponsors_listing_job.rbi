# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `RelistNonSpammySponsorsListingJob`.
# Please instead update this file by running `bin/tapioca dsl RelistNonSpammySponsorsListingJob`.

class RelistNonSpammySponsorsListingJob
  class << self
    sig do
      params(
        sponsorable: T.untyped,
        actor: T.untyped,
        block: T.nilable(T.proc.params(job: RelistNonSpammySponsorsListingJob).void)
      ).returns(T.any(RelistNonSpammySponsorsListingJob, FalseClass))
    end
    def perform_later(sponsorable:, actor: T.unsafe(nil), &block); end

    sig { params(sponsorable: T.untyped, actor: T.untyped).returns(T.untyped) }
    def perform_now(sponsorable:, actor: T.unsafe(nil)); end
  end
end
