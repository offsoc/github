# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Meuse::Services::V1::GetEntitlementPlansRequest`.
# Please instead update this file by running `bin/tapioca dsl Meuse::Services::V1::GetEntitlementPlansRequest`.

class Meuse::Services::V1::GetEntitlementPlansRequest
  sig do
    params(
      as_of: T.nilable(Google::Protobuf::Timestamp),
      customer_id: T.nilable(Integer),
      entitlement_names: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      plan_name: T.nilable(String)
    ).void
  end
  def initialize(as_of: nil, customer_id: nil, entitlement_names: T.unsafe(nil), plan_name: nil); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def as_of; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def as_of=(value); end

  sig { void }
  def clear_as_of; end

  sig { void }
  def clear_customer_id; end

  sig { void }
  def clear_entitlement_names; end

  sig { void }
  def clear_plan_name; end

  sig { returns(Integer) }
  def customer_id; end

  sig { params(value: Integer).void }
  def customer_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def entitlement_names; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def entitlement_names=(value); end

  sig { returns(String) }
  def plan_name; end

  sig { params(value: String).void }
  def plan_name=(value); end
end
