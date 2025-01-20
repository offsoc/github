import {Dialog} from '@primer/react/experimental'
import {Resources} from '../constants/strings'
import {graphql, useFragment} from 'react-relay'
import type {DisableOrganizationConfirmationDialogIssueType$key} from './__generated__/DisableOrganizationConfirmationDialogIssueType.graphql'
import {useEnableDisableIssueType} from '../hooks/use-enable-disable-issue-type'
import {useCallback} from 'react'
import {useIssueTypesAnalytics} from '../hooks/use-issue-types-analytics'

interface DisableOrganizationConfirmationDialogProps {
  issueType: DisableOrganizationConfirmationDialogIssueType$key
  closeDialog: () => void
  returnFocusRefDisable?: React.RefObject<HTMLElement>
}

export const DisableOrganizationConfirmationDialog = ({
  issueType,
  closeDialog,
  returnFocusRefDisable,
}: DisableOrganizationConfirmationDialogProps) => {
  const {disableOrganizationIssueType} = useEnableDisableIssueType()
  const {sendIssueTypesAnalyticsEvent} = useIssueTypesAnalytics()

  const data = useFragment<DisableOrganizationConfirmationDialogIssueType$key>(
    graphql`
      fragment DisableOrganizationConfirmationDialogIssueType on IssueType {
        id
        name
      }
    `,
    issueType,
  )
  const handleConfirmClick = useCallback(() => {
    sendIssueTypesAnalyticsEvent('org_issue_type.disable', 'ORG_ISSUE_TYPE_DISABLE_BUTTON', {issueTypeId: data.id})
    disableOrganizationIssueType(data.id, closeDialog)
  }, [disableOrganizationIssueType, data.id, closeDialog, sendIssueTypesAnalyticsEvent])

  const handleCloseDialog = useCallback(() => {
    closeDialog()
    setTimeout(() => {
      returnFocusRefDisable?.current?.focus()
    }, 20)
  }, [closeDialog, returnFocusRefDisable])

  return (
    <Dialog
      sx={{
        width: '35%',
        maxHeight: 'clamp(256px, 80vh, 100vh)',
      }}
      onClose={handleCloseDialog}
      title={Resources.disableConfirmationDialogHeader}
      footerButtons={[
        {buttonType: 'default', content: Resources.cancelButton, onClick: handleCloseDialog},
        {
          buttonType: 'primary',
          onClick: handleConfirmClick,
          content: Resources.disableButton,
        },
      ]}
    >
      <span>{Resources.disableConfirmationDialogBody(data.name)}</span>
    </Dialog>
  )
}
