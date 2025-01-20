# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class OrganizationRoles < Seeds::Runner
      # Custom Org Roles to create
      CUSTOM_ROLES = 5
      # User to be created for and assigned to each role
      DIRECT_USERS_PER_ROLE = 10
      # Users who are directly assigned to every role. A MULTI_ROLE_USERS number of users are created and granted the roles
      MULTI_ROLE_USERS = 10

      # Teams that are assigned to every role. A TEAM_MEMBERS number of users are created and assigned to these teams
      MULTI_ROLE_TEAMS = 1
      # A list of users that are assigned to every team. Helps in viewing users who have multiple paths to a role
      MEMBERS_OF_EVERY_TEAM = 1
      # For every role one team and (TEAM_MEMBERS number of users) will be created and assigned to the role
      TEAMS_PER_ROLE = 10
      # This number of users are created for and assigned to a single team
      TEAM_MEMBERS = 10
      # Mixed users means users who have access to a role both directly and through a team
      MIXED_USERS_PER_TEAM = 1
      MIXED_USERS_PER_ROLE = 1
      def self.help
        <<~HELP
        Assign users and teams to organization roles on the default github org and enable the following feature flags:
        actions_self_hosted_settings_fgp

        To run the seed script:
          1. script/server
          2. bin/seed organization_roles.rb
        HELP
      end

      def self.run(options = {})
        puts "Enabling feature flags"
        Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "actions_self_hosted_settings_fgp")
        puts "enabled actions_self_hosted_settings_fgp"

        mona = Seeds::Objects::User.monalisa
        org = Seeds::Objects::Organization.github(admin: mona)

        org_system_roles = ::OrganizationRole.visible_preset_roles(org)

        # Create users who will be members of every team
        members_of_every_team = []
        unless MEMBERS_OF_EVERY_TEAM == 0
          MEMBERS_OF_EVERY_TEAM.times do |user_num|
            members_of_every_team << Seeds::Objects::User.create(login: "multi-team-member-#{user_num + 1 }")
            puts "Created #{MEMBERS_OF_EVERY_TEAM} users who are members of every team"
          end
        end

        # Create Teams and members that will be assigned to every custom role
        multi_role_teams = []
        MULTI_ROLE_TEAMS.times do |team_num|
          team = Seeds::Objects::Team.create!(org: org, name: "multi_role_team-#{team_num + 1}")
          puts "Created multi_role_team-#{team_num}"

          TEAM_MEMBERS.times do |user_num|
            team_member = Seeds::Objects::User.create(login: "multi-role-team-#{team_num + 1}-member-#{user_num + 1 }")
            org.add_member team_member
            team.add_member(team_member)
          end
          members_of_every_team.each { |user| team.add_member(user) }
          multi_role_teams << team
          puts "Added members to multi_role_team-#{team_num}"
        end

        multi_role_users = []
        MULTI_ROLE_USERS.times do |user_num|
          user = Seeds::Objects::User.create(login: "multi-role-user-#{user_num + 1}")
          org.add_member user
          multi_role_users << user
        end

        puts "Created #{multi_role_users.count} users who are assigned to every role"

        custom_org_roles = []
        CUSTOM_ROLES.times do |custom_org_role_num|
          # TODO randomize or otherwise change the FGP
          custom_org_role = Seeds::Objects::Role::create(org: org, name: "custom-org-role-#{custom_org_role_num + 1}",
            target_type: "Organization", permissions: %w[read_audit_logs manage_organization_webhooks])
          custom_org_roles << custom_org_role
          system_org_role = org_system_roles.sample(1).first

          # directly assign 10 users to each role
          DIRECT_USERS_PER_ROLE.times do |user_num|
            direct_user = Seeds::Objects::User.create(login: "direct-role-#{custom_org_role_num + 1}-user-#{user_num + 1}")
            org.add_member direct_user
            org.grant_org_role(assignee: direct_user, role: custom_org_role)
          end
          puts "Assigned #{DIRECT_USERS_PER_ROLE} users to custom-org-role-#{custom_org_role_num + 1}"

          # assign the multi_role_users to each role
          unless multi_role_users.empty?
            multi_role_users.each do |user|
              org.grant_org_role(assignee: user, role: custom_org_role)
              org.grant_org_role(assignee: user, role: system_org_role)
            end
          end
          puts "Assigned #{multi_role_users.count} users to custom-org-role-#{custom_org_role_num} and system role #{system_org_role.name}"

          unless multi_role_teams.empty?
            multi_role_teams.each do |multi_role_team|
              org.grant_org_role(assignee: multi_role_team, role: custom_org_role)
              org.grant_org_role(assignee: multi_role_team, role: system_org_role)
            end
          end

          puts "Assigned #{multi_role_teams.count} users to custom-org-role-#{custom_org_role_num} and system role #{system_org_role.name}"

          unless TEAMS_PER_ROLE == 0
            TEAMS_PER_ROLE.times do |team_num|
              role_team_index = "#{custom_org_role_num + 1}-#{team_num + 1}"
              team = Seeds::Objects::Team.create!(org: org, name: "single-role-team-#{role_team_index}")

              TEAM_MEMBERS.times do |user_num|
                team_member = Seeds::Objects::User.create(login: "team-#{role_team_index}-member-#{user_num + 1}")
                org.add_member team_member
                team.add_member(team_member)
              end
              members_of_every_team.each { |user| team.add_member(user) }
              org.grant_org_role(assignee: team, role: custom_org_role)
            end
          end
        end
        puts "Created #{CUSTOM_ROLES} Custom Org Roles"
        puts "Created a matrix of Users and Teams assigned to those Roles in the #{org.name} organization"
      end
    end
  end
end
