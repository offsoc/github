import {ConfirmationDialog} from '@primer/react'
import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {commitLocalUpdate} from 'relay-runtime'

import {unblockUserFromOrganization} from '../../mutations/unblock-user-from-organization-mutation'

type UnblockUserFromOrgDialogProps = {
  organization: {login: string; id: string}
  contentAuthor: {login: string; id: string}
  onClose: () => void
  contentId: string
}

export const UnblockUserFromOrgDialog = ({
  contentAuthor,
  organization,
  onClose,
  contentId,
}: UnblockUserFromOrgDialogProps) => {
  const environment = useRelayEnvironment()

  const onDialogClose = useCallback(
    (gesture: 'confirm' | 'cancel' | 'close-button' | 'escape') => {
      if (gesture === 'confirm') {
        unblockUserFromOrganization({
          environment,
          input: {unblockedUserId: contentAuthor.id, organizationId: organization.id},
          onCompleted: () =>
            commitLocalUpdate(environment, store => {
              const contentObject = store.get(contentId)
              contentObject?.setValue(true, 'pendingUnblock')
              contentObject?.setValue(false, 'pendingBlock')
            }),
        })
      }
      onClose()
    },
    [onClose, environment, contentAuthor.id, organization.id, contentId],
  )

  return (
    <ConfirmationDialog
      title={`Unblock ${contentAuthor.login} from ${organization.login}`}
      confirmButtonContent={'Unblock user'}
      confirmButtonType="danger"
      onClose={onDialogClose}
    >
      Are you sure you want to unblock <strong>{contentAuthor.login}</strong> from <strong>{organization.login}</strong>
      ?
    </ConfirmationDialog>
  )
}
