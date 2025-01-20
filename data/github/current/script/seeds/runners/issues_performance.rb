# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds

  class Runner
    class IssuesPerformance < Seeds::Runner
      def self.help
        <<~HELP
        Create seed data to help investigate performance of Issues#show.
        Specify one or many of the following parameters:
        --cross_references_count N -> to create N cross references
        --commit_events_count N -> to create N commit events
        --email_comments_count N -> to create N email comments
        --members_count N -> to create N members within the test organization
        --commit_events_count N  --repositories_count M -> to create N commits to M repositories that reference a issue
        HELP
      end

      def self.mona
        Seeds::Objects::User.monalisa
      end

      def self.run(options = {})
        if options.empty?
          puts help
          return
        end
        cross_references_count = options[:cross_references_count]
        commit_events_count = options[:commit_events_count]
        email_comments_count = options[:email_comments_count]
        comments_count = options[:comments_count]
        members_count = options[:members_count]
        repositories_count = options[:repositories_count]

        org = Seeds::Objects::Organization.github
        repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: "github/issues_performance",
          setup_master: true,
          is_public: true
        )

        create_issue_with_cross_references(repo, cross_references_count) if param_provided?(cross_references_count) && !param_provided?(repositories_count)
        create_issue_with_commit_events(repo, commit_events_count) if param_provided?(commit_events_count)
        create_issue_with_comments(repo, comments_count) if param_provided?(comments_count)
        create_issue_with_email_comments(repo, email_comments_count) if param_provided?(email_comments_count)
        create_many_members(org, members_count) if param_provided?(members_count)
        create_issues_with_commit_events_from_many_repositories(repo, commit_events_count, repositories_count) if param_provided?(commit_events_count) && param_provided?(repositories_count)
      end

      def self.create_issue_with_cross_references(repo, number_of_cross_references)
        collaborator = Seeds::Objects::User.create(login: "collaborator")

        issue = Seeds::Objects::Issue.create(
          repo: repo,
          actor: self.mona,
          title: "Many cross-references with task lists",
          body: "Cross-references to issues with tasks lists can be very expensive. Each cross-referenced issue is loaded"\
            " and parsed to count the number of tasks. See https://github.com/github/issues/issues/686 for details."
        )

        number_of_cross_references.times do |index|
          # We need to alternate the actor to avoid event rollup. Tasks won't be rendered for rolled up events.
          actor = index.even? ? self.mona : collaborator

          task_list = rand(10).times.map { "- [#{rand(2) == 1 ? 'x' : ' '}] #{Faker::Lorem.sentence}" }.join("\n")
          issue_with_tasks = Seeds::Objects::Issue.create(
            repo: repo,
            actor: actor,
            title: "Task list #{index + 1}",
            body: "\##{issue.number}\n#{task_list}",
            state: "closed" # create as 'closed' to avoid visual clutter in issues#index
          )
        end

        puts "Created issue http://github.localhost/#{repo.nwo}/issues/#{issue.number} with #{number_of_cross_references} cross-references."
      end
    end

    def self.create_issues_with_commit_events_from_many_repositories(repo, number_of_commits, repositories_count)
      T.bind(self, T.class_of(IssuesPerformance))

      issue = Seeds::Objects::Issue.create(
        repo: repo,
        actor: self.mona,
        title: "Many referencing commits from many repositories",
        body: "Rendering issues with many referencing commits can be expensive. See https://github.com/github/issues/issues/724"\
          " and https://github.com/github/issues/issues/726 for details."
      )

      number_of_commits.times do |n|
        commit_repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: "github/issues_performance-#{rand(repositories_count)}",
          setup_master: true,
          is_public: true
        )

        message = n.even? ? "http://github.localhost/#{repo.nwo}/issues/#{issue.number} #{Faker::Lorem.sentence}" : "#{Faker::Lorem.sentence}"
        commit = Seeds::Objects::Commit.create(
          repo: commit_repo,
          committer: self.mona,
          message: message,
          files: { "File.md" => Faker::Lorem.sentence }
        )

        issue.reference_from_commit(self.mona, commit.oid, commit_repo)
      end

      puts "Created issue http://github.localhost/#{repo.nwo}/issues/#{issue.number} with #{number_of_commits} commit events."
    end

    def self.create_issue_with_commit_events(repo, number_of_commits)
      T.bind(self, T.class_of(IssuesPerformance))

      issue = Seeds::Objects::Issue.create(
        repo: repo,
        actor: self.mona,
        title: "Many referencing commits",
        body: "Rendering issues with many referencing commits can be expensive. See https://github.com/github/issues/issues/724"\
          " and https://github.com/github/issues/issues/726 for details."
      )

      number_of_commits.times do
        commit = Seeds::Objects::Commit.create(
          repo: repo,
          committer: self.mona,
          message: "\##{issue.number} #{Faker::Lorem.sentence}",
          files: { "File.md" => Faker::Lorem.sentence }
        )

        issue.reference_from_commit(self.mona, commit.oid)
      end

      puts "Created issue http://github.localhost/#{repo.nwo}/issues/#{issue.number} with #{number_of_commits} commit events."
    end

    def self.create_issue_with_comments(repo, number_of_comments)
      T.bind(self, T.class_of(IssuesPerformance))

      issue = Seeds::Objects::Issue.create(
        repo: repo,
        actor: self.mona,
        title: "Issue with #{number_of_comments} comments with",
        body: "Many comments on an issue can cause performance problems."
      )

      message = issue.body
      number_of_comments.times do |i|
        comment = ::IssueComment.create(issue: issue, body: "Comment #{i + 1}. #{Faker::Lorem.sentence}")
      end

      puts "Created issue http://github.localhost/#{repo.nwo}/issues/#{issue.number} with #{number_of_comments} comments."
    end

    def self.create_issue_with_email_comments(repo, number_of_comments)
      T.bind(self, T.class_of(IssuesPerformance))

      issue = Seeds::Objects::Issue.create(
        repo: repo,
        actor: self.mona,
        title: "Many email comments with issue mentions",
        body: "Many email comments on an issue can cause performance problems because the number of links back to the issue"\
          " grows exponentially with the number of emails. See https://github.com/github/issues/issues/713 for details."
      )

      message = issue.body
      number_of_comments.times do
        quote = self.quote_email(message + "\n\n" + self.notification_footer(issue))
        message = "#{Faker::Lorem.paragraphs.join("\n\n")}#{quote}"
        comment = ::IssueComment.create(issue: issue, body: message, formatter: :email)
      end

      puts "Created issue http://github.localhost/#{repo.nwo}/issues/#{issue.number} with #{number_of_comments} email comments."
    end

    def self.quote_email(body)
      return body if body.blank?
      "\n" + body.lines.map { |l| ">#{l}" }.join
    end

    def self.notification_footer(issue)
      " —\nYou are receiving this because you commented.\nReply to this email directly, view it on GitHub "\
      "<http://github.localhost/#{issue.repository.nwo}/issues/#{issue.number}>"
    end

    def self.create_many_members(org, number_of_members)
      number_of_members.times do |i|
        user = Seeds::Objects::User.create(login: "user#{i + 1}")
        org.add_member(user)
      end

      puts "Added #{number_of_members} members to the organization."
    end

    def self.param_provided?(param)
      !param.nil? && param > 0
    end
  end
end
