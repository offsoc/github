import {useCallback, useRef, useState} from 'react'
import {fetchQuery, graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {IssueOpenedIcon, PlusCircleIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, ButtonGroup, IconButton, useConfirm} from '@primer/react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {CommandActionListItem, GlobalCommands, CommandButton} from '@github-ui/ui-commands'
import type {IssuePickerItem} from '@github-ui/item-picker/IssuePicker'

import {SubIssueAlertDialog} from './SubIssueAlertDialog'

import {addSubIssueMutation} from '../mutations/add-sub-issue-mutation'
import {RepositoryAndIssuePicker} from './RepositoryAndIssuePicker'
import type {AddSubIssueButtonGroup$key} from './__generated__/AddSubIssueButtonGroup.graphql'
import {useSubIssueState} from './SubIssueStateContext'
import type {AddSubIssueButtonGroupQuery} from './__generated__/AddSubIssueButtonGroupQuery.graphql'
import {noop} from '@github-ui/noop'
import {useAlert} from '../utils/use-alert'

const SUB_ISSUES_BREADTH_LIMIT = 50

export const SelectedIssueQuery = graphql`
  query AddSubIssueButtonGroupQuery($issueId: ID!) {
    node(id: $issueId) {
      ... on Issue {
        # id is not actually used here, but required to ensure the query can be mocked correctly in tests
        id
        parent {
          id
        }
      }
    }
  }
`

export function AddSubIssueButtonGroup({
  issue,
  insideSidePanel,
}: {
  issue: AddSubIssueButtonGroup$key
  insideSidePanel?: boolean
}) {
  const [open, setOpen] = useState(false)
  const {alert, resetAlert, showBreadthLimitAlert, showServerAlert} = useAlert()
  const [pickerType, setPickerType] = useState<'Issue' | 'Repository' | null>(null)
  const {openCreateDialog, createDialogOpen} = useSubIssueState()
  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()
  const anchorRef = useRef(null)
  const returnFocusRef = useRef<HTMLAnchorElement>(null)
  const confirm = useConfirm()

  const data = useFragment(
    graphql`
      fragment AddSubIssueButtonGroup on Issue @argumentDefinitions(fetchSubIssues: {type: "Boolean!"}) {
        id
        repository {
          nameWithOwner
          owner {
            login
          }
        }
        parent {
          id
        }
        subIssues(first: 50) @include(if: $fetchSubIssues) {
          nodes {
            id
          }
        }
      }
    `,
    issue,
  )

  const subIssueCount = data.subIssues?.nodes?.length || 0
  const subIssuesBreadthLimitReached = subIssueCount >= SUB_ISSUES_BREADTH_LIMIT

  type AddSubIssueParams = {
    subIssue: IssuePickerItem & {hasParent?: boolean}
    onError?: (error: Error) => void
  }

  const addSubIssue = useCallback(
    async ({subIssue, onError}: AddSubIssueParams) => {
      const shouldAddSubIssue =
        !subIssue.hasParent ||
        (await confirm({
          title: 'Are you sure?',
          content: 'Sub-issues are limited to one parent. Confirm you want to proceed with this change.',
          confirmButtonType: 'primary',
          confirmButtonContent: 'Change parent issue',
        }))

      if (!shouldAddSubIssue) return
      addSubIssueMutation({
        environment,
        input: {
          issueId: data.id,
          subIssueId: subIssue.id,
          replaceParent: true,
        },
        onError: error => {
          onError?.(error)
        },
      })
    },
    [confirm, data.id, environment],
  )

  const onIssueSelection = useCallback(
    (issues: IssuePickerItem[]) => {
      // At this time, only single issue selection is supported
      const [subIssue] = issues
      if (!subIssue) return

      // To avoid leaking the concept of sub-issues within the RepositoryAndIssuePicker,
      // we fetch the selected issues to confirm whether or not a parent is present.
      fetchQuery<AddSubIssueButtonGroupQuery>(environment, SelectedIssueQuery, {
        issueId: subIssue.id,
      }).subscribe({
        next: issueData => {
          const selectedSubIssue = {
            hasParent: Boolean(issueData?.node?.parent?.id),
            ...subIssue,
          }

          addSubIssue({
            subIssue: selectedSubIssue,
            onError: error => {
              if (!showServerAlert(error)) {
                // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                addToast({
                  type: 'error',
                  message: error.message,
                })
              }
            },
          })
        },
        error: noop,
      })
    },
    [addSubIssue, addToast, environment, showServerAlert],
  )

  const onPickerTypeChange = useCallback(
    (type: 'Issue' | 'Repository' | null) => {
      // When the picker is closed, focus the trigger
      if (type === null && returnFocusRef?.current) {
        returnFocusRef.current.focus()
      }

      setPickerType(type)
    },
    [setPickerType],
  )

  const onAlertClose = useCallback(() => resetAlert(), [resetAlert])

  /**
   * When the issue-viewer is rendered within the side-panel, two issue-viewers are rendered at a time. This results
   * in `<GlobalCommands>` activating both pickers at once. To remedy this, we check if the side-panel is open and
   * whether or not the current issue-viewer is within the side-panel.
   *
   * Commands are only accepted when both the picker and create dialog are closed.
   *
   * If insideSidePanel is false, the issue-viewer is not inside the open side-panel.
   * If insideSidePanel is undefined, the side panel is not open.
   */
  const shouldAcceptCommand =
    (insideSidePanel || insideSidePanel === undefined) && pickerType === null && !createDialogOpen

  const hiddenIssueIds = data.subIssues?.nodes?.filter(node => !!node).map(i => i.id) ?? []

  // Ensure the current issue is not selectable
  hiddenIssueIds.push(data.id)

  // Disallow selecting parent as sub-issue
  if (data.parent) {
    hiddenIssueIds.push(data.parent.id)
  }

  return (
    <>
      {alert && (
        <SubIssueAlertDialog title={alert.title} onClose={onAlertClose}>
          {alert.body}
        </SubIssueAlertDialog>
      )}
      <Box sx={{gap: 2, display: 'flex'}}>
        {shouldAcceptCommand && (
          <GlobalCommands
            commands={{
              'sub-issues:add-existing-issue': () => {
                if (subIssuesBreadthLimitReached) {
                  showBreadthLimitAlert()
                } else {
                  setPickerType('Issue')
                }
              },
              'sub-issues:create-sub-issue': () => {
                if (subIssuesBreadthLimitReached) {
                  showBreadthLimitAlert()
                } else {
                  // Ensure the repo/issue picker and action menu is closed when the dialog is opened
                  setOpen(false)
                  setPickerType(null)
                  openCreateDialog(data.id)
                }
              },
            }}
          />
        )}
        <ButtonGroup ref={anchorRef}>
          <CommandButton size="small" commandId="sub-issues:create-sub-issue">
            Create sub-issue
          </CommandButton>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            size="small"
            icon={TriangleDownIcon}
            aria-label="View more sub-issue options"
            ref={returnFocusRef}
            onClick={() => {
              setOpen(o => !o)
              // Ensure the repo/issue picker is closed when the dropdown is opened
              setPickerType(null)
            }}
          />
        </ButtonGroup>
        <ActionMenu open={open} onOpenChange={setOpen} anchorRef={anchorRef}>
          <ActionMenu.Overlay width="small" returnFocusRef={returnFocusRef}>
            <ActionList>
              <ActionList.Group>
                <CommandActionListItem
                  role="button"
                  commandId="sub-issues:create-sub-issue"
                  leadingVisual={<PlusCircleIcon />}
                >
                  Create sub-issue
                </CommandActionListItem>
                <CommandActionListItem
                  commandId="sub-issues:add-existing-issue"
                  leadingVisual={<IssueOpenedIcon />}
                  role="button"
                >
                  Add existing issue
                </CommandActionListItem>
              </ActionList.Group>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
        <RepositoryAndIssuePicker
          selectedIssueIds={[]}
          hiddenIssueIds={hiddenIssueIds}
          onPickerTypeChange={onPickerTypeChange}
          onIssueSelection={onIssueSelection}
          defaultRepositoryNameWithOwner={data.repository.nameWithOwner}
          organization={data.repository.owner.login}
          pickerType={pickerType}
          anchorElement={props => {
            const {ref} = props as React.HTMLAttributes<HTMLButtonElement> & {
              ref: React.MutableRefObject<HTMLButtonElement | null>
            }
            if (ref) {
              ref.current = anchorRef.current
            }
            // We don't actually want to render any element, as we are relying on the rendered section header above
            return <></>
          }}
        />
      </Box>
    </>
  )
}
