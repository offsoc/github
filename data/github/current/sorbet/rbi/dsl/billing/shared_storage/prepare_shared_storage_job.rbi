# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Billing::SharedStorage::PrepareSharedStorageJob`.
# Please instead update this file by running `bin/tapioca dsl Billing::SharedStorage::PrepareSharedStorageJob`.

class Billing::SharedStorage::PrepareSharedStorageJob
  class << self
    sig do
      params(
        owner_id: T.untyped,
        billable_owner_type: T.untyped,
        billable_owner_id: T.untyped,
        repository_visibility: T.untyped,
        repository_id: T.untyped,
        block: T.nilable(T.proc.params(job: Billing::SharedStorage::PrepareSharedStorageJob).void)
      ).returns(T.any(Billing::SharedStorage::PrepareSharedStorageJob, FalseClass))
    end
    def perform_later(owner_id:, billable_owner_type:, billable_owner_id:, repository_visibility:, repository_id: T.unsafe(nil), &block); end

    sig do
      params(
        owner_id: T.untyped,
        billable_owner_type: T.untyped,
        billable_owner_id: T.untyped,
        repository_visibility: T.untyped,
        repository_id: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(owner_id:, billable_owner_type:, billable_owner_id:, repository_visibility:, repository_id: T.unsafe(nil)); end
  end
end
