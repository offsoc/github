# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::IssueTimelineItemEdge`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::IssueTimelineItemEdge`.

class PlatformTypes::IssueTimelineItemEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig do
    returns(T.nilable(T.any(PlatformTypes::Commit, PlatformTypes::IssueComment, PlatformTypes::CrossReferencedEvent, PlatformTypes::ClosedEvent, PlatformTypes::ReopenedEvent, PlatformTypes::SubscribedEvent, PlatformTypes::UnsubscribedEvent, PlatformTypes::ReferencedEvent, PlatformTypes::AssignedEvent, PlatformTypes::UnassignedEvent, PlatformTypes::LabeledEvent, PlatformTypes::UnlabeledEvent, PlatformTypes::UserBlockedEvent, PlatformTypes::MilestonedEvent, PlatformTypes::DemilestonedEvent, PlatformTypes::RenamedTitleEvent, PlatformTypes::LockedEvent, PlatformTypes::UnlockedEvent, PlatformTypes::TransferredEvent)))
  end
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
