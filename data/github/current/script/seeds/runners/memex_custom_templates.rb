# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.
# to run this file: bin/seed memex_custom_templates
module Seeds
  class Runner
    class MemexCustomTemplates < Seeds::Runner
      def self.help
        <<~HELP
        Create Memex Projects that are custom templates
        HELP
      end

      def self.run(options = {})
        puts "Creating a table template containing draft issues and custom columns"
        Seeds::Objects::MemexProject.create(public: true).tap do |project|
          # creating and selecting columns
          Seeds::Objects::MemexProjectColumn.create_non_default_columns(memex_project: project)
          select_columns = project.memex_project_columns.single_select
          status_column = project.status_column
          custom_column = select_columns.where.not(name: "Status").first
          columns_order = project.memex_project_views.first.visible_fields
          new_columns_order = columns_order.insert(2, columns_order.delete_at(columns_order.index(custom_column.id)))

          # creating and updating views
          project.memex_project_views.first.update(
            name: "By #{custom_column.name}",
            layout: "table_layout",
            group_by: [custom_column.id],
            visible_fields: new_columns_order
          )
          new_view = project.memex_project_views.build(
            name: "By #{status_column.name}",
            layout: "table_layout",
            group_by: [status_column.id],
            creator: project.creator
          )
          project.save_view_with_priority!(new_view)

          # creating and updating draft issues
          draft_issues = create_draft_issues(project)
          add_issue_to_column(draft_issues, custom_column)
          add_issue_to_column(draft_issues, status_column)

          # making project a template
          project.create_template!
        end

        puts "Creating a board template containing draft issues and all default workflows"
        Seeds::Objects::MemexProject.create.tap do |project|
          # making board view
          project.memex_project_views.first.update(name: "Kanban Board", layout: "board_layout")

          # creating and updating draft issues
          status_column = project.status_column
          draft_issues = create_draft_issues(project)
          add_issue_to_column(draft_issues, status_column)

          # add workflows
          Seeds::Objects::MemexProjectWorkflow.add_all_default_workflows(memex_project: project)

          # making project a template
          project.create_template!
        end

        puts "Creating a roadmap template containing draft issues and outside collaborator"
        Seeds::Objects::MemexProject.create.tap do |project|
          # making roadmap view
          project.memex_project_views.first.update(name: "Project Roadmap", layout: "roadmap_layout")

          # creating draft issues
          create_draft_issues(project)

          # add outside collaborator
          collaborator = Seeds::Objects::User.collaborator
          project.grant_role(collaborator, Role.project_writer_role)

          # making project a template
          project.create_template!
        end
      end

      def self.create_draft_issues(project)
        draft_issues = []
        3.times do |index|
          draft_issues << Seeds::Objects::MemexProjectItem.create_draft_issue(
            memex_project: project,
            title: "task #{index}"
          )
        end
        draft_issues
      end

      def self.add_issue_to_column(issues, column)
        issues.each_with_index do |issue, index|
          attributes = {
            memex_project_column: column,
            creator: issue.creator
          }

          # single_select column with 3 options
          if column.settings&.has_key?("options") && column.settings["options"][index]
            attributes.merge!({ value: column.settings["options"][index]["id"] })
          end

          issue.memex_project_column_values.create!(attributes)
        end
      end
    end
  end
end
