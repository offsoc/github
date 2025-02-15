# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Management::V3::AddMembersRequest`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Management::V3::AddMembersRequest`.

class FeatureManagement::FeatureFlags::Management::V3::AddMembersRequest
  sig do
    params(
      member_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      segment_name: T.nilable(String)
    ).void
  end
  def initialize(member_ids: T.unsafe(nil), segment_name: nil); end

  sig { void }
  def clear_member_ids; end

  sig { void }
  def clear_segment_name; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def member_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def member_ids=(value); end

  sig { returns(String) }
  def segment_name; end

  sig { params(value: String).void }
  def segment_name=(value); end
end
