# typed: true
# frozen_string_literal: true

require_relative "../runner"
require_relative "example_repos"
require_relative "issues_for_repo"
require_relative "repo_pull_request_reviews"
require_relative "repo_pull_requests_from_commits"
require_relative "github_repo"
require_relative "complex_featured_topics"
require_relative "generate_labels"
require_relative "discussions"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class TeamReposPilot < Seeds::Runner
      DEFAULT_DISCUSSION_COUNT = 15
      DEFAULT_ISSUE_COUNT = 35
      DEFAULT_LABEL_COUNT = 50
      DEFAULT_PR_COUNT = 20
      DEFAULT_RAND_SEED_VALUE = 94107
      DEFAULT_TOPIC_COUNT = 20

      def self.help
        <<~HELP
        Optionated runner that sets up seed data for repos, commits, issues, users, prs and discussions.
        For more info see: https://github.com/github/test-platform/issues/156
        HELP
      end

      def self.run(options = {})
        require "pp"

        # Commit count is 0 because example repos used in this repos runner already contain random commits.
        topic_count = options[:topic_count] || DEFAULT_TOPIC_COUNT
        label_count = options[:label_count] || DEFAULT_LABEL_COUNT
        issue_count = options[:issue_count] || DEFAULT_ISSUE_COUNT
        issue_linked_max = options[:issue_linked_max] || (issue_count / 2.0).ceil
        issue_comment_max = options[:issue_comment_max] || (issue_count / 4.0).ceil
        issue_commit_reference_max = options[:issue_commit_reference_max] || (issue_count / 6.0).ceil

        discussion_count = options[:discussion_count] || DEFAULT_DISCUSSION_COUNT
        commit_count = options[:commit_count] || 0
        pr_count = options[:pr_count] || DEFAULT_PR_COUNT

        # Note: The seed value isn't supported in every runner. We can consider adding it to more runners if needed
        seed = options[:seed] || DEFAULT_RAND_SEED_VALUE

        options = {
          commit_count: commit_count,
          discussion_count: discussion_count,
          issue_count: issue_count,
          issue_linked_max: issue_linked_max,
          issue_comment_max: issue_comment_max,
          issue_commit_reference_max: issue_commit_reference_max,
          label_count: label_count,
          pr_count: pr_count,
          seed: seed,
          topic_count: topic_count,
        }

        puts "-> Generating seed data with the following options:"

        puts
        PP.pp(options, $>, 40)
        puts

        repos = Seeds::Runner::ExampleRepos.execute(
          commit_count: commit_count,
          import_users: true
        )

        repos.each do |repo|
          puts
          Seeds::Runner::GenerateLabels.execute(
            nwo: repo.nwo,
            label_count: label_count
          )

          Seeds::Runner::ComplexFeaturedTopics.execute(
            nwo: repo.nwo,
            topics_to_add: topic_count
          )

          issues = Seeds::Runner::IssuesForRepo.execute(
            nwo: repo.nwo,
            count: issue_count,
            seed: seed,
            labels: repo.labels.pluck(:name).join(","),
            linked_issue_max: issue_linked_max,
            issue_comment_max: issue_comment_max,
            commit_reference_max: issue_commit_reference_max,
          )

          Seeds::Runner::RepoPullRequestsFromCommits.execute(
            nwo: repo.nwo,
            limit: pr_count
          )

          Seeds::Runner::RepoPullRequestReviews.execute(
            nwo: repo.nwo
          )

          Seeds::Runner::Discussions.execute({
            "repo" => repo.nwo,
            "discussion-count" => discussion_count,
            "convert-issues" => true,
            "link-issues" => true,
            "participant-count" => 10,
            "refer-in-issues-prs" => true,
          })

          puts "-> Done with #{repo.nwo}"
        end
      end
    end
  end
end
