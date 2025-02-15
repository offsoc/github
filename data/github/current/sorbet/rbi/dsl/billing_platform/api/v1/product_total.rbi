# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::ProductTotal`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::ProductTotal`.

class BillingPlatform::Api::V1::ProductTotal
  sig { params(fields: T.untyped).void }
  def initialize(**fields); end

  sig { returns(Google::Protobuf::Map[String, BillingPlatform::Api::V1::SkuTotal]) }
  def SkuTotals; end

  sig { params(value: Google::Protobuf::Map[String, BillingPlatform::Api::V1::SkuTotal]).void }
  def SkuTotals=(value); end

  sig { void }
  def clear_SkuTotals; end

  sig { void }
  def clear_product; end

  sig { void }
  def clear_usageTotal; end

  sig { returns(String) }
  def product; end

  sig { params(value: String).void }
  def product=(value); end

  sig { returns(T.nilable(BillingPlatform::Api::V1::UsageTotal)) }
  def usageTotal; end

  sig { params(value: T.nilable(BillingPlatform::Api::V1::UsageTotal)).void }
  def usageTotal=(value); end
end
