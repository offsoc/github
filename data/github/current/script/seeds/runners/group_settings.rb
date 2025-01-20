# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GroupSettings < Seeds::Runner
      ORG_NAME = "group-settings-org"
      GROUPS = %w[
        small
        medium
        large
        small/red
        small/red/square
        small/green/triangle
        medium/red
        medium/blue
        medium/blue/circle
        nil
      ]

      def self.help
        <<~HELP
        Create a large number of repos, put them in repo groups, and give them settings
        HELP
      end

      def self.run(options = {})
        puts "Creating repos and groups..."

        user = Seeds::Objects::User.monalisa
        enable_features

        @org = create_org(user)

        group_team_1 = create_team(@org, user.login, [user])
        group_team_2 = create_team(@org, user.login, [user])
        group_team_3 = create_team(@org, user.login, [user])

        @counter = 0
        start = @org.repositories.count
        puts "starting at #{start}"
        repos_count = options.fetch(:repos_count, 100) - start

        repos_count.times do |index|
          name = "repo-" + (start + index).to_s
          repo = create_repo(name, @org)
          put_in_group(repo)
        end

        # now get the ones not in a group and put a few of them into a group
        RepositoryGroup.repositories_with_no_group(@org).each do |repo|
          put_in_group(repo)
        end

        # do it one more time
        RepositoryGroup.repositories_with_no_group(@org).each do |repo|
          put_in_group(repo)
        end

        puts "Created repos and groups!"
        puts "View at http://github.localhost/organizations/#{@org.display_login}/settings/groups"
      end

      sig { void }
      def self.enable_features
        GitHub.flipper[:repos_groups].enable
      end

      def self.put_in_group(repo)
        @counter += 1

        # skip a bunch. We might do them later. So they're not all in order
        return if @counter % 5 == 0

        group_path = GROUPS[@counter.modulo(GROUPS.size)]
        group_path = "" if group_path == "nil"
        group_path = "large" if @counter > 50
        group_path = "small/red/square" if @counter > 100

        repo.join_group(group_path)
        puts "Put #{repo.name_with_owner} in group: #{group_path}"
      end

      def self.create_org(admin)
        Seeds::Objects::Organization.create(login: ORG_NAME, admin: admin)
      end

      def self.create_repo(repo_name, owner)
        repo = Repository.find_by(name: repo_name, owner: owner)

        repo ||= Seeds::Objects::Repository.create(
          repo_name: repo_name,
          owner_name: owner.display_login,
          setup_master: true,
          is_public: false
        )
      end

      def self.create_team(org, name, members)
        puts "Creating team"
        team = Team.find_by(name:, organization: org)
        if team.nil?
          team = T.must(Seeds::Objects::Team.create!(
            name:,
            org:,
          ))
          puts "Created team"
        else
          puts "Team already exists"
        end
        puts "Adding members"
        members.each do |user|
          team.add_member(user)
        end
        puts "Added members"
        team
      end
    end
  end
end
