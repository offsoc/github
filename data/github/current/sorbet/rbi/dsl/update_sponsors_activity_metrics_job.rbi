# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UpdateSponsorsActivityMetricsJob`.
# Please instead update this file by running `bin/tapioca dsl UpdateSponsorsActivityMetricsJob`.

class UpdateSponsorsActivityMetricsJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: UpdateSponsorsActivityMetricsJob).void)
      ).returns(T.any(UpdateSponsorsActivityMetricsJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
