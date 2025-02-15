# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GroupSyncer::V1::ListGroupMembersResponse`.
# Please instead update this file by running `bin/tapioca dsl GroupSyncer::V1::ListGroupMembersResponse`.

class GroupSyncer::V1::ListGroupMembersResponse
  sig do
    params(
      members: T.nilable(T.any(Google::Protobuf::RepeatedField[GroupSyncer::V1::GroupMember], T::Array[GroupSyncer::V1::GroupMember]))
    ).void
  end
  def initialize(members: T.unsafe(nil)); end

  sig { void }
  def clear_members; end

  sig { returns(Google::Protobuf::RepeatedField[GroupSyncer::V1::GroupMember]) }
  def members; end

  sig { params(value: Google::Protobuf::RepeatedField[GroupSyncer::V1::GroupMember]).void }
  def members=(value); end
end
