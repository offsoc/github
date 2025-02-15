# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ExportSponsorsPayoutsJob`.
# Please instead update this file by running `bin/tapioca dsl ExportSponsorsPayoutsJob`.

class ExportSponsorsPayoutsJob
  class << self
    sig do
      params(
        sponsorable: T.any(::Organization, ::User),
        actor: T.nilable(::User),
        payout_id: T.nilable(::String),
        recipient: T.nilable(::User),
        stripe_account: T.nilable(::Billing::StripeConnect::Account),
        block: T.nilable(T.proc.params(job: ExportSponsorsPayoutsJob).void)
      ).returns(T.any(ExportSponsorsPayoutsJob, FalseClass))
    end
    def perform_later(sponsorable, actor: T.unsafe(nil), payout_id: T.unsafe(nil), recipient: T.unsafe(nil), stripe_account: T.unsafe(nil), &block); end

    sig do
      params(
        sponsorable: T.any(::Organization, ::User),
        actor: T.nilable(::User),
        payout_id: T.nilable(::String),
        recipient: T.nilable(::User),
        stripe_account: T.nilable(::Billing::StripeConnect::Account)
      ).void
    end
    def perform_now(sponsorable, actor: T.unsafe(nil), payout_id: T.unsafe(nil), recipient: T.unsafe(nil), stripe_account: T.unsafe(nil)); end
  end
end
