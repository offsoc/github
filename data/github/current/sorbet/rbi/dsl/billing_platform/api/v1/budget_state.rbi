# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::BudgetState`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::BudgetState`.

class BillingPlatform::Api::V1::BudgetState
  sig do
    params(
      currentAmount: T.nilable(Float),
      isFullyFunded: T.nilable(T::Boolean),
      quantity: T.nilable(Float),
      targetAmount: T.nilable(Float),
      thresholdMet: T.nilable(BillingPlatform::Api::V1::BudgetThreshold)
    ).void
  end
  def initialize(currentAmount: nil, isFullyFunded: nil, quantity: nil, targetAmount: nil, thresholdMet: nil); end

  sig { void }
  def clear_currentAmount; end

  sig { void }
  def clear_isFullyFunded; end

  sig { void }
  def clear_quantity; end

  sig { void }
  def clear_targetAmount; end

  sig { void }
  def clear_thresholdMet; end

  sig { returns(Float) }
  def currentAmount; end

  sig { params(value: Float).void }
  def currentAmount=(value); end

  sig { returns(T::Boolean) }
  def isFullyFunded; end

  sig { params(value: T::Boolean).void }
  def isFullyFunded=(value); end

  sig { returns(Float) }
  def quantity; end

  sig { params(value: Float).void }
  def quantity=(value); end

  sig { returns(Float) }
  def targetAmount; end

  sig { params(value: Float).void }
  def targetAmount=(value); end

  sig { returns(T.nilable(BillingPlatform::Api::V1::BudgetThreshold)) }
  def thresholdMet; end

  sig { params(value: T.nilable(BillingPlatform::Api::V1::BudgetThreshold)).void }
  def thresholdMet=(value); end
end
