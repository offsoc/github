import {FormControl, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useState} from 'react'
import {Resources} from '../constants/strings'
import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {DeletionConfirmationDialogIssueType$key} from './__generated__/DeletionConfirmationDialogIssueType.graphql'
import {useDeleteIssueType} from '../hooks/use-delete-issue-type'
import {useIssueTypesAnalytics} from '../hooks/use-issue-types-analytics'

type DeleteConfirmationDialogProps = {
  issueType: DeletionConfirmationDialogIssueType$key
  owner: string
  closeDialog: () => void
  returnFocusRefDeletion?: React.RefObject<HTMLElement>
}

export const DeletionConfirmationDialog = ({
  closeDialog,
  issueType,
  owner,
  returnFocusRefDeletion,
}: DeleteConfirmationDialogProps): JSX.Element => {
  const data = useFragment<DeletionConfirmationDialogIssueType$key>(
    graphql`
      fragment DeletionConfirmationDialogIssueType on IssueType {
        id
        name
      }
    `,
    issueType,
  )
  const [confirmationText, setConfirmationText] = useState<string | null>(null)
  const {deleteIssueType} = useDeleteIssueType()
  const {sendIssueTypesAnalyticsEvent} = useIssueTypesAnalytics()

  const handleDeleteClick = useCallback(() => {
    deleteIssueType(data.id, owner, closeDialog)
    sendIssueTypesAnalyticsEvent('org_issue_type.delete', 'ORG_ISSUE_TYPE_DELETE_BUTTON', {issueTypeId: data.id})
  }, [closeDialog, data.id, deleteIssueType, owner, sendIssueTypesAnalyticsEvent])

  const handleCloseDialog = useCallback(() => {
    closeDialog()
    setTimeout(() => {
      returnFocusRefDeletion?.current?.focus()
    }, 20)
  }, [closeDialog, returnFocusRefDeletion])

  return (
    <Dialog
      sx={{
        width: '35%',
        maxHeight: 'clamp(256px, 80vh, 100vh)',
      }}
      onClose={handleCloseDialog}
      aria-labelledby="header-id"
      title={Resources.deleteDialogHeader}
      footerButtons={[
        {buttonType: 'default', content: Resources.cancelButton, onClick: handleCloseDialog},
        {
          buttonType: 'danger',
          content: Resources.deleteButton,
          onClick: handleDeleteClick,
          disabled: confirmationText !== data.name,
          name: 'dialog-delete',
        },
      ]}
    >
      <span>{Resources.deleteDialogBody(data.name)}</span>
      <FormControl id="delete-type-confirmation" required>
        <FormControl.Label sx={{pt: 3}}>{`Please type "${data.name}" to confirm`}</FormControl.Label>
        <TextInput
          sx={{width: '100%'}}
          data-testid="deletion-confirmation-dialog-name"
          onChange={e => setConfirmationText(e.target.value)}
        />
      </FormControl>
    </Dialog>
  )
}
