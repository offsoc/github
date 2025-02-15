# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Marketplace::V0::Entities::AppBillingPlan`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Marketplace::V0::Entities::AppBillingPlan`.

class Hydro::Schemas::Github::Marketplace::V0::Entities::AppBillingPlan
  sig do
    params(
      plan_id: T.nilable(Integer),
      plan_name: T.nilable(String),
      plan_price_cents: T.nilable(Integer),
      renewal_frequency: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(plan_id: nil, plan_name: nil, plan_price_cents: nil, renewal_frequency: nil); end

  sig { void }
  def clear_plan_id; end

  sig { void }
  def clear_plan_name; end

  sig { void }
  def clear_plan_price_cents; end

  sig { void }
  def clear_renewal_frequency; end

  sig { returns(Integer) }
  def plan_id; end

  sig { params(value: Integer).void }
  def plan_id=(value); end

  sig { returns(String) }
  def plan_name; end

  sig { params(value: String).void }
  def plan_name=(value); end

  sig { returns(Integer) }
  def plan_price_cents; end

  sig { params(value: Integer).void }
  def plan_price_cents=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def renewal_frequency; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def renewal_frequency=(value); end
end
