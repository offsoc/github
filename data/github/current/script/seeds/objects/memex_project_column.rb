# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MemexProjectColumn
      def self.create_non_default_columns(memex_project:)
        Seeds::Objects::MemexProjectColumn.create_text_column(memex_project: memex_project)
        Seeds::Objects::MemexProjectColumn.create_number_column(memex_project: memex_project)
        Seeds::Objects::MemexProjectColumn.create_date_column(memex_project: memex_project)
        Seeds::Objects::MemexProjectColumn.create_single_select_column(memex_project: memex_project)
        Seeds::Objects::MemexProjectColumn.create_iteration_column(memex_project: memex_project)

        memex_project.columns.each { |column| memex_project.default_view.make_column_visible!(column) }
      end

      def self.create_text_column(
        creator: Seeds::Objects::User.monalisa,
        name: Faker::Lorem.unique.word,
        memex_project: Seeds::Objects::MemexProject.create
      )
        memex_project.add_user_defined_column(
          name: name,
          data_type: "text",
          position: memex_project.columns.count + 1,
          creator: creator,
        )
      end

      def self.create_number_column(
        creator: Seeds::Objects::User.monalisa,
        name: Faker::Lorem.unique.word,
        memex_project: Seeds::Objects::MemexProject.create
      )
        memex_project.add_user_defined_column(
          name: name,
          data_type: "number",
          position: memex_project.columns.count + 1,
          creator: creator,
        )
      end

      def self.create_date_column(
        creator: Seeds::Objects::User.monalisa,
        name: Faker::Lorem.unique.word,
        memex_project: Seeds::Objects::MemexProject.create
      )
        memex_project.add_user_defined_column(
          name: name,
          data_type: "date",
          position: memex_project.columns.count + 1,
          creator: creator,
        )
      end

      def self.create_single_select_column(
        creator: Seeds::Objects::User.monalisa,
        name: Faker::Lorem.unique.word,
        memex_project: Seeds::Objects::MemexProject.create
      )
        memex_project.add_user_defined_column(
          name: name,
          data_type: "single_select",
          position: memex_project.columns.count + 1,
          creator: creator,
          settings: {
            "options" => [
              { name: "small", color: "GREEN", description: "small" },
              { name: "medium", color: "YELLOW", description: "Medium" },
              { name: "large", color: "RED", description: "LARGE" },
            ]
          }
        )
      end

      def self.create_iteration_column(
        creator: Seeds::Objects::User.monalisa,
        name: Faker::Lorem.unique.word,
        memex_project: Seeds::Objects::MemexProject.create
      )
        memex_project.add_user_defined_column(
          name: name,
          data_type: "iteration",
          position: memex_project.columns.count + 1,
          creator: creator,
          settings: {
            configuration: {
              start_day: 1,
              duration: 7,
              iterations: [
                {
                  start_date: Date.today.at_beginning_of_week.iso8601,
                  duration: 7,
                  title: "Sprint 1"
                },
                {
                  start_date: (Date.today.at_end_of_week + 1).iso8601,
                  duration: 7,
                  title: "Sprint 2"
                },
              ]
            }
          }
        )
      end
    end
  end
end
