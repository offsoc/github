# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MemexProjectItem
      def self.create_draft_issue(
        creator: Seeds::Objects::User.monalisa,
        title: Faker::Lorem.unique.word,
        memex_project: Seeds::Objects::MemexProject.create
      )

        memex_project_item = memex_project.build_item(
          creator: creator,
          draft_issue_title: title
        )

        raise Objects::CreateFailed, memex_project_item.errors.full_messages.to_sentence unless memex_project_item.valid?
        memex_project.save_with_priority!(memex_project_item)
        memex_project_item
      end

      def self.create_issue_or_pull(
        creator: Seeds::Objects::User.monalisa,
        memex_project: Seeds::Objects::MemexProject.create,
        issue_or_pull:
      )

        memex_project_item = memex_project.build_item(
          creator: creator,
          issue_or_pull: issue_or_pull
        )

        raise Objects::CreateFailed, memex_project_item.errors.full_messages.to_sentence unless memex_project_item.valid?
        memex_project.save_with_priority!(memex_project_item)
        memex_project_item
      end
    end
  end
end
