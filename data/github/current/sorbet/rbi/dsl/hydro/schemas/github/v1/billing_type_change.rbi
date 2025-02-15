# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::BillingTypeChange`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::BillingTypeChange`.

class Hydro::Schemas::Github::V1::BillingTypeChange
  sig do
    params(
      account: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      current_billing_type: T.nilable(T.any(Symbol, Integer)),
      previous_billing_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(account: nil, actor: nil, current_billing_type: nil, previous_billing_type: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def account; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def account=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_account; end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_current_billing_type; end

  sig { void }
  def clear_previous_billing_type; end

  sig { returns(T.any(Symbol, Integer)) }
  def current_billing_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def current_billing_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def previous_billing_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def previous_billing_type=(value); end
end
