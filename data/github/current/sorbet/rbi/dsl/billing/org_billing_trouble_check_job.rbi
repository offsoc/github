# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Billing::OrgBillingTroubleCheckJob`.
# Please instead update this file by running `bin/tapioca dsl Billing::OrgBillingTroubleCheckJob`.

class Billing::OrgBillingTroubleCheckJob
  class << self
    sig do
      params(
        account: T.untyped,
        block: T.nilable(T.proc.params(job: Billing::OrgBillingTroubleCheckJob).void)
      ).returns(T.any(Billing::OrgBillingTroubleCheckJob, FalseClass))
    end
    def perform_later(account, &block); end

    sig { params(account: T.untyped).returns(T.untyped) }
    def perform_now(account); end
  end
end
