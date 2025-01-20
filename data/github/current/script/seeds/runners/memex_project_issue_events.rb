# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class MemexProjectIssueEvents < Seeds::Runner

      def self.help
        <<~HELP
        Create a sample memex project and a sample repository with an issue. Add the issue to the memex project, switch it's status and remove it.
        HELP
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa
        org = Seeds::Objects::Organization.github

        memex_project = Seeds::Objects::MemexProject.create owner: mona
        memex_project.save!

        sample_repo = Seeds::Objects::Repository.create owner_name: mona, setup_master: true, is_public: true

        issue = Seeds::Objects::Issue.create(
          repo: sample_repo,
          actor: mona,
          title: "First issue",
        )

        memex_project_item = Seeds::Objects::MemexProjectItem.create_issue_or_pull(
          memex_project: memex_project,
          issue_or_pull: issue
        )

        status_column = memex_project.status_column
        status_column_options = status_column.settings["options"]

        memex_project.columns.each do |column|
          memex_project.update_column(column, visible: true)
        end

        # ensure status isn't null.
        status = status_column_options[0]
        memex_project_item.set_column_value(status_column, status["id"], mona)

        # change the status
        previous_status = status
        status = status_column_options[1]
        memex_project_item.set_column_value(status_column, status["id"], mona)
        memex_project_item.save!

        memex_project_item_id = memex_project_item.id
        memex_project_item.destroy!

        issue
      end
    end
  end
end
