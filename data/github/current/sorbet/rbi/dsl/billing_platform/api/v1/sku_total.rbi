# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::SkuTotal`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::SkuTotal`.

class BillingPlatform::Api::V1::SkuTotal
  sig do
    params(
      billingItems: T.nilable(T.any(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::BillingItem], T::Array[BillingPlatform::Api::V1::BillingItem])),
      sku: T.nilable(String),
      usageTotal: T.nilable(BillingPlatform::Api::V1::UsageTotal)
    ).void
  end
  def initialize(billingItems: T.unsafe(nil), sku: nil, usageTotal: nil); end

  sig { returns(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::BillingItem]) }
  def billingItems; end

  sig { params(value: Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::BillingItem]).void }
  def billingItems=(value); end

  sig { void }
  def clear_billingItems; end

  sig { void }
  def clear_sku; end

  sig { void }
  def clear_usageTotal; end

  sig { returns(String) }
  def sku; end

  sig { params(value: String).void }
  def sku=(value); end

  sig { returns(T.nilable(BillingPlatform::Api::V1::UsageTotal)) }
  def usageTotal; end

  sig { params(value: T.nilable(BillingPlatform::Api::V1::UsageTotal)).void }
  def usageTotal=(value); end
end
