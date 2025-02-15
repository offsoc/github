# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GroupSyncer::V1::GroupMember`.
# Please instead update this file by running `bin/tapioca dsl GroupSyncer::V1::GroupMember`.

class GroupSyncer::V1::GroupMember
  sig { params(id: T.nilable(String), name: T.nilable(String)).void }
  def initialize(id: nil, name: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_name; end

  sig { returns(String) }
  def id; end

  sig { params(value: String).void }
  def id=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
