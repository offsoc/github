# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Billing::AdvancedSecurity::SelfServeTrialCleanupJob`.
# Please instead update this file by running `bin/tapioca dsl Billing::AdvancedSecurity::SelfServeTrialCleanupJob`.

class Billing::AdvancedSecurity::SelfServeTrialCleanupJob
  class << self
    sig do
      params(
        subscription_item: ::Billing::SubscriptionItem,
        block: T.nilable(T.proc.params(job: Billing::AdvancedSecurity::SelfServeTrialCleanupJob).void)
      ).returns(T.any(Billing::AdvancedSecurity::SelfServeTrialCleanupJob, FalseClass))
    end
    def perform_later(subscription_item, &block); end

    sig { params(subscription_item: ::Billing::SubscriptionItem).void }
    def perform_now(subscription_item); end
  end
end
