# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::CostCenter`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::CostCenter`.

class BillingPlatform::Api::V1::CostCenter
  sig do
    params(
      costCenterKey: T.nilable(BillingPlatform::Api::V1::CostCenterKey),
      costCenterState: T.nilable(T.any(Symbol, Integer)),
      name: T.nilable(String),
      resources: T.nilable(T.any(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::Resource], T::Array[BillingPlatform::Api::V1::Resource]))
    ).void
  end
  def initialize(costCenterKey: nil, costCenterState: nil, name: nil, resources: T.unsafe(nil)); end

  sig { void }
  def clear_costCenterKey; end

  sig { void }
  def clear_costCenterState; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_resources; end

  sig { returns(T.nilable(BillingPlatform::Api::V1::CostCenterKey)) }
  def costCenterKey; end

  sig { params(value: T.nilable(BillingPlatform::Api::V1::CostCenterKey)).void }
  def costCenterKey=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def costCenterState; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def costCenterState=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::Resource]) }
  def resources; end

  sig { params(value: Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::Resource]).void }
  def resources=(value); end
end
