# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `IssuesGraph::Proto::GetTrackingBlockResponse`.
# Please instead update this file by running `bin/tapioca dsl IssuesGraph::Proto::GetTrackingBlockResponse`.

class IssuesGraph::Proto::GetTrackingBlockResponse
  sig { params(block: T.nilable(IssuesGraph::Proto::TrackingBlock), success: T.nilable(T::Boolean)).void }
  def initialize(block: nil, success: nil); end

  sig { returns(T.nilable(IssuesGraph::Proto::TrackingBlock)) }
  def block; end

  sig { params(value: T.nilable(IssuesGraph::Proto::TrackingBlock)).void }
  def block=(value); end

  sig { void }
  def clear_block; end

  sig { void }
  def clear_success; end

  sig { returns(T::Boolean) }
  def success; end

  sig { params(value: T::Boolean).void }
  def success=(value); end
end
