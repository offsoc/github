# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GroupSyncer::V1::UpdateMappingRequest`.
# Please instead update this file by running `bin/tapioca dsl GroupSyncer::V1::UpdateMappingRequest`.

class GroupSyncer::V1::UpdateMappingRequest
  sig do
    params(
      group_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      org_id: T.nilable(String),
      team_id: T.nilable(String)
    ).void
  end
  def initialize(group_ids: T.unsafe(nil), org_id: nil, team_id: nil); end

  sig { void }
  def clear_group_ids; end

  sig { void }
  def clear_org_id; end

  sig { void }
  def clear_team_id; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def group_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def group_ids=(value); end

  sig { returns(String) }
  def org_id; end

  sig { params(value: String).void }
  def org_id=(value); end

  sig { returns(String) }
  def team_id; end

  sig { params(value: String).void }
  def team_id=(value); end
end
