# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Commits::V1::BaseAndTipsSelector`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Commits::V1::BaseAndTipsSelector`.

class GitHub::Spokes::Proto::Commits::V1::BaseAndTipsSelector
  sig do
    params(
      base: T.nilable(GitHub::Spokes::Proto::Types::V1::Revision),
      tips: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::Revision], T::Array[GitHub::Spokes::Proto::Types::V1::Revision]))
    ).void
  end
  def initialize(base: nil, tips: T.unsafe(nil)); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Revision)) }
  def base; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Revision)).void }
  def base=(value); end

  sig { void }
  def clear_base; end

  sig { void }
  def clear_tips; end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::Revision]) }
  def tips; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Spokes::Proto::Types::V1::Revision]).void }
  def tips=(value); end
end
