# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `IssuesGraph::Proto::UpdateTrackingBlockByKeyRequest`.
# Please instead update this file by running `bin/tapioca dsl IssuesGraph::Proto::UpdateTrackingBlockByKeyRequest`.

class IssuesGraph::Proto::UpdateTrackingBlockByKeyRequest
  sig do
    params(
      issuesToAdd: T.nilable(T.any(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue], T::Array[IssuesGraph::Proto::Issue])),
      issuesToRemove: T.nilable(T.any(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue], T::Array[IssuesGraph::Proto::Issue])),
      issuesToUpdate: T.nilable(T.any(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue], T::Array[IssuesGraph::Proto::Issue])),
      key: T.nilable(IssuesGraph::Proto::Key),
      type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(issuesToAdd: T.unsafe(nil), issuesToRemove: T.unsafe(nil), issuesToUpdate: T.unsafe(nil), key: nil, type: nil); end

  sig { void }
  def clear_issuesToAdd; end

  sig { void }
  def clear_issuesToRemove; end

  sig { void }
  def clear_issuesToUpdate; end

  sig { void }
  def clear_key; end

  sig { void }
  def clear_type; end

  sig { returns(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]) }
  def issuesToAdd; end

  sig { params(value: Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]).void }
  def issuesToAdd=(value); end

  sig { returns(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]) }
  def issuesToRemove; end

  sig { params(value: Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]).void }
  def issuesToRemove=(value); end

  sig { returns(Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]) }
  def issuesToUpdate; end

  sig { params(value: Google::Protobuf::RepeatedField[IssuesGraph::Proto::Issue]).void }
  def issuesToUpdate=(value); end

  sig { returns(T.nilable(IssuesGraph::Proto::Key)) }
  def key; end

  sig { params(value: T.nilable(IssuesGraph::Proto::Key)).void }
  def key=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
