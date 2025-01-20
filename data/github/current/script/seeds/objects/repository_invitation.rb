# frozen_string_literal: true

module Seeds
  module Objects
    class RepositoryInvitation
      def self.create(repository:, invitee:, inviter:, action: :write)
        invitation = ::RepositoryInvitation.find_by(repository: repository, invitee: invitee)
        unless invitation.present?
          invitation_attempt = ::RepositoryInvitation.invite_to_repo(invitee, inviter, repository, action: action)
          raise Objects::CreateFailed, invitation_attempt[:errors] unless invitation_attempt[:success]
          invitation = invitation_attempt[:invitation]
        end
        invitation
      end
    end
  end
end
