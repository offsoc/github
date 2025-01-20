# frozen_string_literal: true

require_relative "../runner"

class Seeds::Runner::ModelsForLoad < Seeds::Runner
  class << self # rubocop:disable Style/ClassMethodsDefinitions
    USER_COUNT = 10
    COMMENTS_PER_ISSUE = 10
    LABELS_PER_ITEM = 3
    ASSIGNEES_PER_ITEM = 3
    STARTING_COMMITS_PER_PR = 5
    REVIEWS_PER_PR = 3

    def help
      <<~HELP
      Create seed data to help with load testing.
      HELP
    end

    def run(options = {})
      prs_and_issues_per_user = options[:count] || 10

      organization = Seeds::Objects::Organization.create(
        login: Faker::Internet.slug(glue: "-"),
        admin: Seeds::Objects::User.monalisa
      )

      puts "Created organization #{organization}"

      team = Seeds::Objects::Team.create!(org: organization)

      puts "Created team #{team}"

      repo = Seeds::Objects::Repository.create(
        owner_name: organization.login,
        repo_name: "foo",
        setup_master: true
      )

      puts "Created repository #{repo}"

      # 60% of PRs will be merged, 20% closed without merge, 20% still open.
      pr_possible_states = [:merged, :merged, :merged, :closed, :open]

      # 80% of issues will be closed, 20% open.
      issue_possible_states = [:closed, :closed, :closed, :closed, :open]

      USER_COUNT.times do |c|
        user = Seeds::Objects::User.create(
          login: "user-#{c}",
          email: Faker::Internet.unique.email
        )

        organization.add_member(user)
        team.add_member(user)

        puts "Created user #{user} and added it to organization #{organization} and team #{team}"
      end

      team.members.each do |user|
        puts "Creating #{prs_and_issues_per_user} issues and PRs for user #{user}"

        commit = {}

        prs_and_issues_per_user.times do |_c|
          STARTING_COMMITS_PER_PR.times do |n|
            commit = Seeds::Objects::Commit.create(
              repo: repo,
              committer: user,
              message: "test message #{n}",
              files: { "File.md" => Faker::Lorem.sentence }
            )
          end

          issue_for_pr = Seeds::Objects::Issue.create(
            repo: repo,
            actor: user,
            title: "New Pull Request",
            labels: repo.labels.take(LABELS_PER_ITEM),
            assignees: team.members.take(ASSIGNEES_PER_ITEM)
          )

          COMMENTS_PER_ISSUE.times do
            Seeds::Objects::IssueComment.create(
              issue: issue_for_pr,
              user: team.members.sample,
              body: Faker::Lorem.paragraph
            )
          end

          pr = Seeds::Objects::PullRequest.create(
            repo: repo,
            committer: user,
            commit: commit,
            issue: issue_for_pr
          )

          puts "Created PR #{pr.number}"

          user_ids = team.member_ids - [user.id]

          REVIEWS_PER_PR.times do
            other_user = ::User.find(user_ids.sample) if user_ids.any?

            review = Seeds::Objects::PullRequestReview.create(
              pull_request: pr,
              user: other_user
            )
          end

          case pr_possible_states.sample
          when :merged
            pr.merge(user)
          when :closed
            pr.close
          end

          issue = Seeds::Objects::Issue.create(
            repo: repo,
            actor: user,
            labels: repo.labels.take(LABELS_PER_ITEM),
            assignees: team.members.take(ASSIGNEES_PER_ITEM)
          )

          COMMENTS_PER_ISSUE.times do
            Seeds::Objects::IssueComment.create(
              issue: issue,
              user: user,
              body: Faker::Lorem.paragraph
            )
          end

          if issue_possible_states.sample == :closed
            issue.close!
          end

          puts "Created issue #{issue.number}"
        end
      end

      puts "Completed data generation!"
    end
  end
end
