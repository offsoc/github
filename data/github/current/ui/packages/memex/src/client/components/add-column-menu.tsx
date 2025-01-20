import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {PlusIcon} from '@primer/octicons-react'
import {ActionList, type ActionListItemProps, ActionMenu} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import {useHorizontalGroupedBy} from '../features/grouping/hooks/use-horizontal-grouped-by'
import {onSubMenuMultiSelection} from '../helpers/util'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {DragDropWithIdsContext, useDragWithIds, useDropWithIds} from '../hooks/drag-and-drop/drag-and-drop'
import {useMemexRootHeight} from '../hooks/use-memex-root-height'
import {useViewOptionsStatsUiKey} from '../hooks/use-view-options-stats-ui-key'
import {useViews} from '../hooks/use-views'
import {useVisibleFields} from '../hooks/use-visible-fields'
import type {ColumnModel} from '../models/column-model'
import {useAllColumns} from '../state-providers/columns/use-all-columns'
import {useFindColumnByDatabaseId} from '../state-providers/columns/use-find-column-by-database-id'
import {useAddFieldModal} from '../state-providers/modals/use-add-field-modal'
import {getColumnIcon} from './column-detail-helpers'
import {normalizeToFilterName} from './filter-bar/helpers/search-filter'

const FieldMenuGroups = {
  NewFieldGroup: 'NewFieldGroup',
  VisibleFieldGroup: 'VisibleFieldGroup',
  HiddenFieldGroup: 'HiddenFieldGroup',
} as const
type FieldMenuGroups = ObjectValues<typeof FieldMenuGroups>

type MenuProps = {
  id?: string
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
}

export const AddColumnMenu = memo<MenuProps>(function AddColumnMenu({id, open, setOpen, anchorRef}) {
  const {clientHeight} = useMemexRootHeight({
    onResize: () => {
      if (open) {
        flushSync(() => {
          setOpen(false)
        })

        setOpen(true)
      }
    },
  })
  return (
    <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{maxHeight: clientHeight, overflow: 'auto'}}
        {...testIdProps('column-visibility-menu')}
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
      >
        <Options id={id} key={String(open)} setOpen={setOpen} />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

const Options = memo(function Options({id, setOpen}: Pick<MenuProps, 'setOpen' | 'id'>) {
  const {currentView} = useViews()
  const {setShowAddFieldModal, showAddFieldModal} = useAddFieldModal()

  const {allColumns} = useAllColumns()
  const {isFieldVisible, toggleField, visibleFields} = useVisibleFields()

  const {hasWritePermissions} = ViewerPrivileges()
  const statsUiKey = useViewOptionsStatsUiKey()
  const onClickNewField = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      setShowAddFieldModal(true)
      setOpen(false)
      event.stopPropagation()
    },
    [setOpen, setShowAddFieldModal],
  )

  const getItem = useCallback(
    (column: ColumnModel, groupType: FieldMenuGroups, index: number) => {
      const isVisible = isFieldVisible(column)
      const isDisabled = isVisibleFieldDisabled(column)
      const Icon = getColumnIcon(column.dataType)
      return (
        <DragAndDroppableActionListItem
          key={column.id}
          groupId={groupType}
          dragProps={{column, index}}
          disabled={isDisabled}
          onSelect={
            !isDisabled
              ? event => {
                  onSubMenuMultiSelection(event)
                  // the column is currently visible, so the stat is that we are hiding it.
                  if (!currentView) return

                  toggleField(currentView.number, column, undefined, statsUiKey)
                  event.stopPropagation()
                }
              : undefined
          }
          selected={isVisible}
        >
          {/* eslint-disable-next-line primer-react/direct-slot-children */}
          <ActionList.LeadingVisual>
            <Icon />
          </ActionList.LeadingVisual>
          {column.name}
        </DragAndDroppableActionListItem>
      )
    },
    [currentView, isFieldVisible, toggleField, statsUiKey],
  )

  const [visibleFieldItems, hiddenFieldItems] = useMemo(() => {
    const visibleFieldDatabaseIds = new Set(visibleFields.map(col => col.databaseId))
    const hiddenColumns = allColumns.filter(col => !visibleFieldDatabaseIds.has(col.databaseId))
    const visibleItems = []
    const hiddenItems = []

    for (const [index, field] of visibleFields.entries()) {
      visibleItems.push(getItem(field, FieldMenuGroups.VisibleFieldGroup, index))
    }
    for (const [index, field] of hiddenColumns.entries()) {
      hiddenItems.push(getItem(field, FieldMenuGroups.HiddenFieldGroup, index))
    }
    return [visibleItems, hiddenItems]
  }, [allColumns, getItem, visibleFields])

  const addColumnAllowed = useMemo(() => {
    // "New field" option should be enabled if a user has write permissions, the Modal for new field is not shown and it is a table view
    return hasWritePermissions && !showAddFieldModal
  }, [hasWritePermissions, showAddFieldModal])

  return (
    <DragDropWithIdsContext>
      <ActionList id={id} sx={{width: 'max-content'}} {...testIdProps('visible-columns-menu')}>
        <ActionList.Group>
          <ActionList.Item
            key={'new-field'}
            disabled={!addColumnAllowed}
            onSelect={e => {
              onSubMenuMultiSelection(e)
              onClickNewField(e)
            }}
            {...testIdProps('new-field-button')}
          >
            <ActionList.LeadingVisual>
              <PlusIcon />
            </ActionList.LeadingVisual>
            New field
          </ActionList.Item>
        </ActionList.Group>
        <ActionList.Divider />
        <ActionList.Group selectionVariant="multiple">
          <ActionList.GroupHeading>Visible fields</ActionList.GroupHeading>
          {visibleFieldItems}
        </ActionList.Group>
        <ActionList.Group selectionVariant="multiple">
          <ActionList.GroupHeading>Hidden fields</ActionList.GroupHeading>
          {hiddenFieldItems}
        </ActionList.Group>
      </ActionList>
    </DragDropWithIdsContext>
  )
})

type DragAndDroppableActionListItemProps = ActionListItemProps & {
  dragProps: {column: ColumnModel; index: number}
  groupId: FieldMenuGroups
}

const itemWrapperStyle: BetterSystemStyleObject = {
  position: 'relative',
  mb: 1,
  userSelect: 'none',
  '&:not(.hide-sash):not(.is-dragging)': {
    '&::after, &::before': {
      content: "''",
      display: 'none',
      position: 'absolute',
      width: '100%',
      bg: 'accent.emphasis',
      height: '4px',
      border: 0,
      borderRadius: '6px',
      zIndex: 12,
    },
    '&.show-sash-before': {
      '&::before': {
        display: 'block',
        top: '-4px',
        left: 0,
      },
    },
    '&.show-sash-after': {
      '&::after': {
        display: 'block',
        bottom: '-4px',
        right: 0,
      },
    },
  },
}

const DragAndDroppableActionListItem = memo(function DragAndDroppableActionListItem({
  dragProps,
  groupId,
  ...props
}: DragAndDroppableActionListItemProps) {
  const {currentView} = useViews()
  const {groupedByColumn} = useHorizontalGroupedBy()
  const {moveField, hideField, isFieldVisible} = useVisibleFields()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
  const ref = useRef<HTMLDivElement>(null)

  const [isBeingDragged, setIsBeingDragged] = useState(false)
  const [pointerEvents] = useDragClickPointerEvents(isBeingDragged)
  const statsUiKey = useViewOptionsStatsUiKey()

  const drag = useDragWithIds({
    dragID: String(dragProps?.column.databaseId),
    dragType: 'add-column-option',
    dragRef: ref,
    dragIndex: dragProps?.index ?? -1,
    dragOrigin: FieldMenuGroups.VisibleFieldGroup,
    metadata: {},
    disable: !dragProps,
    onDragStart() {
      setIsBeingDragged(true)
    },
    onDragEnd() {
      setIsBeingDragged(false)
    },
  })

  const drop = useDropWithIds({
    dropRef: ref,
    dropID: String(dragProps?.column.databaseId),
    dropType: 'add-column-option',

    onDrop({state: {dragID: dragDropId}}) {
      if (!dragDropId) return
      if (!currentView) return

      const column = findColumnByDatabaseId(Number(dragDropId))
      if (!column) return

      /**
       * If we're dropping on the same column, ignore
       */
      if (dragDropId === String(dragProps?.column.databaseId)) return

      /**
       * If Title or grouped column, don't allow drop
       * otherwise hide field
       */
      if (groupId === FieldMenuGroups.HiddenFieldGroup) {
        if (groupedByColumn === column) return
        if (column.dataType === MemexColumnDataType.Title) return
        hideField(currentView.number, column)
      }

      if (!dragProps) return

      /**
       * Move the dropped field to the position at or after the
       * field it's dropped on
       */
      if (groupId === FieldMenuGroups.VisibleFieldGroup) {
        moveField(currentView.number, column, dragProps.index, statsUiKey)
        return
      }
    },
  })

  const classnames = clsx({
    'hide-sash': !dragProps || !isFieldVisible(dragProps.column) || isBeingDragged,
  })

  return (
    <ActionList.Item
      {...testIdProps(columnItemTestId(isFieldVisible(dragProps.column), dragProps?.column.name))}
      {...drag.props}
      {...drag.handle.props}
      {...drop.props}
      {...props}
      sx={{
        ...itemWrapperStyle,
        ...props.sx,
        boxShadow: isBeingDragged ? theme => `0 0 0 1px ${theme.colors.accent.emphasis}` : undefined,
        ':hover': isBeingDragged
          ? {
              background: 'initial',
            }
          : undefined,
        pointerEvents,
      }}
      className={classnames}
    />
  )
})

function useDragClickPointerEvents(isBeingDragged: boolean, timeout = 150) {
  const [pointerEvents, setPointerEvents] = useState<'none' | 'auto'>(() => (isBeingDragged ? 'none' : 'auto'))
  const timeoutValueRef = useTrackingRef(timeout)

  useEffect(
    function handleDragging() {
      if (!isBeingDragged) return

      let mounted = true
      const timer = setTimeout(() => {
        if (mounted) {
          setPointerEvents('none')
        }
      }, timeoutValueRef.current)

      return () => {
        mounted = false
        clearTimeout(timer)
      }
    },
    [isBeingDragged, timeoutValueRef],
  )

  useEffect(
    function handleNotDragging() {
      if (!isBeingDragged) {
        setPointerEvents('auto')
      }
    },
    [isBeingDragged],
  )

  return [pointerEvents, setPointerEvents] as const
}

// Returns true if a field/column should be disabled in the actions menu
function isVisibleFieldDisabled(column: ColumnModel) {
  // Title column is always visible and can't be hidden
  if (column.dataType === MemexColumnDataType.Title) {
    return true
  }

  return false
}

// Returns the test ID of a column item in the actions menu, based on whether it's visible or hidden
function columnItemTestId(isFieldVisible: boolean, columnName: string) {
  const kebabCaseColumnName = normalizeToFilterName(columnName)

  return `${isFieldVisible ? 'visible' : 'hidden'}-column-item-${kebabCaseColumnName}`
}
