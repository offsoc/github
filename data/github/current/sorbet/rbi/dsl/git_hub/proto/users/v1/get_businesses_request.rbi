# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Users::V1::GetBusinessesRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Users::V1::GetBusinessesRequest`.

class GitHub::Proto::Users::V1::GetBusinessesRequest
  sig do
    params(
      business_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      user_id: T.nilable(Integer)
    ).void
  end
  def initialize(business_ids: T.unsafe(nil), user_id: nil); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def business_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def business_ids=(value); end

  sig { void }
  def clear_business_ids; end

  sig { void }
  def clear_user_id; end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
