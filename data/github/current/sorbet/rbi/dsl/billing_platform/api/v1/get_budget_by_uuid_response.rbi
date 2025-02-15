# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::GetBudgetByUuidResponse`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::GetBudgetByUuidResponse`.

class BillingPlatform::Api::V1::GetBudgetByUuidResponse
  sig { params(budget: T.nilable(BillingPlatform::Api::V1::Budget)).void }
  def initialize(budget: nil); end

  sig { returns(T.nilable(BillingPlatform::Api::V1::Budget)) }
  def budget; end

  sig { params(value: T.nilable(BillingPlatform::Api::V1::Budget)).void }
  def budget=(value); end

  sig { void }
  def clear_budget; end
end
