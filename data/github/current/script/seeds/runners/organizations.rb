# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Organizations < Seeds::Runner
      def self.help
        <<~HELP
        Creates an Organization along with the provided users.
        HELP
      end

      def self.monalisa
        Seeds::Objects::User.create(login: "monalisa", email: "octocat@github.com")
      end

      def self.run(options = {})
        domain = options["email_domain"]

        org_name = options["org_name"]
        organization = Seeds::Objects::Organization.create(login: org_name, admin: monalisa)
        team = organization.teams.first

        logins = options["logins"]&.split(",")

        return if domain.blank? || logins.blank?
        logins.each do |login|
          email = "#{login}@#{domain}"
          user = Seeds::Objects::User.create(login: login, email: email)
          team = T.must(Seeds::Objects::Team.create!(org: organization, name: "Employees"))
          team.add_member(user)
        end
      end
    end
  end
end
