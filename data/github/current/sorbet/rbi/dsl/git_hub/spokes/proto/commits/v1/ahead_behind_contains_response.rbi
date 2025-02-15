# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Commits::V1::AheadBehindContainsResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Commits::V1::AheadBehindContainsResponse`.

class GitHub::Spokes::Proto::Commits::V1::AheadBehindContainsResponse
  sig do
    params(
      tips: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::Revision], T::Array[GitHub::Spokes::Proto::Types::V1::Revision]))
    ).void
  end
  def initialize(tips: T.unsafe(nil)); end

  sig { void }
  def clear_tips; end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::Revision]) }
  def tips; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::Revision]).void }
  def tips=(value); end
end
