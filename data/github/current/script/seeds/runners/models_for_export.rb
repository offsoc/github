# typed: true
# frozen_string_literal: true

require_relative "../runner"

class Seeds::Runner::ModelsForExport < Seeds::Runner
  def self.help
    "Seed models for an export stress test"
  end

  def self.run(options = {})
    count = options[:count] || 10
    puts "Creating #{count} of each model"

    organization = Seeds::Objects::Organization.create(
      login: "acme",
      admin: Seeds::Objects::User.monalisa
    )

    # One team for every ten users.
    (count.to_f / 10).ceil.times do
      Seeds::Objects::Team.create!(org: organization)
    end

    repo = Seeds::Objects::Repository.create(
      owner_name: organization.login,
      repo_name: "widgets",
      setup_master: true
    )

    # 60% of PRs will be merged, 20% closed without merge, 20% still open.
    pr_possible_states = [:merged, :merged, :merged, :closed, :open]

    # 80% of issues will be closed, 20% open.
    issue_possible_states = [:closed, :closed, :closed, :closed, :open]

    count.times do
      user = Seeds::Objects::User.create(
        login: Seeds::DataHelper.random_username,
        email: Seeds::DataHelper.random_email
      )

      organization.add_member(user)

      Team.all.sample.add_member(user)

      5.times do
        commit = Seeds::Objects::Commit.create(
          repo: repo,
          committer: user,
          message: Faker::Lorem.sentence,
          files: { "File.md" => Faker::Lorem.sentence }
        )

        pr = Seeds::Objects::PullRequest.create(
          repo: repo,
          committer: user,
          commit: commit
        )

        user_ids = repo.all_user_ids(include_child_teams: true) - [user.id]

        other_user = ::User.find(user_ids.sample) if user_ids.any?

        if other_user
          ::ReviewRequest.create(
            pull_request: pr,
            reviewer: other_user
          )

          review = Seeds::Objects::PullRequestReview.create(
            pull_request: pr,
            user: other_user
          )

          Seeds::Objects::PullRequestReviewComment.create(
            user: other_user,
            pull_request_review: review,
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
          title: Faker::Lorem.sentence,
          body: Faker::Lorem.paragraph
        )

        if issue_possible_states.sample == :closed
          issue.close!
        end
      end
    end
  end
end
