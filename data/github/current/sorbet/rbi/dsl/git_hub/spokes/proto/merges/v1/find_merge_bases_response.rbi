# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Merges::V1::FindMergeBasesResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Merges::V1::FindMergeBasesResponse`.

class GitHub::Spokes::Proto::Merges::V1::FindMergeBasesResponse
  sig do
    params(
      bases: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::ObjectID], T::Array[GitHub::Spokes::Proto::Types::V1::ObjectID]))
    ).void
  end
  def initialize(bases: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::ObjectID]) }
  def bases; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::ObjectID]).void }
  def bases=(value); end

  sig { void }
  def clear_bases; end
end
