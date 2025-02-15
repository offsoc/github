# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GroupSyncer::V1::ListGroupsResponse`.
# Please instead update this file by running `bin/tapioca dsl GroupSyncer::V1::ListGroupsResponse`.

class GroupSyncer::V1::ListGroupsResponse
  sig do
    params(
      groups: T.nilable(T.any(Google::Protobuf::RepeatedField[GroupSyncer::V1::Group], T::Array[GroupSyncer::V1::Group])),
      next_page_token: T.nilable(String)
    ).void
  end
  def initialize(groups: T.unsafe(nil), next_page_token: nil); end

  sig { void }
  def clear_groups; end

  sig { void }
  def clear_next_page_token; end

  sig { returns(Google::Protobuf::RepeatedField[GroupSyncer::V1::Group]) }
  def groups; end

  sig { params(value: Google::Protobuf::RepeatedField[GroupSyncer::V1::Group]).void }
  def groups=(value); end

  sig { returns(String) }
  def next_page_token; end

  sig { params(value: String).void }
  def next_page_token=(value); end
end
