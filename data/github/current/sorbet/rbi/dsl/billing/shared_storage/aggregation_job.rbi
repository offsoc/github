# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Billing::SharedStorage::AggregationJob`.
# Please instead update this file by running `bin/tapioca dsl Billing::SharedStorage::AggregationJob`.

class Billing::SharedStorage::AggregationJob
  class << self
    sig do
      params(
        cutoff: T.untyped,
        owner_id: T.untyped,
        block: T.nilable(T.proc.params(job: Billing::SharedStorage::AggregationJob).void)
      ).returns(T.any(Billing::SharedStorage::AggregationJob, FalseClass))
    end
    def perform_later(cutoff:, owner_id:, &block); end

    sig { params(cutoff: T.untyped, owner_id: T.untyped).returns(T.untyped) }
    def perform_now(cutoff:, owner_id:); end
  end
end
