# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Codespaces::PastRetentionJob`.
# Please instead update this file by running `bin/tapioca dsl Codespaces::PastRetentionJob`.

class Codespaces::PastRetentionJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: Codespaces::PastRetentionJob).void)
      ).returns(T.any(Codespaces::PastRetentionJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
