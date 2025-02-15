# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Runnergroups::UpdateTargetsRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Runnergroups::UpdateTargetsRequest`.

class GitHub::Launch::Services::Runnergroups::UpdateTargetsRequest
  sig do
    params(
      group_id: T.nilable(Integer),
      owner_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity),
      target_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Launch::Pbtypes::GitHub::Identity], T::Array[GitHub::Launch::Pbtypes::GitHub::Identity]))
    ).void
  end
  def initialize(group_id: nil, owner_id: nil, target_ids: T.unsafe(nil)); end

  sig { void }
  def clear_group_id; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_target_ids; end

  sig { returns(Integer) }
  def group_id; end

  sig { params(value: Integer).void }
  def group_id=(value); end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def owner_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def owner_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Launch::Pbtypes::GitHub::Identity]) }
  def target_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Launch::Pbtypes::GitHub::Identity]).void }
  def target_ids=(value); end
end
