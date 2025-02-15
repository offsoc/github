# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MeteredAdvancedSecurityScheduledEmitterJob::BusinessEmitterJob`.
# Please instead update this file by running `bin/tapioca dsl MeteredAdvancedSecurityScheduledEmitterJob::BusinessEmitterJob`.

class MeteredAdvancedSecurityScheduledEmitterJob::BusinessEmitterJob
  class << self
    sig do
      params(
        business_id: ::Integer,
        usage_id: ::String,
        block: T.nilable(T.proc.params(job: MeteredAdvancedSecurityScheduledEmitterJob::BusinessEmitterJob).void)
      ).returns(T.any(MeteredAdvancedSecurityScheduledEmitterJob::BusinessEmitterJob, FalseClass))
    end
    def perform_later(business_id:, usage_id:, &block); end

    sig { params(business_id: ::Integer, usage_id: ::String).void }
    def perform_now(business_id:, usage_id:); end
  end
end
