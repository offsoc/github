# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `IssuesGraph::Proto::UpsertProjectAndRelationshipsRequest`.
# Please instead update this file by running `bin/tapioca dsl IssuesGraph::Proto::UpsertProjectAndRelationshipsRequest`.

class IssuesGraph::Proto::UpsertProjectAndRelationshipsRequest
  sig do
    params(
      from: T.nilable(IssuesGraph::Proto::Project),
      to: T.nilable(T.any(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue], T::Array[IssuesGraph::Proto::Issue])),
      type: T.nilable(T.any(Symbol, Integer)),
      upsertingUser: T.nilable(IssuesGraph::Proto::User)
    ).void
  end
  def initialize(from: nil, to: T.unsafe(nil), type: nil, upsertingUser: nil); end

  sig { void }
  def clear_from; end

  sig { void }
  def clear_to; end

  sig { void }
  def clear_type; end

  sig { void }
  def clear_upsertingUser; end

  sig { returns(T.nilable(IssuesGraph::Proto::Project)) }
  def from; end

  sig { params(value: T.nilable(IssuesGraph::Proto::Project)).void }
  def from=(value); end

  sig { returns(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]) }
  def to; end

  sig { params(value: Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]).void }
  def to=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end

  sig { returns(T.nilable(IssuesGraph::Proto::User)) }
  def upsertingUser; end

  sig { params(value: T.nilable(IssuesGraph::Proto::User)).void }
  def upsertingUser=(value); end
end
