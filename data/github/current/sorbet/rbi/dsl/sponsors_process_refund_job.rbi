# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SponsorsProcessRefundJob`.
# Please instead update this file by running `bin/tapioca dsl SponsorsProcessRefundJob`.

class SponsorsProcessRefundJob
  class << self
    sig do
      params(
        refund_transaction: ::Billing::BillingTransaction,
        sale_transaction: ::Billing::BillingTransaction,
        block: T.nilable(T.proc.params(job: SponsorsProcessRefundJob).void)
      ).returns(T.any(SponsorsProcessRefundJob, FalseClass))
    end
    def perform_later(refund_transaction:, sale_transaction:, &block); end

    sig do
      params(
        refund_transaction: ::Billing::BillingTransaction,
        sale_transaction: ::Billing::BillingTransaction
      ).void
    end
    def perform_now(refund_transaction:, sale_transaction:); end
  end
end
