# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Copilot::Billing::ScheduledPlanDowngradeJob`.
# Please instead update this file by running `bin/tapioca dsl Copilot::Billing::ScheduledPlanDowngradeJob`.

class Copilot::Billing::ScheduledPlanDowngradeJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: Copilot::Billing::ScheduledPlanDowngradeJob).void)
      ).returns(T.any(Copilot::Billing::ScheduledPlanDowngradeJob, FalseClass))
    end
    def perform_later(&block); end

    sig { void }
    def perform_now; end
  end
end
