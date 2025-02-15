# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Commits::V1::AheadBehindResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Commits::V1::AheadBehindResponse`.

class GitHub::Spokes::Proto::Commits::V1::AheadBehindResponse
  sig do
    params(
      ahead_behind_pairs: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Commits::V1::AheadBehindPair], T::Array[GitHub::Spokes::Proto::Commits::V1::AheadBehindPair]))
    ).void
  end
  def initialize(ahead_behind_pairs: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Commits::V1::AheadBehindPair]) }
  def ahead_behind_pairs; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Commits::V1::AheadBehindPair]).void }
  def ahead_behind_pairs=(value); end

  sig { void }
  def clear_ahead_behind_pairs; end
end
