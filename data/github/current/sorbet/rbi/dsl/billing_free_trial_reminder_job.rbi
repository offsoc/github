# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingFreeTrialReminderJob`.
# Please instead update this file by running `bin/tapioca dsl BillingFreeTrialReminderJob`.

class BillingFreeTrialReminderJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: BillingFreeTrialReminderJob).void)
      ).returns(T.any(BillingFreeTrialReminderJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
