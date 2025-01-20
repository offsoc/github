import {Box, ConfirmationDialog} from '@primer/react'
import {commitDeleteIssueMutation} from '../../mutations/delete-issue-mutation'
import {useRelayEnvironment} from 'react-relay'
import {useCallback} from 'react'
import {MESSAGES} from '../../constants/messages'

type IssueDeletionConfirmationDialogProps = {
  issueId: string
  onSuccessfulDeletion?: () => void
  afterDelete?: () => void
  onClose: () => void
}

export const IssueDeletionConfirmationDialog = ({
  issueId,
  onSuccessfulDeletion,
  afterDelete,
  onClose,
}: IssueDeletionConfirmationDialogProps) => {
  const environment = useRelayEnvironment()

  const onDialogClose = useCallback(
    (gesture: 'confirm' | 'cancel' | 'close-button' | 'escape') => {
      if (gesture === 'confirm') {
        commitDeleteIssueMutation({
          environment,
          input: {issueId},
          onCompleted: onSuccessfulDeletion,
        })
        afterDelete?.()
      }
      onClose()
    },
    [onClose, environment, issueId, onSuccessfulDeletion, afterDelete],
  )

  return (
    <ConfirmationDialog
      title={MESSAGES.deleteIssueConfirmationTitle}
      confirmButtonContent={MESSAGES.deleteIssueConfirmationButton}
      confirmButtonType="danger"
      onClose={onDialogClose}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', mt: 2, px: 3}}>
        <ul style={{listStyleType: 'disc'}}>
          {MESSAGES.deleteIssueConfirmationActionPoints.map(actionPoint => (
            <li key={actionPoint}>
              <span>{actionPoint}</span>
            </li>
          ))}
        </ul>
      </Box>
    </ConfirmationDialog>
  )
}
