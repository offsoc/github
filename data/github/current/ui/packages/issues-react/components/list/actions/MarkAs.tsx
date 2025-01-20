import {testIdProps} from '@github-ui/test-id-props'
import {useKeyPress} from '@github-ui/use-key-press'
import {ActionList, ActionMenu} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {VALUES} from '../../../constants/values'
import type {updateIssuesBulkByQueryMutation$data} from '../../../mutations/__generated__/updateIssuesBulkByQueryMutation.graphql'
import type {
  IssueClosedStateReason,
  IssueState,
  updateIssuesBulkMutation$data,
} from '../../../mutations/__generated__/updateIssuesBulkMutation.graphql'
import {commitUpdateIssueBulkMutation} from '../../../mutations/update-issues-bulk'
import {commitUpdateIssueBulkByQueryMutation} from '../../../mutations/update-issues-bulk-by-query'
import type {SharedListHeaderActionProps} from '../header/ListItemsHeader'

type MarkAsProps = Omit<SharedListHeaderActionProps, 'repo' | 'owner'>

const fieldTypes: Array<{
  name: string
  icon: React.ComponentType
  value: {state: IssueState; stateReason?: IssueClosedStateReason}
}> = [
  {name: 'Open', icon: VALUES.issueIcons.OPEN.icon, value: {state: 'OPEN'}},
  {name: 'Completed', icon: VALUES.issueIcons.CLOSED.icon, value: {state: 'CLOSED', stateReason: 'COMPLETED'}},
  {name: 'Not planned', icon: VALUES.issueIcons.NOT_PLANNED.icon, value: {state: 'CLOSED', stateReason: 'NOT_PLANNED'}},
]

export const MarkAs = ({
  issuesToActOn,
  query,
  repositoryId,
  disabled,
  useQueryForAction,
  onCompleted,
  onError,
  nested = false,
}: MarkAsProps) => {
  const relayEnvironment = useRelayEnvironment()

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  useKeyPress(['e'], () => handleOpenChange(true), {
    triggerWhenInputElementHasFocus: false,
    triggerWhenPortalIsActive: false,
  })
  useKeyPress(['Escape'], () => handleOpenChange(false), {})

  const callback = useCallback(
    (args: {state: IssueState}) => {
      if (useQueryForAction && repositoryId && query) {
        commitUpdateIssueBulkByQueryMutation({
          environment: relayEnvironment,
          optimisticUpdateIds: issuesToActOn,
          input: {
            query,
            repositoryId,
            ...args,
          },
          onCompleted: ({updateIssuesBulkByQuery}: updateIssuesBulkByQueryMutation$data) => {
            onCompleted?.(updateIssuesBulkByQuery?.jobId || undefined)
          },
          onError: (error: Error) => {
            onError?.(error)
          },
        })
      } else {
        commitUpdateIssueBulkMutation({
          environment: relayEnvironment,
          optimisticUpdateIds: issuesToActOn,
          input: {
            ids: [...issuesToActOn],
            ...args,
          },
          onCompleted: ({updateIssuesBulk}: updateIssuesBulkMutation$data) => {
            onCompleted?.(updateIssuesBulk?.jobId || undefined)
          },
          onError: (error: Error) => {
            onError?.(error)
          },
        })
      }
    },
    [useQueryForAction, repositoryId, query, relayEnvironment, issuesToActOn, onCompleted, onError],
  )
  const listItems = useMemo(
    () => (
      <>
        {fieldTypes.map((type, index) => (
          <ActionList.Item key={index} onSelect={() => callback(type.value)}>
            <ActionList.LeadingVisual>
              <type.icon />
            </ActionList.LeadingVisual>
            {type.name}
          </ActionList.Item>
        ))}
      </>
    ),
    [callback],
  )
  if (nested) {
    return (
      <ActionMenu>
        <ActionMenu.Anchor>
          <ActionList.Item>
            <ActionList.LeadingVisual>
              <VALUES.issueIcons.CLOSED.icon />
            </ActionList.LeadingVisual>
            Mark as
          </ActionList.Item>
        </ActionMenu.Anchor>

        <ActionMenu.Overlay>
          <ActionList>{listItems}</ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    )
  }

  return (
    <ActionMenu open={isOpen} onOpenChange={handleOpenChange}>
      <ActionMenu.Button
        disabled={disabled}
        leadingVisual={VALUES.issueIcons.CLOSED.icon}
        {...testIdProps('mark-as-action-menu-button')}
      >
        Mark as
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList {...testIdProps('mark-as-action-menu-list')}>{listItems}</ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
