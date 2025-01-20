# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SampleOrgs < Seeds::Runner
      def self.help
        <<~HELP
        Create a number of orgs which relate on different ways with monalisa
        HELP
      end

      def self.run(options = {})
        count = options[:count] || 2
        mona = Seeds::Objects::User.monalisa

        # Orgs mona owns
        count.times do |i|
          name = "mona-org-#{i + 1}"
          puts "New org #{name} for #{mona.login}"
          Seeds::Objects::Organization.create(login: name, admin: mona)

          create_repos(name, 3) if i % 5 == 0
        end

        # Orgs mona is a member
        cousin = Seeds::Objects::User.create(login: "cousin-admin")
        count.times do |i|
          name = "member-org-#{i + 1}"
          puts "New org #{name} for #{cousin}"
          org = Seeds::Objects::Organization.create(login: name, admin: cousin)
          org.add_member(mona)

          create_repos(name, 3) if i % 5 == 0
        end

        # Orgs mona is a member but cannot create repos
        count.times do |i|
          name = "disallow-org-#{i + 1}"
          puts "New org #{name} for #{cousin}"
          org = Seeds::Objects::Organization.create(login: name, admin: cousin)
          org.add_member(mona)
          org.disallow_members_can_create_repositories(actor: mona)

          create_repos(name, 3) if i % 5 == 0
        end
      end

      def self.create_repos(org_name, count)
        count.times do |i|
          r = Seeds::Objects::Repository.create(owner_name: org_name, repo_name: "repo-#{org_name}-#{i + 1}", setup_master: true)
          if i % 5 == 0
            r.template = true
            r.save!
          end
        end
      end
    end
  end
end
