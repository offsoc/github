# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `TrustTierUpdateEngagedOssJob`.
# Please instead update this file by running `bin/tapioca dsl TrustTierUpdateEngagedOssJob`.

class TrustTierUpdateEngagedOssJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: TrustTierUpdateEngagedOssJob).void)
      ).returns(T.any(TrustTierUpdateEngagedOssJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
