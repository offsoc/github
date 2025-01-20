import {useSortable} from '@github-ui/drag-and-drop'
import {testIdProps} from '@github-ui/test-id-props'
import {CheckIcon, GrabberIcon, PlusIcon} from '@primer/octicons-react'
import {ActionList, Box, Label, NavList, Text, themeGet} from '@primer/react'
import {clsx} from 'clsx'
import {useCallback, useMemo, useRef} from 'react'
import {CSSTransition} from 'react-transition-group'
import styled from 'styled-components'

import type {MemexProjectColumnId} from '../../../api/columns/contracts/memex-column'
import {getColumnIcon} from '../../../components/column-detail-helpers'
import {NavLinkActionListItem} from '../../../components/react-router/action-list-nav-link-item'
import {useDragAndDrop} from '../../../helpers/dnd-kit/drag-and-drop-context'
import {DropSide} from '../../../helpers/dnd-kit/drop-helpers'
import type {OnDropArgs} from '../../../helpers/dnd-kit/vertical-sortable-context'
import {VerticalSortableContext} from '../../../helpers/dnd-kit/vertical-sortable-context'
import {getColumnWarning} from '../../../helpers/get-column-warning'
import {isColumnUserEditable} from '../../../helpers/is-column-editable'
import {sortColumnsDeterministically} from '../../../helpers/util'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import type {ColumnModel} from '../../../models/column-model'
import {useProjectRouteParams} from '../../../router/use-project-route-params'
import {PROJECT_SETTINGS_FIELD_ROUTE} from '../../../routes'

export type ReorderColumnCommitState = 'idle' | 'saving' | 'success' | 'error'

type ColumnListProps = {
  columns: Array<ColumnModel>
  reorderCommitState: ReorderColumnCommitState
  addNewAnchorRef: React.RefObject<HTMLLIElement> | null
  /** Called when the "new field" action is selected */
  onNewField: () => void
  onReorderColumnCallback: (repositionedColumnId: number, previousColumnId: number | null) => void
  onFieldNavCallback?: (memexProjectColumnId: MemexProjectColumnId, event: React.MouseEvent) => void
}

const reorderFeedbackTimeout = 1000 //ms

export function ReorderableColumnListNav({columns, ...props}: ColumnListProps) {
  const {sub_issues} = useEnabledFeatures()
  const sortableColumns = useMemo(
    () => columns.filter(column => isColumnUserEditable(column, {sub_issues})).sort(sortColumnsDeterministically),
    [columns, sub_issues],
  )

  const sortableColumnIds = useMemo(() => sortableColumns.map(col => col.databaseId), [sortableColumns])

  const onDrop = useCallback(
    ({dragMetadata, dropMetadata, side}: OnDropArgs<number>) => {
      let dropColumnId = -1
      // dropMetadata is only null when the drop happens after all items of the list
      // in this case, `side` will also be null
      if (!dropMetadata) {
        const lastColumn = columns.at(-1)
        if (!lastColumn) return
        dropColumnId = lastColumn.databaseId
      } else {
        dropColumnId = dropMetadata.id
      }

      let previousColumnId: number | null = dropColumnId
      if (side === DropSide.BEFORE) {
        const dropColumnIndex = columns.findIndex(({databaseId}) => databaseId === dropColumnId)
        const previousColumn = columns[dropColumnIndex - 1]
        previousColumnId = previousColumn ? previousColumn.databaseId : null
      }

      // checks if reorder is necessary
      if (previousColumnId) {
        const previousColumnIndex = columns.findIndex(({databaseId}) => databaseId === previousColumnId)
        const repositionedColumnIndex = columns.findIndex(({databaseId}) => databaseId === dragMetadata.id)

        if (previousColumnIndex + 1 === repositionedColumnIndex) return
      }

      props.onReorderColumnCallback?.(dragMetadata.id, previousColumnId)
    },
    [columns, props],
  )

  return (
    <VerticalSortableContext onDrop={onDrop} itemIds={sortableColumnIds}>
      <ColumnListNav columns={sortableColumns} {...props} />
    </VerticalSortableContext>
  )
}

const BoxFeedbackCommitState = styled(Box)`
  &.reorder-commit-state-feedback {
    opacity: 0;
  }
  &.reorder-commit-state-feedback.enter {
    opacity: 1;
  }
  &.reorder-commit-state-feedback.enter-done {
    opacity: 0;
    transition: opacity ${reorderFeedbackTimeout}ms;
  }
`

function ColumnListNav({
  columns,
  reorderCommitState,
  addNewAnchorRef,
  onNewField,
  onFieldNavCallback,
}: ColumnListProps) {
  const saveFeedbackRef = useRef<HTMLLIElement | null>(null)
  const {getDropSide} = useDragAndDrop()

  return (
    <NavList.Group
      sx={{position: 'relative', minWidth: 220}}
      title="Custom fields"
      {...testIdProps(`project-column-settings-list`)}
    >
      <ActionList.Item
        ref={addNewAnchorRef}
        role="button"
        sx={{
          color: 'accent.fg',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 'auto',
          py: 1,
        }}
        onSelect={onNewField}
      >
        <ActionList.LeadingVisual sx={{color: 'inherit'}}>
          <PlusIcon />
        </ActionList.LeadingVisual>
        New field
      </ActionList.Item>
      {useMemo(
        () =>
          columns.map(col => (
            <ColumnListItem
              key={col.id}
              column={col}
              dropSide={getDropSide(col.databaseId)}
              onLinkClick={(e: React.MouseEvent) => {
                if (!onFieldNavCallback) return
                onFieldNavCallback(col.id, e)
              }}
            />
          )),
        [columns, getDropSide, onFieldNavCallback],
      )}
      <CSSTransition
        in={reorderCommitState === 'success'}
        nodeRef={saveFeedbackRef}
        timeout={reorderFeedbackTimeout}
        className="reorder-commit-state-feedback"
      >
        <BoxFeedbackCommitState
          as="li"
          aria-live="polite"
          ref={saveFeedbackRef}
          sx={{
            color: 'success.fg',
            textAlign: 'right',
            p: 1,
            mx: 2,
            userSelect: 'none',
          }}
        >
          <Text sx={{color: 'inherit', px: 1}}>
            <CheckIcon />
          </Text>
          Saved
        </BoxFeedbackCommitState>
      </CSSTransition>
    </NavList.Group>
  )
}

/**
 * A "sash" is a thick blue vertical bar displayed on top or bottom to indicate
 * where a dragged item will land.
 */
const BoxWithDropSash = styled(Box).attrs({
  sx: {position: 'relative', display: 'flex', userSelect: 'none'},
})`
  /* stylelint-disable */
  a {
    user-drag: none;
  }

  &:after,
  &:before {
    content: '';
    display: none;
    position: absolute;
    left: -6px;
    right: -6px;
    background-color: ${themeGet('colors.accent.emphasis')};
    height: ${themeGet('space.1')};
    border: 0;
    border-radius: 6px;
    z-index: 12;
  }

  body.is-dragging &.show-sash-after {
    &:after {
      display: block;
      bottom: -6px;
      transform: translateY(50%);
    }
  }

  body.is-dragging &.show-sash-before {
    &:before {
      display: block;
      top: -6px;
      transform: translateY(-50%);
    }
  }

  body.is-dragging &.show-sash-before,
  body.is-dragging &.show-sash-after {
    .projectColumItemLeadingVisual .projectColumnGrabber {
      display: none;
    }
    .projectColumItemLeadingVisual .projectColumnIcon {
      display: inline-block;
    }
  }

  .projectColumItemLeadingVisual .projectColumnGrabber {
    display: none;
    cursor: grab;
  }
  body:not(.is-dragging) &:hover {
    .projectColumItemLeadingVisual .projectColumnGrabber {
      display: inline-block;
    }
    .projectColumItemLeadingVisual .projectColumnIcon {
      display: none;
    }
  }
`

type ColumnListItemProps = {
  column: ColumnModel
  dropSide: DropSide | null
  onLinkClick: (e: React.MouseEvent) => void
}

function ColumnListItem({column, dropSide, onLinkClick}: ColumnListItemProps) {
  const metadata = useMemo(() => ({id: column.databaseId}), [column.databaseId])
  const projectRouteParams = useProjectRouteParams()

  const Icon = getColumnIcon(column.dataType)

  const {setNodeRef, setActivatorNodeRef, listeners} = useSortable({
    id: column.databaseId,
    data: {metadata},
  })

  const className = clsx({
    [`show-sash-${dropSide}`]: dropSide,
  })

  const showColumnWarning = !!getColumnWarning(column)

  return (
    <NavLinkActionListItem
      to={{
        pathname: PROJECT_SETTINGS_FIELD_ROUTE.generatePath({
          ...projectRouteParams,
          fieldId: encodeURIComponent(column.id),
        }),
      }}
      onClick={onLinkClick}
      {...testIdProps(`ColumnSettingsItem{id: ${column.name}}`)}
    >
      <BoxWithDropSash ref={setNodeRef} className={className}>
        {/* eslint-disable-next-line primer-react/direct-slot-children */}
        <NavList.LeadingVisual
          className="projectColumItemLeadingVisual"
          {...testIdProps(`ColumnSettingsItemIcon{id: ${column.name}}`)}
        >
          <span className="projectColumnGrabber" ref={setActivatorNodeRef} {...listeners}>
            <GrabberIcon />
          </span>
          <span className="projectColumnIcon">
            <Icon />
          </span>
        </NavList.LeadingVisual>
        {column.name}
      </BoxWithDropSash>
      {showColumnWarning && (
        // eslint-disable-next-line primer-react/direct-slot-children
        <NavList.TrailingVisual {...testIdProps(`ColumnSettingsItemBadge{id: ${column.name}}`)}>
          <Label variant="attention">Action required</Label>
        </NavList.TrailingVisual>
      )}
    </NavLinkActionListItem>
  )
}
