# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class OrganizationInvitation
      def self.create!(org:, invitee: nil, email: nil, inviter: nil, role: :direct_member, invitation_source: :member)
        ::OrganizationInvitation.new.tap do |oi|
          oi.organization = org
          oi.invitee = invitee
          oi.email = email
          oi.inviter = inviter
          oi.role = role
          oi.invitation_source = invitation_source
          oi.save!
        end
      end
    end
  end
end
