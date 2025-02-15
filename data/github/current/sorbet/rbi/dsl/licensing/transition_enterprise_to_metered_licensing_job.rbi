# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Licensing::TransitionEnterpriseToMeteredLicensingJob`.
# Please instead update this file by running `bin/tapioca dsl Licensing::TransitionEnterpriseToMeteredLicensingJob`.

class Licensing::TransitionEnterpriseToMeteredLicensingJob
  class << self
    sig do
      params(
        business: ::Business,
        actor: ::User,
        trial_upgrade: T.nilable(T::Boolean),
        licensing_model_transition_id: T.nilable(::Integer),
        ghas_only: T.nilable(T::Boolean),
        reset_ghas_configuration: T.nilable(T::Boolean),
        block: T.nilable(T.proc.params(job: Licensing::TransitionEnterpriseToMeteredLicensingJob).void)
      ).returns(T.any(Licensing::TransitionEnterpriseToMeteredLicensingJob, FalseClass))
    end
    def perform_later(business, actor:, trial_upgrade: T.unsafe(nil), licensing_model_transition_id: T.unsafe(nil), ghas_only: T.unsafe(nil), reset_ghas_configuration: T.unsafe(nil), &block); end

    sig do
      params(
        business: ::Business,
        actor: ::User,
        trial_upgrade: T.nilable(T::Boolean),
        licensing_model_transition_id: T.nilable(::Integer),
        ghas_only: T.nilable(T::Boolean),
        reset_ghas_configuration: T.nilable(T::Boolean)
      ).void
    end
    def perform_now(business, actor:, trial_upgrade: T.unsafe(nil), licensing_model_transition_id: T.unsafe(nil), ghas_only: T.unsafe(nil), reset_ghas_configuration: T.unsafe(nil)); end
  end
end
