# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::LicenseRequest`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::LicenseRequest`.

class BillingPlatform::Api::V1::LicenseRequest
  sig do
    params(
      entityDetail: T.nilable(BillingPlatform::Base::EntityDetail),
      sku: T.nilable(String),
      subscriptionAt: T.nilable(Integer)
    ).void
  end
  def initialize(entityDetail: nil, sku: nil, subscriptionAt: nil); end

  sig { void }
  def clear_entityDetail; end

  sig { void }
  def clear_sku; end

  sig { void }
  def clear_subscriptionAt; end

  sig { returns(T.nilable(BillingPlatform::Base::EntityDetail)) }
  def entityDetail; end

  sig { params(value: T.nilable(BillingPlatform::Base::EntityDetail)).void }
  def entityDetail=(value); end

  sig { returns(String) }
  def sku; end

  sig { params(value: String).void }
  def sku=(value); end

  sig { returns(Integer) }
  def subscriptionAt; end

  sig { params(value: Integer).void }
  def subscriptionAt=(value); end
end
