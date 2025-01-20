import {graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {useCallback, useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {IssueTypesDialogIssueTypes$key} from './__generated__/IssueTypesDialogIssueTypes.graphql'
import type {IssueTypesDialogIssueType$key} from './__generated__/IssueTypesDialogIssueType.graphql'
import {commitUpdateIssueIssueTypeMutation} from '../../mutations/update-issue-issue-type-mutation'
import {LABELS} from '../../constants/labels'
import {ERRORS} from '../../constants/errors'
import {BUTTON_LABELS} from '../../constants/buttons'
import {useAnalytics} from '@github-ui/use-analytics'
import {RadioActionList} from '../RadioActionList'

const UNSET_ID = 'UNSET'

const IssueTypeFragment = graphql`
  fragment IssueTypesDialogIssueType on IssueType {
    id
  }
`

export const IssueTypesFragment = graphql`
  fragment IssueTypesDialogIssueTypes on IssueTypeConnection {
    nodes {
      id
      name
      color
      description
      isEnabled
    }
  }
`

export type IssueTypesDialogProps = {
  onClose: () => void
  issueId: string
  issueTypes: IssueTypesDialogIssueTypes$key
  initialSelectedType?: IssueTypesDialogIssueType$key
  returnFocusRef?: React.RefObject<HTMLLIElement>
}

export const IssueTypesDialog = ({
  onClose,
  issueId,
  issueTypes,
  initialSelectedType,
  returnFocusRef,
}: IssueTypesDialogProps) => {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const {sendAnalyticsEvent} = useAnalytics()

  const preloadedIssueTypes = useFragment(IssueTypesFragment, issueTypes)
  const selectedIssueType = useFragment<IssueTypesDialogIssueType$key>(IssueTypeFragment, initialSelectedType ?? null)

  const enabledIssueTypes = (preloadedIssueTypes?.nodes || []).flatMap(issueTypeNode => {
    if (!issueTypeNode) return []

    return issueTypeNode?.isEnabled ? [issueTypeNode] : []
  })

  const noTypeOption = {
    id: UNSET_ID,
    name: LABELS.issueTypes.noIssueTypeOptionName,
  }

  const issueTypeOptions = [noTypeOption].concat(
    enabledIssueTypes.map(issueType => {
      return {
        id: issueType.id,
        name: issueType.name,
        description: issueType.description,
        color: issueType.color,
      }
    }),
  )

  const [selectedTypeId, setSelectedTypeId] = useState<string>(selectedIssueType?.id || UNSET_ID)

  const handleCloseDialog = useCallback(() => {
    onClose()
    setTimeout(() => {
      returnFocusRef?.current?.focus()
    }, 100)
  }, [onClose, returnFocusRef])

  const handleSelect = useCallback(() => {
    const issueTypeId = selectedTypeId === UNSET_ID ? null : selectedTypeId
    sendAnalyticsEvent('issue_viewer.update_issue_type', 'ISSUE_VIEWER_UPDATE_ISSUE_TYPE_DIALOG', {
      initialIssueTypeId: selectedIssueType?.id ?? '',
      issueTypeId: issueTypeId ?? '',
    })

    commitUpdateIssueIssueTypeMutation({
      environment,
      input: {issueId, issueTypeId},
      onError: (e: Error) => {
        handleCloseDialog()
        // eslint-disable-next-line compat/compat
        reportError(formatError(e.message))
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'error', message: ERRORS.issueTypeUpdateError})
      },
      onCompleted: handleCloseDialog,
    })
  }, [selectedTypeId, sendAnalyticsEvent, selectedIssueType?.id, environment, issueId, handleCloseDialog, addToast])

  return (
    <Dialog
      title={LABELS.issueTypes.issueTypeDialogHeader}
      onClose={handleCloseDialog}
      sx={{width: 'var(--overlay-width-medium, 480px)'}}
      renderBody={() => (
        <Box sx={{maxHeight: 'var(--overlay-height-large, 432px)'}}>
          <RadioActionList
            name="issueTypeSelect"
            onChange={id => setSelectedTypeId(id || UNSET_ID)}
            groupLabel={LABELS.issueTypes.issueTypeDialogHeader}
            selectedId={selectedTypeId}
            items={issueTypeOptions}
          />
        </Box>
      )}
      footerButtons={[
        {buttonType: 'default', content: BUTTON_LABELS.cancel, onClick: handleCloseDialog},
        {
          buttonType: 'primary',
          content: BUTTON_LABELS.changeType,
          onClick: handleSelect,
        },
      ]}
    />
  )
}

const formatError = (message: string) => new Error(ERRORS.issueTypeUpdateErrorReporting(message))
