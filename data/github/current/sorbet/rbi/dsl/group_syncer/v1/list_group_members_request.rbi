# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GroupSyncer::V1::ListGroupMembersRequest`.
# Please instead update this file by running `bin/tapioca dsl GroupSyncer::V1::ListGroupMembersRequest`.

class GroupSyncer::V1::ListGroupMembersRequest
  sig { params(group_id: T.nilable(String), team_id: T.nilable(String)).void }
  def initialize(group_id: nil, team_id: nil); end

  sig { void }
  def clear_group_id; end

  sig { void }
  def clear_team_id; end

  sig { returns(String) }
  def group_id; end

  sig { params(value: String).void }
  def group_id=(value); end

  sig { returns(String) }
  def team_id; end

  sig { params(value: String).void }
  def team_id=(value); end
end
