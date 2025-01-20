# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class WebNotifications < Seeds::Runner
      DEFAULT_USER_NAME = "monalisa"
      DEFAULT_REPO_NAME = "smile"
      DEFAULT_NWO = "#{DEFAULT_USER_NAME}/#{DEFAULT_REPO_NAME}"
      COLLABORATOR_USER_NAME = "collaborator"
      DEFAULT_ISSUE_NOTIFICATION_COUNT = 1
      DEFAULT_PR_NOTIFICATION_COUNT = 1
      DEFAULT_DISCUSSION_NOTIFICATION_COUNT = 1
      DEFAULT_COMMIT_NOTIFICATION_COUNT = 1

      def self.help
        <<~HELP
        Enables and creates web notifications for the given user, with options to specify the number
        and type of notifications to create.

        - Ensures given test user exists (defaults to "#{DEFAULT_USER_NAME}")
        - Ensures given repo exists (defaults to "#{DEFAULT_NWO}")
        - Can create any number issue, pull request, and discussion notifications (including zero, if specified).

        Options:
          -author, -u
           String name of the pull request author. Defaults to "#{DEFAULT_USER_NAME}".

          -nwo, -r
           String "name with owner" of the pull request base repository. Defaults to "#{DEFAULT_NWO}".

          -issue_notification_count
           Integer number of issue notifications to create. Defaults to #{DEFAULT_ISSUE_NOTIFICATION_COUNT}.
           Will create an equivalent number of issues (one per notification).

          -pr_notification_count
           Integer number of PR notifications to create. Defaults to #{DEFAULT_PR_NOTIFICATION_COUNT}.
           Will create an equivalent number of PRs (one per notification).

          -discussion_notification_count
           Integer number of discussion notifications to create. Defaults to #{DEFAULT_DISCUSSION_NOTIFICATION_COUNT}.
           Will create an equivalent number of discussions (one per notification).

          -commit_notification_count
           Integer number of commit notifications to create. Defaults to #{DEFAULT_COMMIT_NOTIFICATION_COUNT}.
           Will create an equivalent number of commits (one per notification).
        HELP
      end

      def self.run(options = {})
        user_login = options[:user] || DEFAULT_USER_NAME
        puts "Finding or creating user #{user_login}..."
        user = Seeds::Objects::User.create(login: user_login)

        nwo = options[:nwo] || "#{user_login}/#{DEFAULT_REPO_NAME}"
        puts "Finding or creating repo #{nwo}..."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: nwo, setup_master: true)

        unless repo.members.include?(user)
          puts "Adding #{user} to repo as member with write permissions..."
          repo.add_member(user)
        end

        collaborator_login = COLLABORATOR_USER_NAME
        puts "Finding or creating collaborator #{collaborator_login}..."
        collaborator = Seeds::Objects::User.create(login: collaborator_login)

        unless repo.members.include?(collaborator)
          puts "Adding collaborator to repo as member with write permissions..."
          repo.add_member(collaborator)
        end

        puts "Enabling web notifications for #{user_login}..."
        GitHub.newsies.get_and_update_settings(user) do |settings|
          settings.auto_subscribe_repositories = true
          settings.participating_web = true
          settings.subscribed_web = true
          settings.vulnerability_web = true
          settings.continuous_integration_web = true
        end

        issue_notification_count = options[:issue_notification_count] || DEFAULT_ISSUE_NOTIFICATION_COUNT
        issue_notification_count.times do |i|
          count = i + 1
          puts "Creating issue notification #{count} of #{issue_notification_count}..."
          issue = Seeds::Objects::Issue.create(
            repo: repo,
            actor: user,
            title: "Issue: #{Faker::Lorem.question}"
          )
          Seeds::Objects::IssueComment.create(
            issue: issue,
            user: collaborator,
            body: "@#{user_login} #{Faker::Lorem.sentence}"
          )
        end

        pr_notification_count = options[:pr_notification_count] || DEFAULT_PR_NOTIFICATION_COUNT
        pr_notification_count.times do |i|
          count = i + 1
          puts "Creating pr notification #{count} of #{pr_notification_count}..."
          pull = Seeds::Objects::PullRequest.create(
            repo: repo,
            committer: user,
            title: "[bugfix] #{Faker::Lorem.sentence}"
          )
          Seeds::Objects::IssueComment.create(
            issue: pull.issue,
            user: collaborator,
            body: "@#{user_login} #{Faker::Lorem.sentence}"
          )
        end

        discussion_notification_count = options[:discussion_notification_count] || DEFAULT_DISCUSSION_NOTIFICATION_COUNT
        repo.turn_on_discussions(actor: repo.owner, instrument: false) if discussion_notification_count > 0
        discussion_notification_count.times do |i|
          count = i + 1
          puts "Creating discussion notification #{count} of #{discussion_notification_count}..."
          discussion = ::Discussion.create!(
            repository: repo,
            user: user,
            title: "Discussion: #{Faker::Lorem.question}",
            body: Faker::Lorem.paragraphs(number: 1 + rand(2)).join("\n\n"),
            category: repo.discussion_categories.last
          )
          ::DiscussionComment.create!(
            discussion: discussion,
            user: collaborator,
            body: "@#{user_login} #{Faker::Lorem.sentence}",
          )
        end

        commit_notification_count = options[:commit_notification_count] || DEFAULT_COMMIT_NOTIFICATION_COUNT
        commit_notification_count.times do |i|
          count = i + 1
          puts "Creating commit notification #{count} of #{commit_notification_count}..."
          commit = Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: {
              "commit-notification.txt" => Faker::Lorem.paragraph(sentence_count: 20)
            },
            message: Faker::Lorem.sentence,
          )
          ::CommitComment.create!(
            repository: repo,
            user: collaborator,
            commit_id: commit.oid,
            body: "@#{user_login} #{Faker::Lorem.sentence}"
          )
        end

        puts "Done!"
      end
    end
  end
end
