# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DeleteExpiredReservedLoginTombstonesJob`.
# Please instead update this file by running `bin/tapioca dsl DeleteExpiredReservedLoginTombstonesJob`.

class DeleteExpiredReservedLoginTombstonesJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: DeleteExpiredReservedLoginTombstonesJob).void)
      ).returns(T.any(DeleteExpiredReservedLoginTombstonesJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
