import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Octicon, Spinner, Text} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import type {LocalUpdatePayload} from '../../api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {TrackedByItem} from '../../api/issues-graph/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {BulkAddTrackedByItems, type BulkAddTrackedByItemsUIType, GroupedUI} from '../../api/stats/contracts'
import {getDraftItemUpdateColumnAction} from '../../features/grouping/helpers'
import {getInitialState} from '../../helpers/initial-state'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useMemexProjectViewRootHeight} from '../../hooks/use-memex-app-root-height'
import {mapToLocalUpdate} from '../../state-providers/column-values/column-value-payload'
import {useCreateMemexItem} from '../../state-providers/memex-items/use-create-memex-item'
import {useMemexItems} from '../../state-providers/memex-items/use-memex-items'
import {createTrackedByItem} from '../../state-providers/tracked-by-items/tracked-by-helpers'
import {useRemoveParentIssues} from '../../state-providers/tracked-by-items/use-remove-parent-issues'
import {useTrackedByItemsContext} from '../../state-providers/tracked-by-items/use-tracked-by-items-context'
import {TrackedByResources} from '../../strings'
import {ItemState} from '../item-state'
import {useBulkAddItems} from '../side-panel/bulk-add/bulk-add-items-provider'
import useToasts, {ToastType} from '../toasts/use-toasts'

type Props = {
  /** The parent issue's full TrackedByItem contract for optimistic loading of children, or it's issue Id to fetch them */
  trackedBy: TrackedByItem | number
  invisibleButtonVariant?: boolean
  ui?: BulkAddTrackedByItemsUIType
}

function getIssueId(trackedBy: TrackedByItem | number) {
  return typeof trackedBy === 'number' ? trackedBy : trackedBy.key.itemId
}

export function TrackedByMissingIssuesButton({trackedBy, invisibleButtonVariant = true, ui = GroupedUI}: Props) {
  const {tasklist_block} = useEnabledFeatures()
  const {addAllItemsText, itemsNotInProjectText} = TrackedByResources

  const {postStats} = usePostStats()
  const {parentIssuesById, getChildrenTrackedByParent, removeChildIssues} = useTrackedByItemsContext()
  const {createMemexItemOptimisitcally} = useCreateMemexItem()
  const {setChildParentRelationship} = useRemoveParentIssues()
  const {addSelectedItemsRequest} = useBulkAddItems()
  const {items: allItems} = useMemexItems()
  const projectItemLimit = getInitialState().projectLimits.projectItemLimit
  const {addToast} = useToasts()

  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<Array<TrackedByItem>>([])
  const [isAddingItems, setIsAddingItems] = useState(false) // Used to show spinner when adding items

  const {clientHeight} = useMemexProjectViewRootHeight({
    onResize: () => {
      if (!isOpen) return
      flushSync(() => {
        setIsOpen(false)
      })
      setIsOpen(true)
    },
  })

  const itemsTrackedByParent = useCallback(
    async (issueId: number) => {
      const parent = await getChildrenTrackedByParent(issueId)

      if (!parent || !parent.count) {
        return
      }

      // Mapped menuItems as TrackedBy type to be used in the ActionMenu
      setMenuItems(parent.items.map(i => createTrackedByItem(i)))
    },
    [getChildrenTrackedByParent],
  )

  useEffect(() => {
    itemsTrackedByParent(getIssueId(trackedBy))
  }, [itemsTrackedByParent, trackedBy])

  const addOnClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(event => {
    event.stopPropagation()
    setIsOpen(true)
  }, [])

  /*
   * Create Memex Items for the selected items optimistically without making a request to the server
   */
  const loadMemexItemsOptimistically = useCallback(
    (items: Array<TrackedByItem>) => {
      // Skip this if we don't have the full parent trackedByItem information for optimistic loading
      if (typeof trackedBy === 'number') return

      const localColumnValues: Array<LocalUpdatePayload> = []
      const updateAction = getDraftItemUpdateColumnAction({
        dataType: MemexColumnDataType.TrackedBy,
        value: trackedBy,
        kind: 'group',
      })

      if (updateAction) {
        const localUpdate = mapToLocalUpdate(updateAction)
        if (localUpdate) localColumnValues.push(localUpdate)
      }

      for (const item of items) {
        createMemexItemOptimisitcally(
          {
            contentType: ItemType.Issue,
            content: {id: item.key.itemId, repositoryId: item.repoId},
            localColumnValues,
          },
          [
            {
              memexProjectColumnId: 'Title',
              value: {
                title: {
                  raw: item.title,
                  html: item.title,
                },
                state: item.state,
                number: item.number,
                issueId: item.key.itemId,
              },
            },
            {
              memexProjectColumnId: SystemColumnId.TrackedBy,
              value: [trackedBy],
            },
          ],
          item.url,
        )

        // Updates child parent relationships when new items are added to a view
        setChildParentRelationship(item.key.itemId)
      }
    },
    [createMemexItemOptimisitcally, setChildParentRelationship, trackedBy],
  )

  // Both bulk add and single add use the same function
  const handleOnSelect = useCallback(
    async (event: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>, items = menuItems) => {
      event.stopPropagation()

      if (allItems.length + items.length > projectItemLimit) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          message: `Adding these items will exceed the ${projectItemLimit} project item limit`,
          type: ToastType.error,
        })
        return
      }

      setIsAddingItems(true)
      await addSelectedItemsRequest.perform(items)

      postStats({name: BulkAddTrackedByItems, context: items.length.toString(), ui})
      loadMemexItemsOptimistically(items)

      // Bust cache
      const childIssueIds = menuItems.map(item => item.key.itemId)
      removeChildIssues(childIssueIds)
      setIsAddingItems(false)
    },
    [
      menuItems,
      allItems.length,
      projectItemLimit,
      addSelectedItemsRequest,
      postStats,
      ui,
      loadMemexItemsOptimistically,
      removeChildIssues,
      addToast,
    ],
  )

  if (!tasklist_block) {
    return null
  }

  const itemsNotInProjectCount = parentIssuesById.get(getIssueId(trackedBy))?.count ?? 0

  const panel = (
    <ActionMenu anchorRef={anchorRef} open={isOpen} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{width: `${400 - 24 * 2 + 1}px`, maxHeight: clientHeight, overflow: 'auto'}}
        onEscape={() => setIsOpen(false)}
        onClickOutside={() => setIsOpen(false)}
      >
        {isAddingItems ? (
          <Box sx={{justifyContent: 'center', my: 4, display: 'flex'}}>
            <Spinner size="medium" />
          </Box>
        ) : (
          <ActionList {...testIdProps('tracked-by-missing-issues-menu')}>
            {itemsNotInProjectCount > 1 && (
              <>
                <ActionList.Group>
                  <ActionList.Item
                    onSelect={event => handleOnSelect(event, undefined)}
                    {...testIdProps('tracked-by-missing-issues-menu-add-all')}
                  >
                    <ActionList.LeadingVisual>
                      <PlusIcon />
                    </ActionList.LeadingVisual>
                    {addAllItemsText(itemsNotInProjectCount)}
                  </ActionList.Item>
                </ActionList.Group>
                <ActionList.Divider />
              </>
            )}
            <ActionList.Group {...testIdProps('tracked-by-missing-issues-menu-add-individual')}>
              {menuItems.map(item => {
                return (
                  /*<ActionList.Item key={item.repoName + item.number} onSelect={handleOnSelect}>*/
                  <ActionList.Item
                    key={item.key.primaryKey.uuid}
                    onSelect={event => handleOnSelect(event, [item])}
                    {...testIdProps(`tracked-by-missing-issue-row-${item.title}`)}
                  >
                    <ActionList.LeadingVisual>
                      <ItemState type="Issue" state={item.state} stateReason={item.stateReason} isDraft={false} />
                    </ActionList.LeadingVisual>
                    {item.title}
                  </ActionList.Item>
                )
              })}
            </ActionList.Group>
          </ActionList>
        )}
      </ActionMenu.Overlay>
    </ActionMenu>
  )

  return itemsNotInProjectCount === 0 ? null : (
    <>
      <Button
        ref={anchorRef}
        onClick={addOnClick}
        sx={{paddingRight: '8px'}}
        variant={invisibleButtonVariant ? 'invisible' : 'default'}
        {...testIdProps('tracked-by-missing-issues-button')}
      >
        <Text sx={{color: 'fg.muted', fontWeight: 'normal', pr: 2, overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {itemsNotInProjectText(itemsNotInProjectCount)}
        </Text>
        <Octicon
          icon={TriangleDownIcon}
          size="small"
          sx={{
            verticalAlign: 'middle',
            color: 'fg.muted',
          }}
        />
      </Button>
      {panel}
    </>
  )
}
