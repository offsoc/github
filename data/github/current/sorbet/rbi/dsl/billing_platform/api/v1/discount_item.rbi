# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::DiscountItem`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::DiscountItem`.

class BillingPlatform::Api::V1::DiscountItem
  sig do
    params(
      discountAmount: T.nilable(Float),
      product: T.nilable(String),
      quantity: T.nilable(Float),
      selfReference: T.nilable(BillingPlatform::Base::Key),
      sku: T.nilable(String),
      unitType: T.nilable(T.any(Symbol, Integer)),
      usageAt: T.nilable(Integer)
    ).void
  end
  def initialize(discountAmount: nil, product: nil, quantity: nil, selfReference: nil, sku: nil, unitType: nil, usageAt: nil); end

  sig { void }
  def clear_discountAmount; end

  sig { void }
  def clear_product; end

  sig { void }
  def clear_quantity; end

  sig { void }
  def clear_selfReference; end

  sig { void }
  def clear_sku; end

  sig { void }
  def clear_unitType; end

  sig { void }
  def clear_usageAt; end

  sig { returns(Float) }
  def discountAmount; end

  sig { params(value: Float).void }
  def discountAmount=(value); end

  sig { returns(String) }
  def product; end

  sig { params(value: String).void }
  def product=(value); end

  sig { returns(Float) }
  def quantity; end

  sig { params(value: Float).void }
  def quantity=(value); end

  sig { returns(T.nilable(BillingPlatform::Base::Key)) }
  def selfReference; end

  sig { params(value: T.nilable(BillingPlatform::Base::Key)).void }
  def selfReference=(value); end

  sig { returns(String) }
  def sku; end

  sig { params(value: String).void }
  def sku=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def unitType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def unitType=(value); end

  sig { returns(Integer) }
  def usageAt; end

  sig { params(value: Integer).void }
  def usageAt=(value); end
end
