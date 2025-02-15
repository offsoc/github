# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `RebuildStorageUsageJob`.
# Please instead update this file by running `bin/tapioca dsl RebuildStorageUsageJob`.

class RebuildStorageUsageJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        options: T.untyped,
        block: T.nilable(T.proc.params(job: RebuildStorageUsageJob).void)
      ).returns(T.any(RebuildStorageUsageJob, FalseClass))
    end
    def perform_later(user_id, options = T.unsafe(nil), &block); end

    sig { params(user_id: T.untyped, options: T.untyped).returns(T.untyped) }
    def perform_now(user_id, options = T.unsafe(nil)); end
  end
end
