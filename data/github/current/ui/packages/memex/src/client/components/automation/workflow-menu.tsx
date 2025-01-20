import {testIdProps} from '@github-ui/test-id-props'
import {KebabHorizontalIcon, TrashIcon} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  IconButton,
  type TouchOrMouseEvent,
  useConfirm,
  useRefObjectAsForwardedRef,
} from '@primer/react'
import {type ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'

import type {ClientMemexWorkflow, MemexWorkflowPersisted} from '../../api/workflows/contracts'
import {isAutoAddWorkflow, isWorkflowPersisted} from '../../helpers/workflow-utilities'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {WorkflowResources} from '../../strings'
import {DuplicateWorkflowButton} from './duplicate-workflow-button'

type WorkflowMenuProps = {
  workflow: ClientMemexWorkflow
  showDelete: boolean
  isOpen: boolean
}

export const WorkflowMenu = forwardRef(
  ({workflow, showDelete, isOpen}: WorkflowMenuProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const {deleteWorkflow, setWorkflowMenuState, handleReturnFocus} = useWorkflows()
    const environment = useRelayEnvironment()
    const confirm = useConfirm()

    const updateMenuState = useCallback(() => {
      setWorkflowMenuState(workflow.clientId)
      handleReturnFocus(workflow.clientId)
    }, [setWorkflowMenuState, workflow.clientId, handleReturnFocus])

    const onDelete = useCallback(
      async (persistedWorkflow: MemexWorkflowPersisted) => {
        const shouldDelete = await confirm({
          title: WorkflowResources.deleteWorkflowConfirmationTitle,
          content: WorkflowResources.deleteWorkflowConfirmationContent,
          confirmButtonContent: WorkflowResources.deleteWorkflowConfirmationButton,
          confirmButtonType: 'danger',
        })

        setWorkflowMenuState(workflow.clientId)

        if (shouldDelete) {
          deleteWorkflow(persistedWorkflow.number, environment)
        } else {
          handleReturnFocus(workflow.clientId)
        }
      },
      [confirm, deleteWorkflow, environment, handleReturnFocus, setWorkflowMenuState, workflow.clientId],
    )

    const [isMenuOpen, setIsMenuOpen] = useState(isOpen)

    const onClickOutside = useCallback(
      (e: TouchOrMouseEvent) => {
        if (e.target instanceof Element) {
          if (e.target?.closest('a')?.href?.includes('/workflows/')) {
            // If the target of the click event is on a workflow side nav list item
            // then we want to ignore setting the menu state as it will be handled by the navItem.
            return
          }
        }
        setWorkflowMenuState(workflow.clientId)
      },
      [setWorkflowMenuState, workflow.clientId],
    )

    const anchorRef = useRef<HTMLButtonElement>(null)
    useRefObjectAsForwardedRef(ref, anchorRef)

    const items = useMemo<Array<JSX.Element>>(() => {
      const menuItems = []
      if (isWorkflowPersisted(workflow)) {
        if (showDelete) {
          menuItems.push(
            <ActionList.Item
              key={`${workflow.clientId}-delete-option`}
              variant="danger"
              onSelect={() => onDelete(workflow)}
              {...testIdProps(`workflow-nav-item-menu-delete-${workflow.clientId}`)}
            >
              <ActionList.LeadingVisual>
                <TrashIcon />
              </ActionList.LeadingVisual>
              {WorkflowResources.deleteWorkflowCallToAction}
            </ActionList.Item>,
          )
        }

        if (isAutoAddWorkflow(workflow))
          menuItems.push(
            <DuplicateWorkflowButton key={`${workflow.clientId}-duplicate-option`} workflowToDuplicate={workflow} />,
          )
      }
      return menuItems
    }, [onDelete, showDelete, workflow])

    return (
      <>
        {items.length > 0 ? (
          <>
            <IconButton
              id={`workflow-nav-item-menu-${workflow.clientId}`}
              key={`workflow-nav-item-menu-${workflow.clientId}`}
              ref={anchorRef}
              icon={KebabHorizontalIcon}
              variant="invisible"
              aria-label="Open workflow options"
              sx={{color: 'fg.default', py: 0}}
              {...testIdProps(`workflow-nav-item-menu-${workflow.clientId}`)}
            />
            <ActionMenu anchorRef={anchorRef} open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <ActionMenu.Overlay sx={{overflow: 'visible'}} onClickOutside={onClickOutside} onEscape={updateMenuState}>
                <ActionList
                  key={`workflow-nav-item-menu-list-${workflow.clientId}`}
                  {...testIdProps(`workflow-nav-item-menu-list-${workflow.clientId}`)}
                >
                  {items}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </>
        ) : null}
      </>
    )
  },
)

WorkflowMenu.displayName = 'WorkflowMenu'
