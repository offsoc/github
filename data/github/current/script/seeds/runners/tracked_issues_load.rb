# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class TrackedIssuesLoad < Seeds::Runner
      def self.help
        <<~HELP
        Create seed data to load test Tracked Issues locally
        HELP
      end

      def self.run(options = {})
        repo_name = options[:repo_name]
        tracking_issues_count = options[:tracking_issues_count]
        tracked_issues_count = options[:tracked_issues_count]
        org = Seeds::Objects::Organization.github

        puts "Creating repository..."
        repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: repo_name,
          setup_master: true,
          is_public: true
        )

        puts "Creating issues and tracked issues..."

        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          tracking_issues_count.times do |number|
            tracking_issue = Seeds::Objects::Issue.create(
              repo: repo,
              actor: Seeds::Objects::User.monalisa,
              title: "Root issue #{number}",
              body: "This is the body of an issue which tracks #{tracked_issues_count} issues:\n\n"
            )

            tracked_issues = []
            Issue.transaction do
              tracked_issues_count.times do |tracked_issue_number|
                tracked_issues << Seeds::Objects::Issue.create(
                  repo: repo,
                  actor: Seeds::Objects::User.monalisa,
                  title: "Tracked issue #{tracked_issue_number}",
                  body: "This is the body of a tracked issue #{tracked_issue_number}",
                )
              end
            end

            IssueLink.transaction do
              tracked_issues.each do |tracked_issue|
                Seeds::Objects::IssueLink.create(
                  current_issue: tracking_issue,
                  target_issue: tracked_issue,
                  repo: repo,
                  actor: Seeds::Objects::User.monalisa
                )
              end
            end

            tasks_list = tracked_issues.map { |i| "- [ ] ##{i.number}" }.join("\n")
            tracking_issue.body += tasks_list
            tracking_issue.save
          end
        end

        repo
      end
    end
  end
end
