# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SpokesDiskStatsCacheFillJob`.
# Please instead update this file by running `bin/tapioca dsl SpokesDiskStatsCacheFillJob`.

class SpokesDiskStatsCacheFillJob
  class << self
    sig do
      params(
        queued_at: T.untyped,
        block: T.nilable(T.proc.params(job: SpokesDiskStatsCacheFillJob).void)
      ).returns(T.any(SpokesDiskStatsCacheFillJob, FalseClass))
    end
    def perform_later(queued_at, &block); end

    sig { params(queued_at: T.untyped).returns(T.untyped) }
    def perform_now(queued_at); end
  end
end
