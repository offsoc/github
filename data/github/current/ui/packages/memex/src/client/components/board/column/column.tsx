import {useDndContext, useDroppable} from '@github-ui/drag-and-drop'
import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {PlusIcon} from '@primer/octicons-react'
import {Box, Button, Spinner} from '@primer/react'
import {clsx} from 'clsx'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import styled, {keyframes} from 'styled-components'

import {ItemType} from '../../../api/memex-items/item-type'
import {BoardColumnMenuHide} from '../../../api/stats/contracts'
import {useVerticalGroupedBy} from '../../../features/grouping/hooks/use-vertical-grouped-by'
import {getGroupFooterPlaceholder, shouldDisableGroupFooter} from '../../../helpers/board-group-utilities'
import {resetScrollPositionImmediately} from '../../../helpers/scroll-utilities'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {DROP_TYPE_ATTRIBUTE} from '../../../hooks/drag-and-drop/attributes'
import {useDragWithIds} from '../../../hooks/drag-and-drop/drag-and-drop'
import {useAggregationSettings} from '../../../hooks/use-aggregation-settings'
import useAutoScroll from '../../../hooks/use-auto-scroll'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useSortedBy} from '../../../hooks/use-sorted-by'
import {LoadingStates, useViewLoadingState} from '../../../hooks/use-view-loading-state'
import {useViews} from '../../../hooks/use-views'
import {isAnySingleSelectColumnModel} from '../../../models/column-model/guards'
import type {GroupedHorizontalGroup, HorizontalGroup} from '../../../models/horizontal-group'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {isSingleSelectOption, type VerticalGroup} from '../../../models/vertical-group'
import {handleKeyboardNavigation, suppressEvents} from '../../../navigation/keyboard'
import type {VerticalGroupColumnData} from '../../../state-providers/columns/use-update-vertical-group'
import type {GroupId} from '../../../state-providers/memex-items/queries/query-keys'
import {Resources} from '../../../strings'
import {AggregateLabels} from '../../common/aggregate-labels'
import {GroupMenu} from '../../common/group-menu'
import {SanitizedHtml} from '../../dom/sanitized-html'
import {CurrentIterationLabel} from '../../fields/iteration/iteration-label'
import {SingleSelectOptionModal} from '../../fields/single-select/single-select-option-modal'
import {normalizeToFilterName} from '../../filter-bar/helpers/search-filter'
import {useSearch} from '../../filter-bar/search-context'
import {type BoardDndEventData, isBoardDndCardData, isBoardDndColumnData} from '../board-dnd-context'
import {BoardPagination} from '../board-pagination'
import {DraggableCard} from '../card/draggable-card'
import {KeyboardMovingCardPlaceholder} from '../card/keyboard-moving-card-placeholder'
import {CARD_SIZE_ESTIMATE, COLUMN_PADDING, COLUMN_STYLE} from '../constants'
import {EmptyColumnSash} from '../empty-column-sash'
import {useCardSelection} from '../hooks/use-card-selection'
import {useColumnLimit} from '../hooks/use-column-limit'
import {ObserverProvider} from '../hooks/use-is-visible'
import {useOmnibarVisibility} from '../hooks/use-omnibar-visibility'
import {isAddItemFocus, isFooterFocus, useBoardNavigation, useStableBoardNavigation} from '../navigation'
import {COLUMN_WIDTH, ColumnFrame} from './column-frame'
import {ColumnLimitModal} from './column-limit-modal'
import {EditableColumnName} from './editable-column-name'

export type ColumnHeaderType = 'only' | 'hidden' | 'visible'

type ColumnProps = {
  /** The vertical group represented by this column */
  verticalGroup: VerticalGroup

  /** Server generated ID for making paginated requests */
  groupId?: GroupId

  /** The list of items belonging to this column */
  items: ReadonlyArray<MemexItemModel>

  /** The index of this column in the board */
  index: number

  /** Whether this column is editable by the user */
  isUserEditable: boolean

  /** Whether this column is editable by the user */
  isDraggable: boolean

  /**
   * Whether to scroll this column to an item on render
   *
   * This is useful to control scrolling to cards as new items are added to the
   * board.
   */
  scrollToItemId?: number

  /**
   * Whether to focus on the column name on initial render
   *
   * This is used to focus the names of columns after users add them.
   */
  initialNameFocus?: boolean

  /** A callback indicating the user wants to delete this column */
  onDelete?: (id: string) => Promise<void>

  /** A callback indicating the user wants to rename this column */
  onUpdateDetails: (updated: VerticalGroupColumnData, rollback: VerticalGroupColumnData) => Promise<void>

  /**
   * Does the vertical group correspond to an iteration which is the `current` iteration?
   */
  isCurrentIteration: boolean

  /**
   * Iteration date ranges for group by iteration titles
   */
  iterationDateRange: string

  /** Whether the column is hidden or not */
  hidden?: boolean

  /** Whether the column is part of the last horizontal grouping */
  isLastGroup?: boolean

  /**
   * The horizontal group applied, if there is one
   */
  horizontalGroup?: HorizontalGroup
  /** The type of header to render:
   * 'only': only the header, no items are rendered
   * 'hidden': no header is rendered
   * 'visible': the header and items are rendered
   */
  headerType?: ColumnHeaderType

  horizontalGroupIndex: number
  totalCount?: number
}

const COLUMN_HAS_OUTLINE_ATTRIBUTE = 'data-board-column-has-outline'

/**
 * Render a draggable board column.
 */
export const Column = memo(function Column({
  verticalGroup,
  groupId,
  items,
  index,
  scrollToItemId,
  initialNameFocus,
  onDelete,
  onUpdateDetails,
  isDraggable,
  isUserEditable,
  isCurrentIteration,
  iterationDateRange,
  hidden,
  horizontalGroup,
  horizontalGroupIndex,
  headerType = 'visible',
  isLastGroup,
  // default this to 0 instead of items.length as it will be easier to see the issue in bug reports if it is 0
  // and not just the number of loaded items
  totalCount = 0,
}: React.PropsWithChildren<ColumnProps>) {
  const {groupMetadata} = verticalGroup
  const {currentView} = useViews()
  const currentViewNumber = currentView?.number
  const dragRef = useRef<HTMLDivElement | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)
  const dndContext = useDndContext()
  const isDragging = dndContext.active !== null
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [isEditingColumnLimit, setIsEditingColumnLimit] = useState(false)
  const {enableOmnibar} = useOmnibarVisibility()
  const {state: focusState} = useBoardNavigation()
  const {hasWritePermissions} = ViewerPrivileges()
  const {resetSelection, filteredSelectedCards} = useCardSelection()
  const {insertFilter} = useSearch()
  const {groupedByColumn} = useVerticalGroupedBy()
  const {postStats} = usePostStats()
  const {isSorted} = useSortedBy()
  const {columnLimit, updateColumnLimit} = useColumnLimit(verticalGroup)
  const overData: unknown = dndContext.over?.data.current
  const activeDragData: unknown = dndContext.active?.data.current
  const horizontalGroupId = horizontalGroup && 'value' in horizontalGroup ? horizontalGroup.value : undefined
  const isDraggingOverColumn =
    isBoardDndColumnData(overData) &&
    overData.verticalGroup.id === verticalGroup.id &&
    horizontalGroupIndex === overData.horizontalGroupIndex
  const isDraggingOverCardInColumn =
    isBoardDndCardData(overData) &&
    overData.verticalGroup.id === verticalGroup.id &&
    horizontalGroupIndex === overData.horizontalGroupIndex
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const {navigationDispatch} = useStableBoardNavigation()
  const {memex_table_without_limits} = useEnabledFeatures()

  const isDraggingOver = isDraggingOverColumn || isDraggingOverCardInColumn

  const showEmptyColumnSash = isDraggingOver && items.length === 0 && !isSorted && filteredSelectedCards.length <= 1

  const metadata = useMemo(() => ({id: verticalGroup.groupMetadata?.id}), [verticalGroup.groupMetadata?.id])

  const isAddItemDisabled = horizontalGroup?.sourceObject && shouldDisableGroupFooter(horizontalGroup.sourceObject)

  const drag = useDragWithIds({
    dragAxis: 'horizontal',
    dragID: verticalGroup.id,
    dragType: 'column',
    dragIndex: index,
    dragRef,
    disable: !isUserEditable || !isDraggable,
    metadata,
  })

  const {setNodeRef} = useDroppable({
    id: horizontalGroupId ? `${horizontalGroupId}-${verticalGroup.id}` : verticalGroup.id,
    data: {
      verticalGroup,
      type: 'column',
      ref: dragRef,
      index,
      horizontalGroupIndex,
    } satisfies BoardDndEventData,
  })
  setNodeRef(dragRef.current)

  useAutoScroll({
    active: isBoardDndCardData(activeDragData) && isDraggingOverCardInColumn,
    scrollRef: dropRef,
    strength: 50,
    deadZoneRatioY: 0.5,
  })

  const focusedCard = focusState.focus?.type === 'coordinate' ? focusState.focus : null

  const isMovingOverViaKeyboard = focusedCard?.details.x === index && !!focusedCard?.details.meta.keyboardMovingCard
  const isMovingCardsToColumn = isDraggingOver || isMovingOverViaKeyboard
  // Sash position is irrelevant when a column is sorted, so show the column outline instead
  const isMovingCardsToSortedColumn = isSorted && isMovingCardsToColumn
  // Cannot drag multiple cards to a particular position, so show column outline instead
  const isMovingMultipleCardsToColumn =
    isMovingCardsToColumn &&
    (filteredSelectedCards.length > 1 || (focusedCard?.details.meta.keyboardMovingCard?.cardIds.length ?? 0) > 1)
  const showColumnOutline = isMovingCardsToSortedColumn || isMovingMultipleCardsToColumn

  const hideColumnOnClick = useCallback(() => {
    if (groupedByColumn?.name) {
      const {dataType: groupDataType, databaseId, name} = groupedByColumn

      // correctly handle multi-word column names
      insertFilter(`-${normalizeToFilterName(groupedByColumn.name)}`, verticalGroup.name)
      postStats({
        name: BoardColumnMenuHide,
        context: JSON.stringify({dataType: groupDataType, databaseId, name}),
      })
    }
  }, [groupedByColumn, verticalGroup.name, insertFilter, postStats])

  const renameOnClick = useCallback(() => {
    setIsEditingName(true)
  }, [])

  const submitRenameColumn = useCallback(
    (newName: string) => {
      if (!verticalGroup.groupMetadata?.id) return
      const update = {id: verticalGroup.groupMetadata?.id, name: newName}
      const rollback = {id: verticalGroup.groupMetadata?.id, name: verticalGroup.nameHtml}
      onUpdateDetails(update, rollback)
    },
    [onUpdateDetails, verticalGroup.nameHtml, verticalGroup.groupMetadata?.id],
  )

  const submitEditColumnLimit = async (limit: number | undefined) => {
    await updateColumnLimit(limit)
    setIsEditingColumnLimit(false)
  }

  const submitEditColumnDetails = (details: VerticalGroupColumnData) => {
    if (groupMetadata) {
      onUpdateDetails(details, groupMetadata)
    }
    setIsEditingDetails(false)
  }

  const addItem = useCallback(() => {
    enableOmnibar({columnId: verticalGroup.id, horizontalGroupIndex})
  }, [enableOmnibar, verticalGroup.id, horizontalGroupIndex])

  const onAddItemClick: React.MouseEventHandler = useCallback(
    e => {
      e.stopPropagation()
      addItem()
    },
    [addItem],
  )

  const onClick: React.MouseEventHandler = useCallback(() => {
    resetSelection()
  }, [resetSelection])

  const isAddItemButtonFocus =
    isAddItemFocus(focusState.focus) &&
    !isAddItemDisabled &&
    focusState.focus.details.verticalGroupId === verticalGroup.id &&
    horizontalGroupIndex === focusState.focus.details.horizontalGroupIndex

  const isAddingNewItems = isFooterFocus(focusState.focus)
    ? focusState.focus.details.verticalGroupId === verticalGroup.id &&
      horizontalGroupIndex === focusState.focus.details.horizontalGroupIndex
    : false

  const columnShouldScroll = isFooterFocus(focusState.focus)
    ? focusState.focus.details.verticalGroupId === verticalGroup.id && !horizontalGroupId && !memex_table_without_limits
    : false

  useLayoutEffect(() => {
    resetScrollPositionImmediately(dropRef.current)
  }, [currentViewNumber])

  useEffect(() => {
    if (!isAddItemButtonFocus || !buttonRef.current) {
      return
    }
    buttonRef.current.focus()
    buttonRef.current.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'smooth'})
  }, [isAddItemButtonFocus])

  const onAddItemKeyDown: React.KeyboardEventHandler = useCallback(
    e => {
      const result = handleKeyboardNavigation(navigationDispatch, e)
      if (result.action) {
        suppressEvents(e)
      }
    },
    [navigationDispatch],
  )

  const {loadingState} = useViewLoadingState()

  const {hideItemsCount, getAggregatesForItems} = useAggregationSettings()
  const aggregates = useMemo(() => getAggregatesForItems(items), [items, getAggregatesForItems])

  const counterSx = {mr: 2, mt: 1, mb: 1}

  const editability = isAnySingleSelectColumnModel(groupedByColumn) ? 'singleSelectDetails' : 'name'

  const className = clsx(headerType, {
    'last-group': isLastGroup,
    'drag-outline': showColumnOutline,
  })

  return (
    <>
      <ColumnFrame
        id={verticalGroup.id}
        testingName={verticalGroup.name}
        sx={COLUMN_STYLE}
        ref={dragRef}
        {...drag.props}
        onClick={onClick}
        hidden={hidden}
        {...{[COLUMN_HAS_OUTLINE_ATTRIBUTE]: showColumnOutline}}
        className={className}
        headerContent={
          headerType === 'hidden' ? null : (
            <Box
              sx={{
                bg: 'canvas.inset',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                maxWidth: `${COLUMN_WIDTH}px`,
                pt: 2,
                pb: 1,
                px: 3,
                display: 'flex',
              }}
              {...drag.handle.props}
            >
              <Box
                sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', maxWidth: '90%', flexWrap: 'wrap'}}
              >
                <EditableColumnName
                  hideItemsCount={hideItemsCount}
                  columnLimit={columnLimit}
                  itemsCount={totalCount}
                  verticalGroup={verticalGroup}
                  onNameChange={submitRenameColumn}
                  isUserEditable={isUserEditable && editability === 'name'}
                  initialFocus={initialNameFocus}
                  isEditing={isEditingName}
                  loadingState={loadingState}
                  setIsEditing={setIsEditingName}
                />

                {loadingState === LoadingStates.loaded && (
                  <AggregateLabels
                    aggregates={aggregates}
                    counterSx={counterSx}
                    hideItemsCount
                    itemsCount={totalCount}
                  />
                )}

                {isCurrentIteration && <CurrentIterationLabel sx={{my: 1}} />}
              </Box>

              <Box sx={{backgroundColor: 'canvas.inset', alignItems: 'center', display: 'flex'}}>
                {loadingState === LoadingStates.loading ? (
                  <Spinner
                    size="small"
                    aria-label="Loading data required to properly display view"
                    {...testIdProps('view-loading-indicator')}
                  />
                ) : loadingState === LoadingStates.missing ? null : (
                  isUserEditable && (
                    <GroupMenu
                      items={items}
                      name={verticalGroup.name}
                      isColumn
                      onRename={editability === 'name' ? renameOnClick : undefined}
                      onEditDetails={
                        editability === 'singleSelectDetails' ? () => setIsEditingDetails(true) : undefined
                      }
                      onEditLimit={() => setIsEditingColumnLimit(true)}
                      onHide={hideColumnOnClick}
                      onDelete={!!groupMetadata && onDelete ? () => onDelete(groupMetadata.id) : undefined}
                    />
                  )
                )}
              </Box>
            </Box>
          )
        }
      >
        {headerType !== 'hidden' && iterationDateRange && (
          <Box
            sx={{
              bg: 'canvas.inset',
              maxWidth: `${COLUMN_WIDTH}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mt: -1,
              pb: 2,
              px: 3,
              color: 'fg.muted',
              flexShrink: 0,
            }}
            {...testIdProps(`${verticalGroup.id}-date-range-board-header`)}
          >
            {iterationDateRange}
          </Box>
        )}

        {headerType !== 'hidden' && (
          <SanitizedHtml
            sx={{
              mt: -1,
              pb: 2,
              px: 3,
              maxWidth: `${COLUMN_WIDTH}px`,
              color: 'fg.muted',
            }}
          >
            {isSingleSelectOption(groupMetadata) ? groupMetadata.descriptionHtml : ''}
          </SanitizedHtml>
        )}

        <Box
          ref={dropRef}
          className="column-drop-zone"
          {...testIdProps(`drop-zone-${verticalGroup.name}`)}
          {...{[DROP_TYPE_ATTRIBUTE]: 'card'}}
          sx={{
            flexDirection: 'column',
            backgroundColor: 'canvas.inset',
            flexGrow: 1,
            overflowY: 'auto',
            position: 'relative',
            px: 2,
            py: `${COLUMN_PADDING}px`,
            display: 'flex',
            scrollPaddingBottom: '7px',
          }}
        >
          {showEmptyColumnSash && <EmptyColumnSash />}
          {/* We use a `null` (for window) rootRef instead of the drop ref so
        that we still render while dragging */}
          <ObserverProvider rootRef={null} sizeEstimate={CARD_SIZE_ESTIMATE} disableHide={isDragging}>
            {headerType !== 'only' &&
              items.length > 0 &&
              items.map((item, cardIndex) => {
                const focusType =
                  focusedCard?.details.x === index && focusedCard?.details.y === item.id
                    ? focusedCard.focusType
                    : undefined
                // disable dragging if Memex is readonly or for RedactedItems
                const isDragDisabled = !hasWritePermissions || item.contentType === ItemType.RedactedItem

                return (
                  <DraggableCard
                    key={item.id}
                    item={item}
                    scrollIntoView={item.id === scrollToItemId}
                    index={cardIndex}
                    verticalGroup={verticalGroup}
                    columnIndex={index}
                    focusType={focusType}
                    keyboardMovingCard={focusedCard?.details.meta.keyboardMovingCard}
                    isDragDisabled={isDragDisabled}
                    horizontalGroupId={horizontalGroupId}
                    horizontalGroupIndex={horizontalGroupIndex}
                  />
                )
              })}
            {/* The placeholder sash is only rendered when:
              1) There are no items in the column (when there are items, sash will be rendered by the card)
              2) Items are actually being rendered in the column (i.e., not just a column header)
              3) The focus state is currently in this vertical group (column) and horizontal group ("swimlane")
              4) The focused card is actively being moved via the keyboard
             */}
            {items.length === 0 /* [1] */ &&
              headerType !== 'only' /* [2] */ &&
              focusedCard?.details.x === index /* [3] */ &&
              focusedCard?.details.meta.horizontalGroupIndex === horizontalGroupIndex /* [3] */ &&
              focusedCard?.details.meta.keyboardMovingCard /* [4] */ && (
                <KeyboardMovingCardPlaceholder
                  horizontalGroupIndex={horizontalGroupIndex}
                  verticalGroup={verticalGroup}
                  columnIndex={index}
                  focusType={focusedCard.focusType}
                  keyboardMovingCard={focusedCard.details.meta.keyboardMovingCard}
                />
              )}
          </ObserverProvider>

          {headerType !== 'only' && (
            <IsAddingItemsIndicator isVisible={isAddingNewItems} shouldScroll={columnShouldScroll} />
          )}
          {memex_table_without_limits && headerType !== 'only' && groupId && (
            <BoardPagination
              pageType={{
                groupId,
                secondaryGroupId: hasServerGroupId(horizontalGroup) ? horizontalGroup.serverGroupId : undefined,
              }}
            />
          )}
        </Box>

        {headerType !== 'only' && hasWritePermissions && (
          <Button
            onClick={onAddItemClick}
            ref={buttonRef}
            variant="invisible"
            sx={{
              color: 'fg.muted',
              display: 'flex',
              py: 2,
              '& [data-component="buttonContent"]': {
                flex: 0,
              },
            }}
            block
            size="large"
            leadingVisual={PlusIcon}
            {...testIdProps('board-view-add-card-button')}
            disabled={isAddItemDisabled}
            onKeyDown={onAddItemKeyDown}
            title={
              (horizontalGroup?.sourceObject && getGroupFooterPlaceholder(horizontalGroup.sourceObject)) ||
              Resources.addItem
            }
          >
            {Resources.addItem}
          </Button>
        )}
      </ColumnFrame>

      {isEditingColumnLimit && (
        <ColumnLimitModal
          initialColumnLimit={columnLimit}
          onCancel={() => setIsEditingColumnLimit(false)}
          onSave={submitEditColumnLimit}
        />
      )}
      {isEditingDetails && isSingleSelectOption(groupMetadata) && (
        <SingleSelectOptionModal
          initialOption={groupMetadata}
          onCancel={() => setIsEditingDetails(false)}
          onSave={updatedOption => submitEditColumnDetails({...groupMetadata, ...updatedOption})}
        />
      )}
    </>
  )
})

const IsAddingItemsIndicator = ({isVisible, shouldScroll}: {isVisible: boolean; shouldScroll: boolean}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldScroll) {
      ref.current?.scrollIntoView({behavior: 'smooth'})
    }
  }, [shouldScroll])

  return isVisible ? (
    <StyledPlaceholder
      ref={ref}
      sx={{
        flexShrink: 0,
        height: '8px',
        bg: 'accent.emphasis',
        border: '0',
        borderRadius: '6px',
        mb: '12px',
      }}
      {...testIdProps('board-view-add-card-indicator')}
    />
  ) : null
}

const fadeIn = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `

const StyledPlaceholder = styled(Box)`
  animation: ${fadeIn} 0.2s ease-out;
`

function hasServerGroupId(horizontalGroup: HorizontalGroup | undefined): horizontalGroup is GroupedHorizontalGroup {
  return horizontalGroup != null && 'serverGroupId' in horizontalGroup
}
