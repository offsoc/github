# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Api::V1::Pricing`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Api::V1::Pricing`.

class BillingPlatform::Api::V1::Pricing
  sig do
    params(
      azureMeterId: T.nilable(String),
      effectiveAt: T.nilable(Integer),
      effectiveDatePrices: T.nilable(T.any(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::HistoricalPrice], T::Array[BillingPlatform::Api::V1::HistoricalPrice])),
      freeForPublicRepos: T.nilable(T::Boolean),
      friendlyName: T.nilable(String),
      meterType: T.nilable(T.any(Symbol, Integer)),
      price: T.nilable(Float),
      product: T.nilable(String),
      sku: T.nilable(String),
      unitType: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(azureMeterId: nil, effectiveAt: nil, effectiveDatePrices: T.unsafe(nil), freeForPublicRepos: nil, friendlyName: nil, meterType: nil, price: nil, product: nil, sku: nil, unitType: nil); end

  sig { returns(String) }
  def azureMeterId; end

  sig { params(value: String).void }
  def azureMeterId=(value); end

  sig { void }
  def clear_azureMeterId; end

  sig { void }
  def clear_effectiveAt; end

  sig { void }
  def clear_effectiveDatePrices; end

  sig { void }
  def clear_freeForPublicRepos; end

  sig { void }
  def clear_friendlyName; end

  sig { void }
  def clear_meterType; end

  sig { void }
  def clear_price; end

  sig { void }
  def clear_product; end

  sig { void }
  def clear_sku; end

  sig { void }
  def clear_unitType; end

  sig { returns(Integer) }
  def effectiveAt; end

  sig { params(value: Integer).void }
  def effectiveAt=(value); end

  sig { returns(Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::HistoricalPrice]) }
  def effectiveDatePrices; end

  sig { params(value: Google::Protobuf::RepeatedField[BillingPlatform::Api::V1::HistoricalPrice]).void }
  def effectiveDatePrices=(value); end

  sig { returns(T::Boolean) }
  def freeForPublicRepos; end

  sig { params(value: T::Boolean).void }
  def freeForPublicRepos=(value); end

  sig { returns(String) }
  def friendlyName; end

  sig { params(value: String).void }
  def friendlyName=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def meterType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def meterType=(value); end

  sig { returns(Float) }
  def price; end

  sig { params(value: Float).void }
  def price=(value); end

  sig { returns(String) }
  def product; end

  sig { params(value: String).void }
  def product=(value); end

  sig { returns(String) }
  def sku; end

  sig { params(value: String).void }
  def sku=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def unitType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def unitType=(value); end
end
