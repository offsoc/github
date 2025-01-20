# typed: true
# frozen_string_literal: true

require_relative "../runner"

module Seeds
  class Runner
    class FailedOrganizationInvitations < Seeds::Runner


      def self.help
        <<~EOF
        Adds failed organization invitations to an organization. Defaults to 50 invitations in the github organization.
        EOF
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa
        org = if options["org_name"].present?
          Organization.find_by_login(options["org_name"])
        else
          Organization.find_by_login("github")
        end

        invite_number = if options["invite_number"].present?
          options["invite_number"].to_i
        else
          50
        end

        invite_number.times do |i|
          invitee = Seeds::Objects::User.create(login: "failed-user-#{i}")
          invite = Seeds::Objects::OrganizationInvitation.create!(
            org: org,
            invitee: invitee,
            inviter: mona,
            role: options.fetch("role", "direct_member"),
          )
          invite.update(failed_at: Time.now, failed_reason: :expired)
          invite.save!
        end
      end
    end
  end
end
