# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MemexProjectWorkflow
      def self.add_all_default_workflows(memex_project:, creator: Seeds::Objects::User.monalisa)
        status_column = memex_project.status_column

        # default_closed_workflow_attributes is automatically created on project creation.
        # default_merged_workflow_attributes is automatically created on project creation.
        memex_project.workflows.create([
          ::MemexProjectWorkflow.default_item_added_workflow_attributes(
            status_column: status_column,
            creator: creator,
            enabled: true
          ),
          ::MemexProjectWorkflow.default_reopened_workflow_attributes(
            status_column: status_column,
            creator: creator,
            enabled: true
          ),
          ::MemexProjectWorkflow.default_review_changes_requested_workflow_attributes(
            status_column: status_column,
            creator: creator,
            enabled: true
          ),
          ::MemexProjectWorkflow.default_review_approved_workflow_attributes(
            status_column: status_column,
            creator: creator,
            enabled: true
          ),
          ::MemexProjectWorkflow.default_auto_archive_workflow_attributes(
            creator: creator,
            enabled: true
          ),
          # only creates if repository exists
          ::MemexProjectWorkflow.default_auto_add_workflow_attributes(
            creator: creator,
            enabled: true,
            repository: memex_project.owner.repositories.first
          )
        ])
      end
    end
  end
end
