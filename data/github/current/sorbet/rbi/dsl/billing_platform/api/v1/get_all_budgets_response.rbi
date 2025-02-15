# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::GetAllBudgetsResponse`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::GetAllBudgetsResponse`.

class BillingPlatform::Api::V1::GetAllBudgetsResponse
  sig do
    params(
      budgets: T.nilable(T.any(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::BudgetInfo], T::Array[BillingPlatform::Api::V1::BudgetInfo]))
    ).void
  end
  def initialize(budgets: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::BudgetInfo]) }
  def budgets; end

  sig { params(value: Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::BudgetInfo]).void }
  def budgets=(value); end

  sig { void }
  def clear_budgets; end
end
