import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {forwardRef, memo, useCallback, useEffect, useId, useMemo, useReducer, useRef, useState} from 'react'

import {partition} from '../../../utils/partition'
import {BoardColumnPlusHide, BoardColumnPlusShow} from '../../api/stats/contracts'
import {useVerticalGroupedBy} from '../../features/grouping/hooks/use-vertical-grouped-by'
import {normalizeGroupName} from '../../features/grouping/utils'
import {getInitialState} from '../../helpers/initial-state'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useIsDraggingWithIds} from '../../hooks/drag-and-drop/drag-and-drop'
import {getVerticalGroupsForField, MissingVerticalGroupId, type VerticalGroup} from '../../models/vertical-group'
import {
  filterMatches,
  normalizeToFilterName,
  type OrderedTokenizedFilters,
  splitFieldFilters,
} from '../filter-bar/helpers/search-filter'
import {useSearch} from '../filter-bar/search-context'

type Props = {
  /** A callback when the user clicks this button */
  onClick: () => void
}

/**
 * Render a button that allows the user to add a new column.
 */
export const AddNewColumnOption = memo(
  forwardRef<HTMLButtonElement, Props>(({onClick}, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [columnOptionClickCount, incrementColumnOptionClickCount] = useReducer((state: number) => state + 1, 0)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const {dragType} = useIsDraggingWithIds()
    const {orderedTokenizedFilters, insertFilter} = useSearch()
    const {groupedByColumn} = useVerticalGroupedBy()
    const {postStats} = usePostStats()
    const menuAnchorRef = useRef<HTMLButtonElement | null>(null)
    const buttonId = useId()

    const {
      projectLimits: {singleSelectColumnOptionsLimit},
    } = getInitialState()

    useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }
      window.addEventListener('keydown', handleEsc)

      return () => {
        window.removeEventListener('keydown', handleEsc)
      }
    }, [])

    const [columnOptions, columnCount] = useMemo(() => {
      const groups = getVerticalGroupsForField(groupedByColumn)
      const groupedByFieldName = groupedByColumn?.name && normalizeToFilterName(groupedByColumn.name)
      const fieldFilters = orderedTokenizedFilters.filter(f => f.type === 'field' && f.field === groupedByFieldName)
      const {included: includedFilters, excluded: excludedFilters} = groupFilteredOptionsByExclude(fieldFilters)
      const count = groups.filter(group => group.id !== MissingVerticalGroupId).length

      const options = groups
        .filter(group => group.id !== MissingVerticalGroupId)
        .map(group => ({
          id: group.id,
          text: group.name,
          selected: isGroupOptionSelected(group, includedFilters, excludedFilters),
        }))

      return [options, count]
    }, [groupedByColumn, orderedTokenizedFilters])

    const [visibleOptions, hiddenOptions] = partition(columnOptions, option => option.selected)
    // If a user toggles a column, we want to ensure that the menu is still in view
    // columnOptionClickCount save in state when adding/removing column and scrolled here
    // to avoid timing issues
    useEffect(() => {
      if (columnOptionClickCount > 0 && containerRef.current) {
        containerRef?.current?.scrollIntoView()
      }
    }, [columnOptionClickCount])

    const previousColumnCountRef = useRef(columnCount)

    // if a new column is added ensure that the menu is visible after adding
    useEffect(() => {
      // ensure that the column count has only increased by 1
      if (columnCount > 0 && columnCount === previousColumnCountRef.current + 1) {
        containerRef?.current?.scrollIntoView({behavior: 'smooth'})
      }

      previousColumnCountRef.current = columnCount
    }, [columnCount])

    const showColumnOnClick = useCallback(
      (columnName: string) => {
        if (groupedByColumn?.name) {
          const {dataType, databaseId, name} = groupedByColumn

          // correctly handle multi-word column names
          insertFilter(normalizeToFilterName(name), columnName)
          incrementColumnOptionClickCount()
          postStats({
            name: BoardColumnPlusShow,
            context: JSON.stringify({dataType, databaseId, name}),
          })
        }
      },
      [incrementColumnOptionClickCount, groupedByColumn, insertFilter, postStats],
    )

    const hideColumnOnClick = useCallback(
      (columnName: string) => {
        if (groupedByColumn?.name) {
          const {dataType, databaseId, name} = groupedByColumn

          // correctly handle multi-word column names
          insertFilter(`-${normalizeToFilterName(name)}`, columnName)
          incrementColumnOptionClickCount()
          postStats({
            name: BoardColumnPlusHide,
            context: JSON.stringify({dataType, databaseId, name}),
          })
        }
      },
      [incrementColumnOptionClickCount, groupedByColumn, insertFilter, postStats],
    )

    const plusOnClick = useCallback(() => {
      setIsOpen(true)
    }, [])

    // We want to hide this button while dragging columns on the board.
    return dragType === 'column' ? null : (
      <>
        <Tooltip text="Add a new column to the board" ref={menuAnchorRef} type="label">
          <Button
            leadingVisual={PlusIcon}
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={plusOnClick}
            size="small"
            {...testIdProps('add-new-column-button')}
          />
        </Tooltip>
        <ActionMenu open={isOpen} anchorRef={menuAnchorRef}>
          <ActionMenu.Overlay
            onEscape={() => setIsOpen(false)}
            onClickOutside={() => setIsOpen(false)}
            aria-labelledby={buttonId}
          >
            <ActionList {...testIdProps('add-new-column-menu')}>
              <ActionList.Group>
                <ActionList.Item
                  key={'new-column-button'}
                  as="button"
                  onSelect={onClick}
                  disabled={
                    groupedByColumn?.dataType === 'singleSelect' && columnCount >= singleSelectColumnOptionsLimit
                  }
                  ref={ref}
                >
                  <ActionList.LeadingVisual>
                    <PlusIcon />
                  </ActionList.LeadingVisual>
                  New Column
                </ActionList.Item>
              </ActionList.Group>
              <ActionList.Divider />
              <ActionList.Group selectionVariant="multiple">
                <ActionList.GroupHeading>Visible columns</ActionList.GroupHeading>
                {visibleOptions.map(option => (
                  <ActionList.Item key={option.text} selected onSelect={() => hideColumnOnClick(option.text)}>
                    {option.text}
                  </ActionList.Item>
                ))}
              </ActionList.Group>
              <ActionList.Group selectionVariant="multiple">
                <ActionList.GroupHeading>Hidden columns</ActionList.GroupHeading>
                {hiddenOptions.map(option => (
                  <ActionList.Item
                    key={option.text}
                    selected={false}
                    onSelect={() => showColumnOnClick(option.text)}
                    role="menuitemcheckbox"
                  >
                    {option.text}
                  </ActionList.Item>
                ))}
              </ActionList.Group>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </>
    )
  }),
)

// This function is used to group the filter options by exclude/include
function groupFilteredOptionsByExclude(filters: OrderedTokenizedFilters): {
  included: Set<string>
  excluded: Set<string>
} {
  return filters.reduce(
    (acc, filter) => {
      if (filter.type === 'field') {
        for (const fieldOption of splitFieldFilters(filter.value)) {
          acc[filter.exclude ? 'excluded' : 'included'].add(fieldOption)
        }
      }
      return acc
    },
    {included: new Set<string>(), excluded: new Set<string>()},
  )
}

function isGroupOptionSelected(group: VerticalGroup, includedFilters: Set<string>, excludedFilters: Set<string>) {
  const name = normalizeGroupName(group)

  if (includedFilters.size > 0 && !filterMatches(Array.from(includedFilters), name)) {
    return false
  }

  if (filterMatches(Array.from(excludedFilters), name)) {
    return false
  }

  return true
}

AddNewColumnOption.displayName = 'AddNewColumnOption'
