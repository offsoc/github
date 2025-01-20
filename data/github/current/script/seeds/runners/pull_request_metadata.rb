# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class PullRequestMetadata < Seeds::Runner
      def self.help
        <<~HELP
        Seed pull request metadata for local development.

        Creates two projects:
          - One belonging to pull request default author (user-owned)
          - One belonging to pull request default organization (org-owned)
        HELP
      end

      def self.run(options = {})
        require_relative "./pull_requests"
        # Ensure PR author exists
        author_login = Seeds::Runner::PullRequests::DEFAULT_AUTHOR
        puts "Finding or creating PR author #{author_login}..."
        author = Seeds::Objects::User.create(login: author_login)

        org_login = Seeds::Runner::PullRequests::DEFAULT_ORG_NAME
        puts "Finding or creating PR org #{org_login}"
        org = Seeds::Objects::Organization.create(login: org_login, admin: author)

        # Add projects
        user_project = Seeds::Objects::MemexProject.create(owner: author, title: "User Project 1")
        puts "Adding user-owned project..."
        user_project.save!
        puts "Created project: #{GitHub.url}#{user_project.url}"

        org_project = Seeds::Objects::MemexProject.create(owner: org, title: "Org Project 1")
        puts "Adding user-owned project..."
        org_project.save!
        puts "Created project: #{GitHub.url}#{org_project.url}"
        puts "Done!"
      end
    end
  end
end
