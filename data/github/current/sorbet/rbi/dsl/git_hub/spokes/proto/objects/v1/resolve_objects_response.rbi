# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse`.

class GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse
  sig do
    params(
      items: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem], T::Array[GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem]))
    ).void
  end
  def initialize(items: T.unsafe(nil)); end

  sig { void }
  def clear_items; end

  sig do
    returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem])
  end
  def items; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem]
    ).void
  end
  def items=(value); end
end
