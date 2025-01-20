class Zuorest::Model::Subscription < Zuorest::Model::Base
  zuora_rest_namespace "/v1/subscriptions/"

  # A rate_plan, in this context, is a product that the customer bought
  contains_many :rate_plans, :class_name => "Zuorest::Model::Subscription::RatePlan"

  # Determines if this subscription is currently active. Subscriptions whose versions are
  # not current are not considered active, even if their term dates are current.
  #
  # Returns true if current version.
  def active?
    body["status"] == "Active"
  end

  # Totals the unit specified from all the RatePlanCharges that comprise this subscription.
  #
  # Optionally takes a sku and sums only the units associated with charges for that sku.
  #
  # Returns a Float.
  def total_of_unit(unit, sku: nil)
    matching_rate_plans = rate_plans

    matching_rate_plans.select! do |rate_plan|
      rate_plan[:productSku] == sku
    end if sku

    matching_rate_plans.map{ |rate_plan| rate_plan.total_of_unit unit }.sum
  end

  class RatePlan < Zuorest::Model::Base
    contains_many :rate_plan_charges, :class_name => "Zuorest::Model::Subscription::RatePlanCharge"

    # An subscription may have more than one charge with the same "unit of measure"
    # This returns the total count for all the charges of that unit.
    def total_of_unit(unit)
      rate_plan_charges.select{|rpc| rpc[:uom] == unit}.sum{|item| item[:quantity]}
    end
  end

  class RatePlanCharge < Zuorest::Model::Base
  end
end
