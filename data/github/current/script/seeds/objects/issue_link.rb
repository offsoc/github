# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class IssueLink
      def self.create(current_issue:, target_issue:, repo:, actor:)
        issue_link = ::IssueLink.create(
          source_issue_id: current_issue.id,
          target_issue_id: target_issue.id,
          source_repository_id: repo.id,
          target_repository_id: target_issue.repository.id,
          actor_id: actor.id,
          link_type: :track
        )
        raise Objects::CreateFailed, issue_link.errors.full_messages.to_sentence unless issue_link.valid?
        issue_link
      end
    end
  end
end
