# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SubIssue < Seeds::Runner
      DEFAULT_REPO_NAME = "github"
      DEFAULT_COUNT = 5
      DEFAULT_NESTED_LEVELS_COUNT = 4

      def self.help
        <<~HELP
        Create seed data for sub-issues
        HELP
      end

      def self.mona
        Seeds::Objects::User.monalisa
      end

      def self.run(options = {})
        require "ruby-progressbar"

        repo_name = options[:repo_name] || DEFAULT_REPO_NAME
        sub_issue_count = options[:sub_issue_count] || DEFAULT_COUNT
        nested_level_counts = options[:nested_level_count] || DEFAULT_NESTED_LEVELS_COUNT
        total_issue_count = T.let(sub_issue_count * nested_level_counts, Integer)

        # Watch out for the 👻s
        # Eat all the 🍒 🍓 🍊 🍋 🍍 🍇 🍉 🍌 🍐 🍎 🍏 🍑 🍈 🍒 🍓 🍊 🍋 🍍 🍇 🍉 🍌 🍐 🍎 🍏 🍑 🍈
        progress = ProgressBar.create(
          title: "creating sub-issues",
          total: total_issue_count,
          format: "%a %b\u{15E7}%i %p%% %t",
          progress_mark: " ",
          remainder_mark: "\u{FF65}",
        ) if Rails.env.development? # let's not spam in test

        repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: repo_name,
          setup_master: true,
          # As of June 2024, sub-issues is in a private alpha state, so it is disabled for public resources
          # like repositories and projects, so we need to make a private repository to use it.
          is_public: false
        )

        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          Issue.transaction do
            parent = Seeds::Objects::Issue.create(
              repo: repo,
              actor: self.mona,
              title: Faker::Book.title,
              body: Faker::Book.title,
            )

            # A list to store all sub_issues at each level
            sub_issues = T.let([[parent]], T::Array[T::Array[::Issue]])

            nested_level_counts.times do |level|  # Iterate for the # of levels
              sub_issues << []  # Add a new level
              sub_issue_count.times do |i|
                progress.increment if Rails.env.development?
                sub_issue = Seeds::Objects::Issue.create(
                  repo: repo,
                  actor: self.mona,
                  title: Faker::Book.title,
                  body: "Sub-issue body level #{level + 1} issue #{i}"
                )

                # Randomly select a parent issue from the previous level
                parent_issue = sub_issues[level]&.sample

                if parent_issue.is_a?(Issue)
                  parent_issue.add_sub_issue!(sub_issue, self.mona.id)
                end

                T.must(sub_issues[level + 1]) << sub_issue  # Add the new issue to the current level
              end
            end

            puts "Created issue with sub-issues at #{parent.url}"
          end

          puts "Recalculating sub-issue lists for all issues"
          Issue.all.map(&:recalculate_sub_issue_list!)

          project = T.let(Seeds::Objects::MemexProject.create(owner: repo.owner, creator: self.mona), MemexProject)
          project.save!

          # Add 50% of issues in repository to the project, using a deterministic random seed
          issues_to_add = repo.issues.sample((0.5 * total_issue_count).ceil, random: Random.new(31415))
          issues_to_add.each do |issue|
            Seeds::Objects::MemexProjectItem.create_issue_or_pull(
              memex_project: project,
              issue_or_pull: issue
            )
          end
        end

        repo
      end
    end
  end
end
