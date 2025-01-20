import {ActionList} from '@primer/react'
import {useCallback} from 'react'
import {TrashIcon} from '@primer/octicons-react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {commitRemoveSubIssueMutation} from '../mutations/remove-sub-issue-mutation'
import {useRelayEnvironment} from 'react-relay'
import {NestedListItemActionBar} from '@github-ui/nested-list-view/NestedListItemActionBar'
import {ActionListItemCopyToClipboard} from '@github-ui/action-list-items/ActionListItemCopyToClipboard'

export function SubIssuesActionBar({
  issueId,
  subIssueId,
  subIssueUrl,
}: {
  issueId: string
  subIssueId: string
  subIssueUrl: string
}) {
  const environment = useRelayEnvironment()

  const {addToast} = useToastContext()

  const removeSubIssue = useCallback(() => {
    commitRemoveSubIssueMutation({
      environment,
      input: {
        issueId,
        subIssueId,
      },
      onError: error => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: error.message,
        })
      },
    })
  }, [environment, issueId, subIssueId, addToast])

  return (
    <NestedListItemActionBar
      staticMenuActions={[
        {
          key: 'copy',
          render: () => (
            <ActionListItemCopyToClipboard textToCopy={subIssueUrl}>Copy link</ActionListItemCopyToClipboard>
          ),
        },
        {
          key: 'remove',
          render: () => (
            <ActionList.Item
              role="menuitem"
              as="button"
              variant="danger"
              aria-label="Remove sub-issue"
              onSelect={removeSubIssue}
            >
              <ActionList.LeadingVisual>
                <TrashIcon />
              </ActionList.LeadingVisual>
              Remove sub-issue
            </ActionList.Item>
          ),
        },
      ]}
    />
  )
}
