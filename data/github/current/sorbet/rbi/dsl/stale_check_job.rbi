# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `StaleCheckJob`.
# Please instead update this file by running `bin/tapioca dsl StaleCheckJob`.

class StaleCheckJob
  class << self
    sig { params(block: T.nilable(T.proc.params(job: StaleCheckJob).void)).returns(T.any(StaleCheckJob, FalseClass)) }
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
