# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::IssueTimelineItemsEdge`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::IssueTimelineItemsEdge`.

class Api::App::PlatformTypes::IssueTimelineItemsEdge < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def cursor; end

  sig { returns(T::Boolean) }
  def cursor?; end

  sig do
    returns(T.nilable(T.any(Api::App::PlatformTypes::IssueComment, Api::App::PlatformTypes::CrossReferencedEvent, Api::App::PlatformTypes::AddedToProjectEvent, Api::App::PlatformTypes::AddedToProjectV2Event, Api::App::PlatformTypes::AssignedEvent, Api::App::PlatformTypes::ClosedEvent, Api::App::PlatformTypes::CommentDeletedEvent, Api::App::PlatformTypes::ConnectedEvent, Api::App::PlatformTypes::ConvertedFromDraftEvent, Api::App::PlatformTypes::ConvertedNoteToIssueEvent, Api::App::PlatformTypes::ConvertedToDiscussionEvent, Api::App::PlatformTypes::DemilestonedEvent, Api::App::PlatformTypes::DisconnectedEvent, Api::App::PlatformTypes::LabeledEvent, Api::App::PlatformTypes::LockedEvent, Api::App::PlatformTypes::MarkedAsDuplicateEvent, Api::App::PlatformTypes::MentionedEvent, Api::App::PlatformTypes::MilestonedEvent, Api::App::PlatformTypes::MovedColumnsInProjectEvent, Api::App::PlatformTypes::PinnedEvent, Api::App::PlatformTypes::ProjectV2ItemStatusChangedEvent, Api::App::PlatformTypes::ReferencedEvent, Api::App::PlatformTypes::RemovedFromProjectEvent, Api::App::PlatformTypes::RemovedFromProjectV2Event, Api::App::PlatformTypes::RenamedTitleEvent, Api::App::PlatformTypes::ReopenedEvent, Api::App::PlatformTypes::SubscribedEvent, Api::App::PlatformTypes::TransferredEvent, Api::App::PlatformTypes::UnassignedEvent, Api::App::PlatformTypes::UnlabeledEvent, Api::App::PlatformTypes::UnlockedEvent, Api::App::PlatformTypes::UserBlockedEvent, Api::App::PlatformTypes::UnmarkedAsDuplicateEvent, Api::App::PlatformTypes::UnpinnedEvent, Api::App::PlatformTypes::UnsubscribedEvent)))
  end
  def node; end

  sig { returns(T::Boolean) }
  def node?; end
end
