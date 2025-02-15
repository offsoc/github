# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `EnterpriseCloudOnboard::GhasTrialEligibilityJob`.
# Please instead update this file by running `bin/tapioca dsl EnterpriseCloudOnboard::GhasTrialEligibilityJob`.

class EnterpriseCloudOnboard::GhasTrialEligibilityJob
  class << self
    sig do
      params(
        organization: T.untyped,
        block: T.nilable(T.proc.params(job: EnterpriseCloudOnboard::GhasTrialEligibilityJob).void)
      ).returns(T.any(EnterpriseCloudOnboard::GhasTrialEligibilityJob, FalseClass))
    end
    def perform_later(organization, &block); end

    sig { params(organization: T.untyped).returns(T.untyped) }
    def perform_now(organization); end
  end
end
