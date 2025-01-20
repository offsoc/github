import {testIdProps} from '@github-ui/test-id-props'
import useIsMounted from '@github-ui/use-is-mounted'
import {useSyncedState} from '@github-ui/use-synced-state'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {CircleSlashIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import type {GroupedListProps} from '@primer/react/lib-esm/deprecated/ActionList/List'
import type {SelectPanelProps} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {useCallback, useEffect, useMemo, useRef} from 'react'
import invariant from 'tiny-invariant'

import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {ItemValueAdd, ItemValueEdit} from '../../api/stats/contracts'
import {SelectMenuError} from '../../components/common/select-menu/select-menu-error'
import {getInitialState} from '../../helpers/initial-state'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {parseColumnId} from '../../helpers/parsing'
import type {FuzzyFilterData} from '../../helpers/suggester'
import type {SupportedSuggestionOptions} from '../../helpers/suggestions'
import {usePostStats} from '../common/use-post-stats'
import {useSelectMenuFilter} from '../common/use-select-menu-filter'

const noMatchesItem = {
  leadingVisual: CircleSlashIcon,
  text: 'No matches',
  disabled: true,
  selected: undefined, // hide checkbox
  key: 'no-matches',
  ...testIdProps('table-cell-editor-empty-row'),
}

const defaultBlankslateItem = {
  leadingVisual: undefined, // don't render icon
  text: 'Nothing to show',
  disabled: true,
  selected: undefined, // hide checkbox
  key: 'blankslate',
  ...testIdProps('table-cell-editor-blankslate-row'),
}

// Maximum number of suggestions shown by this editor
const MULTI_SELECT_MAX_SUGGESTIONS = 12

type UseSelectPanelOpenChange = (
  nextOpen: Parameters<SelectPanelProps['onOpenChange']>[0],
  gesture?: Parameters<SelectPanelProps['onOpenChange']>[1] | 'convert-confirmation',
  event?: React.KeyboardEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
) => void

export type UseSelectPanelProps<T extends SupportedSuggestionOptions> = {
  model: SidePanelItem
  selected: Array<T>
  initialFilterValue: string
  blankslateText?: string
  saveSelected: (selected: Array<T>) => Promise<void>
  onOpenChange: UseSelectPanelOpenChange
  /**
   * If `undefined`, the panel will always be visible when mounted and must be unmounted to
   * close and save.
   */
  open?: boolean
  fetchOptions: () => void
  options?: Array<T>
  filterOptions: (query: string, options: Array<T>, maxSuggestions: number) => FuzzyFilterData<T>
  getOptionMatchingFilterValue?: (filterValue: string, option: T) => T | null
  columnId: string
  getSortAttribute: (option: T) => string
  convertOptionToItem: (option: T, selectedItems: Array<T>) => ItemProps & T
  renderCreateNewOption?: (optionName: string) => ItemProps
  singleSelect?: boolean
  groupMetadata?: GroupedListProps['groupMetadata']
  placeholderText: string
  renderAnchor: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element
}

export function useSelectPanel<T extends SupportedSuggestionOptions>({
  model,
  selected: initialSelected,
  initialFilterValue,
  blankslateText,
  saveSelected,
  onOpenChange,
  open,
  fetchOptions,
  options,
  filterOptions,
  getOptionMatchingFilterValue,
  columnId,
  getSortAttribute,
  convertOptionToItem,
  renderCreateNewOption,
  singleSelect = false,
  groupMetadata,
  placeholderText,
  renderAnchor,
}: UseSelectPanelProps<T>) {
  const {projectLimits} = getInitialState()
  const {postStats} = usePostStats()
  const [selected, setSelected] = useSyncedState(initialSelected)

  const systemColumnId = parseColumnId(columnId)
  invariant(systemColumnId, 'systemColumnId must be defined')

  const {
    onOpen,
    setFilterValue,
    filterValue,
    suggestions: allOptions,
    filteredSuggestions: filteredOptions,
    error: fetchSuggestionsError,
  } = useSelectMenuFilter<T>({
    initialFilterValue,
    memexItemModel: model,
    columnId: systemColumnId,
    fetchSuggestions: fetchOptions,
    filterSuggestions: filterOptions,
    maxSuggestions: singleSelect ? projectLimits.singleSelectColumnOptionsLimit : MULTI_SELECT_MAX_SUGGESTIONS,
    options,
  })

  const trackingOnOpen = useTrackingRef(onOpen)
  // Fetch options immediately on render
  useEffect(() => {
    trackingOnOpen.current()
  }, [model, trackingOnOpen])

  const submitSelection = useCallback(
    (selectedOptions: Array<T>) => {
      saveSelected(selectedOptions)
      postStats({
        name: selected.length > 0 ? ItemValueEdit : ItemValueAdd,
        memexProjectColumnId: not_typesafe_nonNullAssertion(parseColumnId(columnId)),
        memexProjectItemId: model.itemId(),
      })
    },
    [columnId, model, postStats, saveSelected, selected.length],
  )

  const isMounted = useIsMounted()
  useEffect(() => {
    return () => {
      // Save multiselect state after unmount, regardless of how the unmount was triggered
      // Singleselect state was already saved in onSelectedChange

      if (open === undefined && !singleSelect && !isMounted()) {
        submitSelection(selected)
      }
    }
  }, [open, isMounted, selected, singleSelect, submitSelection])

  const prevOpenRef = useRef(open)
  useEffect(() => {
    // For controlled panels, save multiselect state on close instead of unmount
    if (prevOpenRef.current && !open && !singleSelect) submitSelection(selected)
    prevOpenRef.current = open
  }, [open, selected, singleSelect, submitSelection])

  const onSelectedChange = useCallback(
    (itemOrItems: Array<ItemProps> | ItemProps | undefined) => {
      // convert from single variant to multi variant because that's what is expected in submitSelection
      const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems].filter(item => item)
      const selectedOptions = (items as Array<T>).sort((a, b) => getSortAttribute(a).localeCompare(getSortAttribute(b)))
      setSelected(selectedOptions)

      if (singleSelect) {
        submitSelection(selectedOptions)
      }
    },
    [setSelected, singleSelect, getSortAttribute, submitSelection],
  )

  // Convert from Options to Items

  const optionMap = useMemo(() => {
    void convertOptionToItem // silence unused warning
    return new WeakMap<T, ItemProps>()
  }, [convertOptionToItem])
  const selectedOptionIdsSet = useMemo(() => new Set(selected.map(option => option.id)), [selected])

  const getItemFromOption = useCallback(
    (option: T) => {
      let item = optionMap.get(option)
      if (!item) {
        item = convertOptionToItem(option, selected)
        optionMap.set(option, item)
      }
      return item
    },
    [optionMap, convertOptionToItem, selected],
  )

  const filteredItems = useMemo<Array<ItemProps>>(() => {
    return (filteredOptions ?? []).map(getItemFromOption)
  }, [filteredOptions, getItemFromOption])

  const selectedItems = useMemo<ItemProps | Array<ItemProps>>(() => {
    if (singleSelect) {
      // the selected item list needs to be aware of whether filtering is
      // occurring to ensure it locates the right item, as the item selected may
      // not be visible by allOptions on initial render
      const availableOptions = filteredOptions ? filteredOptions : allOptions || []
      const items = availableOptions.filter(option => selectedOptionIdsSet.has(option.id)).map(getItemFromOption)
      return not_typesafe_nonNullAssertion(items[0])
    } else {
      // for multi-select cases we assume allOptions will have everything we
      // need, so we can disregard the filtered options
      const availableOptions = allOptions ?? []
      return availableOptions.filter(option => selectedOptionIdsSet.has(option.id)).map(getItemFromOption)
    }
  }, [filteredOptions, allOptions, getItemFromOption, singleSelect, selectedOptionIdsSet]) as Array<ItemProps>

  const shouldShowCreateOption =
    filterValue &&
    filteredOptions &&
    getOptionMatchingFilterValue &&
    !filteredOptions.some(option => getOptionMatchingFilterValue(filterValue, option))

  const computedBlankslateItem = useMemo(
    () => ({
      ...defaultBlankslateItem,
      text: blankslateText ?? defaultBlankslateItem.text,
    }),
    [blankslateText],
  )

  const items = [
    ...filteredItems.map(item => {
      if (singleSelect) {
        if (item.children) {
          item.children = <Text sx={{wordBreak: 'break-all'}}>{item.children}</Text>
        }
        item.onAction = (itemFromAction, event) => {
          event.preventDefault()
          onSelectedChange((selectedItems as ItemProps) === item ? undefined : item)
          onOpenChange(false, 'selection', event)
        }
      }

      return item
    }),
    ...(!filterValue && !filteredItems.length && blankslateText ? [computedBlankslateItem] : []),
    ...(filterValue && !filteredItems.length && !renderCreateNewOption ? [noMatchesItem] : []),
    ...(shouldShowCreateOption && renderCreateNewOption ? [renderCreateNewOption(filterValue)] : []),
  ]
  const renderErrorItem = useCallback(() => {
    if (!fetchSuggestionsError) return <></>
    return <SelectMenuError error={fetchSuggestionsError} />
  }, [fetchSuggestionsError])

  const props: SelectPanelProps = {
    open: open ?? true,
    showItemDividers: true,
    onSelectedChange,
    selected: selectedItems,
    filterValue,
    onFilterChange: setFilterValue,
    onOpenChange,
    items,
    loading: !filteredOptions && !fetchSuggestionsError,
    placeholderText,
    renderAnchor,
  }

  if (groupMetadata) {
    props.groupMetadata = groupMetadata.filter(group => {
      return items.some(item => 'groupId' in item && item.groupId === group.groupId)
    })
  }

  if (fetchSuggestionsError) {
    props.renderItem = renderErrorItem
    props.textInputProps = {disabled: true}
    props.items = [{}]
    return {
      ...props,
      ...testIdProps(`table-cell-editor-error`),
    }
  }

  return props
}
