# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Licensify::Services::V1::ProductEnablement`.
# Please instead update this file by running `bin/tapioca dsl Licensify::Services::V1::ProductEnablement`.

class Licensify::Services::V1::ProductEnablement
  sig do
    params(
      customerId: T.nilable(Integer),
      enabledAt: T.nilable(Google::Protobuf::Timestamp),
      enablementId: T.nilable(Integer),
      enablementType: T.nilable(T.any(Symbol, Integer)),
      globalId: T.nilable(String),
      product: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(customerId: nil, enabledAt: nil, enablementId: nil, enablementType: nil, globalId: nil, product: nil); end

  sig { void }
  def clear_customerId; end

  sig { void }
  def clear_enabledAt; end

  sig { void }
  def clear_enablementId; end

  sig { void }
  def clear_enablementType; end

  sig { void }
  def clear_globalId; end

  sig { void }
  def clear_product; end

  sig { returns(Integer) }
  def customerId; end

  sig { params(value: Integer).void }
  def customerId=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def enabledAt; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def enabledAt=(value); end

  sig { returns(Integer) }
  def enablementId; end

  sig { params(value: Integer).void }
  def enablementId=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def enablementType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def enablementType=(value); end

  sig { returns(String) }
  def globalId; end

  sig { params(value: String).void }
  def globalId=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def product; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def product=(value); end
end
