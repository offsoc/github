# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Notifications < Seeds::Runner

      def self.help
        <<~HELP
          Enable web notifications for monalisa and creates all notifications for them.
          By virtue of the fact that notifications are triggered by other products, this will create
          a lot of objects in your development database for other products such as actions / security vulns etc.
          Sometimes this is OK and exactly what you want. However, if you are looking for something a little lighter
          which simply creates a few of the most common notifications for a user, you can use the `bin/seed web_notifications` command instead.

          Usage: bin/seed notifications
        HELP
      end

      def self.run(options = {})
        require_relative "../../create-launch-github-app"
        require_relative "./actions"
        require_relative "./gate_requests"
        require_relative "./vulnerabilities"

        ######################## FIXTURES ########################

        # monalisa is the user we will create notifications for
        mona = ::Seeds::Objects::User.monalisa

        puts "Enabling web notifications for #{mona}..."
        GitHub.newsies.get_and_update_settings(mona) do |settings|
          settings.auto_subscribe_repositories = true
          settings.participating_web = true
          settings.subscribed_web = true
          settings.vulnerability_web = true
          settings.continuous_integration_web = true
        end

        # Use the hub repo for all the notifications
        hub_repo = Seeds::Objects::Repository.hub_repo
        # Watch repo with mona so that we don't need to manually subscribe to notifications
        mona.watch_repo(hub_repo)

        # Create admin as the user who will create the notifications
        collaborator = ::Seeds::Objects::User.create(login: "collaborator", email: "collaborator@github.com")

        org = hub_repo.owner
        org.add_admin(collaborator, adder: mona)

        # Create team and add mona + collaborator to it so that we can create notifications for team discussions
        team = ::Team.find_by(name: "Employees", organization: hub_repo.owner)
        team.add_member(mona)
        team.add_member(collaborator)

        ######################## CREATE NOTIFICATIONS ########################

        ######################## Repository invitation ########################
        puts "Creating repository invitation notification for #{mona}..."
        inviter = ::Seeds::Objects::User.create(login: "inviter", email: "inviter@github.com")
        invitation_repository = ::Seeds::Objects::Repository.create_with_nwo(
          nwo: "#{inviter}/invitation-repo",
          setup_master: true,
          is_public: false
        )
        ::RepositoryInvitation.find_by(repository: invitation_repository, invitee: mona).try(:destroy)
        ::Seeds::Objects::RepositoryInvitation.create(repository: invitation_repository, invitee: mona, inviter: inviter)

        ######################## Release ########################
        puts "Creating release notification for #{mona}..."
        ::Seeds::Objects::Release.create(
          repo: hub_repo,
          tag_name: "v#{Faker::Number.number(digits: 10)}.#{Faker::Number.number(digits: 10)}.#{Faker::Number.number(digits: 10)}",
          name: Faker::Hacker.say_something_smart,
          release_author: collaborator
        )

        ######################## Gist ########################
        puts "Creating gist notification for #{mona}..."
        gist = Seeds::Objects::Gist.create(user: mona, contents: [{ name: "README.md", value: "This is a comment gist" }])
        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          5.times do |i|
            Seeds::Objects::GistComment.create(user: collaborator, gist: gist, body: "Comment #{i}")
          end
        end

        ######################## Issue ########################
        puts "Creating Issue notification for #{mona}..."
        ::Seeds::Objects::Issue.create(repo: hub_repo, actor: collaborator)

        ######################## Pull Request ########################
        puts "Creating Pull Request notification for #{mona}..."
        pull = ::Seeds::Objects::PullRequest.create(
          base_ref: hub_repo.default_branch_ref,
          committer: collaborator,
          is_draft: false,
          repo: hub_repo,
          reviewer_user_ids: [],
          reviewer_team_ids: [],
          title: Faker::Hacker.say_something_smart
        )

        ######################## Commit Comment ########################
        puts "Creating commit comment notification for #{mona}..."
        ::Seeds::Objects::CommitComment.create(repo: hub_repo, user: collaborator)

        ######################## Discussion ########################
        puts "Creating discussion notification for #{mona}..."
        hub_repo.turn_on_discussions(actor: mona)
        ::Seeds::Objects::Discussion.create(repo: hub_repo, user: collaborator)

        ######################## Repository Advisory ########################
        puts "Creating repository advisory notification for #{mona}..."
        repository_advisory = Seeds::Objects::RepositoryAdvisory.create(repo: hub_repo, user: collaborator)

        ######################## Advisory Credit ########################
        puts "Creating advisory credit notification for #{mona}..."
        ::Seeds::Objects::AdvisoryCredit.create(repository_advisory: repository_advisory, recipient: mona, creator: collaborator)

        ######################## Team Discussion ########################
        puts "Creating team discussion notification for #{mona}..."
        ::Seeds::Objects::DiscussionPost.create(user: collaborator, team: team)

        ######################## Check Suite ########################
        puts "Creating check suite notification(s) for #{mona}..."
        ::Seeds::Runner::Actions.run

        ######################## Workflow Run ########################
        puts "Creating workflow run notification(s) for #{mona}..."
        ::Seeds::Runner::GateRequests.run

        ######################## Vulnerability alerts ########################
        puts "Creating vulnerability alert notification(s) for #{mona}..."
        ::Seeds::Runner::Vulnerabilities.run
      end
    end
  end
end
