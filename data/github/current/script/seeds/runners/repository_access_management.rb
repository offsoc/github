# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

# This runner is intended to assist with development of the repository
# access management refactor. Groups of direct members, outside collaborators
# and teams are created and added to the repository to enable front end
# development
module Seeds
  class Runner
    class RepositoryAccessManagement < Seeds::Runner
      def self.help
        <<~EOF
        Seed repository access management for local development
        Seeding
        - Enables the feature flag
        - Ensures github org exists
        - Ensures a sample repository exists
        - Adds 10 direct users to the repository
        - Adds 10 outside collaborators to the repository
        - Create teams with each access level (to help test filtering)
        - If enabled, invites 10 invitees to the repository
        EOF
      end

      def self.run(options = {})
        puts "Enabling feature flag"
        Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "repository_access_management")

        mona = Seeds::Objects::User.monalisa
        org = Seeds::Objects::Organization.github(admin: mona)
        repo = Seeds::Objects::Repository.hub_repo
        puts "Created repository #{repo.nwo}"

        # Create bulk users, teams and invitees to help test pagination and filters
        # Create org members and add them directly to the repository
        (1..10).each do |user_num|
          direct_user = Seeds::Objects::User.create(login: "direct-user-#{user_num}")
          org.add_member direct_user
          repo.add_member direct_user
          puts "Created direct user #{direct_user.login} and added them to org #{org.name} and #{repo.nwo}"
        end

        # Create outside collaborators and add them to the repository
        (1..10).each do |user_num|
          outside_collaborator = Seeds::Objects::User.create(login: "outside-user-#{user_num}")
          repo.add_member outside_collaborator
          puts "Created outside collaborator #{outside_collaborator.login} and added them to #{repo.nwo}"
        end

        # Create teams with each access level
        roles = [:pull, :push, :admin, :triage, :maintain]
        roles.each do |team_role|
          team = Seeds::Objects::Team.create!(org: org, name: "team-#{team_role}")
          team.add_repository repo, team_role
          puts "Created team #{team.slug} and added it to #{repo.nwo}"
        end

        # Create pending invitations
        if GitHub.repo_invites_enabled?
          (1..10).each do |invite_num|
            invitee = Seeds::Objects::User.create(login: "invited-user-#{invite_num}")
            repository_invite = Seeds::Objects::RepositoryInvitation.create(repository: repo, inviter: mona, invitee: invitee, action: :pull)
            puts "Invited user #{invitee.login} to repository #{repo.nwo}"
          end
        end

        # Create user owned repository
        user_repo = Seeds::Objects::Repository.create(owner_name: mona.login, repo_name: "repo_access", setup_master: false)
        # Add outside collaborator
        outside_collaborator = Seeds::Objects::User.create(login: "outside-user")
        user_repo.add_member outside_collaborator

        custom_org_role = Seeds::Objects::Role::create(org: org, name: "custom-org-role", target_type: "Organization", permissions: %w[read_audit_logs manage_organization_webhooks])
        puts "Created custom org role #{custom_org_role.name}."

        custom_org_role_user = Seeds::Objects::User.create(login: "org-role-user")
        org.add_member custom_org_role_user
        org.grant_org_role(assignee: custom_org_role_user, role: custom_org_role)
        puts "Created user #{custom_org_role_user.login} and assigned #{custom_org_role.name} to it."

        # don't create an additional business in single business environments
        Seeds::Objects::Business.create(name: "another business") unless GitHub.global_business.present?
      end
    end
  end
end
