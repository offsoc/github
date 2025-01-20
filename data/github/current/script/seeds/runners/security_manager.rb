# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecurityManager < Seeds::Runner
      def self.help
        <<~HELP
        Create a Security Manager team with a single user on the default github org.
        HELP
      end

      def self.run(options = {})
        # create requisite entities
        org = options[:organization_name] ? ::Organization.find_by!(login: options[:organization_name]) : Seeds::Objects::Organization.github
        user = Seeds::Objects::User.create(login: "securitron")

        team = Seeds::Objects::Team.create!(org: org, name: "Security Managers")
        team = T.must(team)
        team.add_member(user)
        team.promote_maintainer(user)

        return if SecurityProduct::SecurityManagerRole.granted_or_inherited? team

        SecurityProduct::SecurityManagerRole.grant! team
      end
    end
  end
end
