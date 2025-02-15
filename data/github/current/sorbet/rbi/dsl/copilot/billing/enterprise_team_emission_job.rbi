# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Copilot::Billing::EnterpriseTeamEmissionJob`.
# Please instead update this file by running `bin/tapioca dsl Copilot::Billing::EnterpriseTeamEmissionJob`.

class Copilot::Billing::EnterpriseTeamEmissionJob
  class << self
    sig do
      params(
        enterprise_id: ::Integer,
        block: T.nilable(T.proc.params(job: Copilot::Billing::EnterpriseTeamEmissionJob).void)
      ).returns(T.any(Copilot::Billing::EnterpriseTeamEmissionJob, FalseClass))
    end
    def perform_later(enterprise_id, &block); end

    sig { params(enterprise_id: ::Integer).void }
    def perform_now(enterprise_id); end
  end
end
