# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class OrganizationInvitations < Seeds::Runner
      def self.help
        <<~HELP
        Creates an OrganizationInvitation along for the provided user. Login or email for invitee required.
        HELP
      end

      def self.monalisa
        Seeds::Objects::User.create(login: "monalisa", email: "octocat@github.com")
      end

      def self.run(options = {})
        mona = monalisa

        raise "invitee login or email required" unless options["invitee"] || options["email"]

        org_name = options["org_name"]
        organization = ::Organization.find_by_login(org_name) ||
          Seeds::Objects::Organization.create(login: org_name, admin: mona)

        if invitee = options["invitee"]
          invitee = ::User.find_by_login(invitee) ||
            Seeds::Objects::User.create(login: invitee)
        end

        Seeds::Objects::OrganizationInvitation.create!(
          org: organization,
          invitee: invitee,
          email: options["email"],
          inviter: mona,
          role: options.fetch("role", "direct_member"),
        )
      end
    end
  end
end
