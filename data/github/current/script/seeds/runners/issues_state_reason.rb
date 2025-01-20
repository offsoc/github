# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class IssuesStateReason < Seeds::Runner
      def self.help
        <<~HELP
        Create sample issues with state reason to test the issue state reason in terms of UI and searching.
        Specify one or many of the following parameters:
        --number_of_open_issues N -> to create N open issues with state reason nil
        --number_of_closed_issues N -> to create N closed issues with state reason complete (nil)
        --number_of_reopened_issues N -> to create N reopened issues with state reason reopened
        --number_of_not_planned_issues N -> to create N closed issues with state reason not planned
        HELP
      end

      def self.run(options = {})
        number_of_open_issues = options[:number_of_open_issues]
        number_of_closed_issues = options[:number_of_closed_issues]
        number_of_reopened_issues = options[:number_of_reopened_issues]
        number_of_not_planned_issues = options[:number_of_not_planned_issues]
        number_of_issues = number_of_open_issues + number_of_closed_issues + number_of_reopened_issues + number_of_not_planned_issues

        if number_of_issues.zero?
          return
        end

        mona = Seeds::Objects::User.monalisa
        examples_repo = Seeds::Objects::Repository.create(owner_name: mona, repo_name: "Repo with issues with state reasons", setup_master: true, is_public: true)

        puts "Creating #{number_of_issues} issues..."
        seed_issues = (1..number_of_issues).map { |i| Seeds::Objects::Issue.create(
            repo: examples_repo,
            actor: mona,
            title: "Sample issue open(nil) #{i}",
          )
        }

        current_issue_counter = number_of_open_issues

        number_of_closed_issues.times do
          seed_issues[current_issue_counter].close(mona)
          seed_issues[current_issue_counter].update(title: "Sample issue closed (completed eg. nil) #{current_issue_counter}")
          current_issue_counter += 1
        end
        puts "Closed #{number_of_closed_issues} issues with the state reason complete (nil)"

        number_of_not_planned_issues.times do
          seed_issues[current_issue_counter].close(mona, attributes: { state_reason: :not_planned })
          seed_issues[current_issue_counter].update(title: "Sample issue closed (not planned) #{current_issue_counter}")
          current_issue_counter += 1
        end
        puts "Closed #{number_of_not_planned_issues} issues with the state reason not planned"

        number_of_not_planned_issues.times do
          seed_issues[current_issue_counter].close(mona)
          seed_issues[current_issue_counter].open(mona, { state_reason: :reopened })
          seed_issues[current_issue_counter].update(title: "Sample issue open (reopened) #{current_issue_counter}")
          current_issue_counter += 1
        end
        puts "Reopened #{number_of_not_planned_issues} issues with the state reason reopened"
      end
    end
  end
end
