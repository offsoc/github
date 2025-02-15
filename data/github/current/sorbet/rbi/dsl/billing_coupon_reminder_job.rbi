# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingCouponReminderJob`.
# Please instead update this file by running `bin/tapioca dsl BillingCouponReminderJob`.

class BillingCouponReminderJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: BillingCouponReminderJob).void)
      ).returns(T.any(BillingCouponReminderJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
