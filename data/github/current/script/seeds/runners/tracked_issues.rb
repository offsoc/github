# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class TrackedIssues < Seeds::Runner
      def self.help
        <<~HELP
        Create seed data to work with Tracked Issues locally
        HELP
      end

      def self.mona
        Seeds::Objects::User.monalisa
      end

      def self.run(options = {})
        repo_name = options[:repo_name]

        Seeds::Objects::Organization.github

        puts "Creating repository..."
        repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: repo_name,
          setup_master: true,
          is_public: true
        )

        puts "Creating issues and tracked issues..."
        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          issue_without_tracked_issues = Seeds::Objects::Issue.create(
            repo: repo,
            actor: self.mona,
            title: "Issue without tracked issues",
            body: "This is the body of an issue without a tasks list"
          )

          issue_with_three_tracked_issues = Seeds::Objects::Issue.create(
            repo: repo,
            actor: self.mona,
            title: "Issue with 3 tracked issues",
            body: "This is the body of an issue containing task list with 3 issues:\n\n"
          )

          tracked_issues = []
          3.times do |i|
            tracked_issues << Seeds::Objects::Issue.create(
              repo: repo,
              actor: self.mona,
              title: "Tracked issue #{i}",
              body: "This is the body of a tracked issue #{i}",
            )
          end

          tracked_issues.each do |tracked_issue|
            Seeds::Objects::IssueLink.create(
              current_issue: issue_with_three_tracked_issues,
              target_issue: tracked_issue,
              repo: repo,
              actor: self.mona
            )
          end

          tasks_list = tracked_issues.map { |i| "- [ ] ##{i.number}" }.join("\n")
          issue_with_three_tracked_issues.body += tasks_list
          issue_with_three_tracked_issues.save
          issue_with_three_tracked_issues
        end
      end
    end
  end
end
