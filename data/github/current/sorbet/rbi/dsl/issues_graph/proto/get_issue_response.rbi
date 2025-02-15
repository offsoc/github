# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `IssuesGraph::Proto::GetIssueResponse`.
# Please instead update this file by running `bin/tapioca dsl IssuesGraph::Proto::GetIssueResponse`.

class IssuesGraph::Proto::GetIssueResponse
  sig do
    params(
      issue: T.nilable(IssuesGraph::Proto::Issue),
      queryType: T.nilable(T.any(Symbol, Integer)),
      responseSourceType: T.nilable(T.any(Symbol, Integer)),
      trackedBy: T.nilable(T.any(Google::Protobuf::RepeatedField[IssuesGraph::Proto::TrackingBlock], T::Array[IssuesGraph::Proto::TrackingBlock])),
      tracking: T.nilable(T.any(Google::Protobuf::RepeatedField[IssuesGraph::Proto::TrackingBlock], T::Array[IssuesGraph::Proto::TrackingBlock]))
    ).void
  end
  def initialize(issue: nil, queryType: nil, responseSourceType: nil, trackedBy: T.unsafe(nil), tracking: T.unsafe(nil)); end

  sig { void }
  def clear_issue; end

  sig { void }
  def clear_queryType; end

  sig { void }
  def clear_responseSourceType; end

  sig { void }
  def clear_trackedBy; end

  sig { void }
  def clear_tracking; end

  sig { returns(T.nilable(IssuesGraph::Proto::Issue)) }
  def issue; end

  sig { params(value: T.nilable(IssuesGraph::Proto::Issue)).void }
  def issue=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def queryType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def queryType=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def responseSourceType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def responseSourceType=(value); end

  sig { returns(Google::Protobuf::RepeatedField[IssuesGraph::Proto::TrackingBlock]) }
  def trackedBy; end

  sig { params(value: Google::Protobuf::RepeatedField[IssuesGraph::Proto::TrackingBlock]).void }
  def trackedBy=(value); end

  sig { returns(Google::Protobuf::RepeatedField[IssuesGraph::Proto::TrackingBlock]) }
  def tracking; end

  sig { params(value: Google::Protobuf::RepeatedField[IssuesGraph::Proto::TrackingBlock]).void }
  def tracking=(value); end
end
