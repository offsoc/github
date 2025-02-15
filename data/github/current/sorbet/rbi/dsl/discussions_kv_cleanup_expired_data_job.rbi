# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DiscussionsKvCleanupExpiredDataJob`.
# Please instead update this file by running `bin/tapioca dsl DiscussionsKvCleanupExpiredDataJob`.

class DiscussionsKvCleanupExpiredDataJob
  class << self
    sig do
      params(
        batch_size: ::Integer,
        duration: ::Integer,
        block: T.nilable(T.proc.params(job: DiscussionsKvCleanupExpiredDataJob).void)
      ).returns(T.any(DiscussionsKvCleanupExpiredDataJob, FalseClass))
    end
    def perform_later(batch_size: T.unsafe(nil), duration: T.unsafe(nil), &block); end

    sig { params(batch_size: ::Integer, duration: ::Integer).void }
    def perform_now(batch_size: T.unsafe(nil), duration: T.unsafe(nil)); end
  end
end
