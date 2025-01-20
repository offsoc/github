import {useKeyPress} from '@github-ui/use-key-press'
import {type OverlayProps, SelectPanel, type SelectPanelProps} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import type {RefObject} from 'react'
import type React from 'react'
import {useCallback, useEffect, useId, useMemo, useState} from 'react'

import {useItemPickersContext} from '../contexts/ItemPickersContext'
import {type ItemGroup, noMatchesItem, noResultsItem} from '../shared'
import {IDS} from '../constants/ids'
import {SELECTORS} from '../constants/selectors'
import {GlobalCommands, type CommandId} from '@github-ui/ui-commands'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

export type SharedBulkActionsItemPickerProps = {
  issuesToActOn: string[]
  useQueryForAction: boolean
  repositoryId?: string
  query?: string
  onCompleted?: (jobId?: string) => void
  onError?: (error: Error) => void
}

export type ItemPickerProps<T> = Pick<OverlayProps, 'height' | 'width'> & {
  items: Array<T & {__isNew__?: boolean}>
  initialSelectedItems: T[] | string[]
  openHotkey?: string
  placeholderText: string
  selectionVariant: 'single' | 'multiple'
  loading?: boolean
  groups?: ItemGroup[]
  filterItems: (filter: string) => void
  renderAnchor: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element
  getItemKey: (item: T) => string
  convertToItemProps: (item: T) => ExtendedItemProps<T>
  onSelectionChange: (items: T[]) => void
  onOpen?: () => void
  onClose?: () => void
  selectPanelRef?: RefObject<HTMLButtonElement>
  enforceAtleastOneSelected?: boolean
  insidePortal?: boolean
  maxVisibleItems?: number
  /**
   * Whether to render the item picker as a nested select panel (true) versus a standalone select
   * panel (false; default).
   */
  nested?: boolean
  resultListAriaLabel?: string
  title?: string | React.ReactElement
  subtitle?: string | React.ReactElement
  preventClose?: boolean
  triggerOpen?: boolean
  initialFilter?: string
  customNoResultsItem?: ItemProps
  customNoMatchItem?: T
  footer?: string | React.ReactElement
  keybindingCommandId?: CommandId
}

export type ExtendedItemProps<T> = ItemProps & {source: T}

export function ItemPicker<T>({
  items,
  initialSelectedItems,
  openHotkey,
  placeholderText,
  selectionVariant,
  loading,
  groups,
  filterItems,
  renderAnchor,
  getItemKey,
  convertToItemProps,
  onSelectionChange,
  onOpen,
  onClose,
  height = 'small',
  width = 'small',
  selectPanelRef,
  enforceAtleastOneSelected,
  insidePortal,
  maxVisibleItems = 9,
  nested = false,
  resultListAriaLabel,
  title,
  subtitle,
  preventClose,
  triggerOpen,
  initialFilter,
  customNoResultsItem,
  customNoMatchItem,
  footer,
  keybindingCommandId,
}: ItemPickerProps<T>) {
  const [open, setOpen] = useState(triggerOpen ?? false)
  const [selected, setSelected] = useState<ItemInput[]>([])
  const [filter, setFilter] = useState<string>(initialFilter ?? '')
  const {updateOpenState, anyItemPickerOpen} = useItemPickersContext()
  const id = useId()

  // Update open state if controlled by consumer
  useEffect(() => {
    if (triggerOpen !== undefined) setOpen(triggerOpen)
  }, [triggerOpen])
  const {issues_react_ui_commands_migration} = useFeatureFlags()

  const handleKeyDown = useCallback(() => {
    if (anyItemPickerOpen() || open) {
      return
    }
    setOpen(true)
    if (onOpen) onOpen()
  }, [anyItemPickerOpen, open, onOpen])

  const onHotKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (anyItemPickerOpen() || open) {
        return
      }
      // We don't want the filter to show the hotkey
      e.preventDefault()
      e.stopPropagation()
      setOpen(true)
      if (onOpen) onOpen()
    },
    [anyItemPickerOpen, open, onOpen],
  )

  useKeyPress(openHotkey ? [openHotkey] : [], onHotKeyPress, {
    triggerWhenInputElementHasFocus: false,
    triggerWhenPortalIsActive: insidePortal || false,
  })

  useEffect(() => {
    updateOpenState(id, open)
  }, [id, open, updateOpenState])

  const map = useMemo(
    () => new Map<string, ExtendedItemProps<T>>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, initialSelectedItems],
  )

  const toItemProps = useCallback(
    (item: T, itemSelected: boolean): ExtendedItemProps<T> => {
      const itemKey = getItemKey(item)
      let itemProps = map.get(itemKey)
      if (itemProps) {
        return itemProps
      }

      itemProps = convertToItemProps(item)

      itemProps.selected = itemSelected
      const onAction = itemProps.onAction
      itemProps.onAction = (props, event) => {
        const i = map.get(itemKey)
        if (!i) return
        i.selected = !i.selected

        // if using single select, clear selection of all other items
        if (selectionVariant === 'single' && (item as ItemProps).id !== filter) {
          for (const [, value] of map) {
            if (value !== i) {
              value.selected = false
            }
          }
        }

        if (onAction) {
          onAction(props, event)
        }
      }

      map.set(itemKey, itemProps)
      return itemProps
    },
    [convertToItemProps, filter, getItemKey, map, selectionVariant],
  )

  const wrappedGetItemKey = useCallback(
    (item: T | string) => (typeof item === 'string' ? item : getItemKey(item)),
    [getItemKey],
  )

  const selectPanelItems = useMemo<ItemProps[]>(() => {
    const itemProps = items.map(i => {
      // If we have newly created items, we remove the __isNew__ flag from the item
      // after selecting it, so that it can be deselected.
      // We also remove the "no match" item since clicking on it adds it to the selected items,
      // and we don't want to add that synthetic item to the mutation.
      if (i.__isNew__) {
        delete i.__isNew__
        customNoMatchItem && map.delete(getItemKey(customNoMatchItem))
        // We auto select newly created items
        return toItemProps(i, true)
      }
      return toItemProps(
        i,
        initialSelectedItems.some(is => wrappedGetItemKey(is) === getItemKey(i)),
      )
    })

    if (itemProps.length === 0) {
      if (customNoMatchItem) return [toItemProps(customNoMatchItem, false)]

      // Differentiate between no results and no matches
      return filter ? [customNoMatchItem ?? noMatchesItem] : [customNoResultsItem ?? noResultsItem]
    }

    return itemProps
  }, [
    customNoMatchItem,
    items,
    map,
    toItemProps,
    initialSelectedItems,
    wrappedGetItemKey,
    getItemKey,
    filter,
    customNoResultsItem,
  ])

  useEffect(() => {
    setSelected(selectPanelItems.filter(i => i.selected))
  }, [selectPanelItems])

  const selectPanelSelectedItems = useMemo<ItemInput | ItemInput[]>(() => {
    if (selectionVariant === 'single') {
      return selected[0]!
    } else {
      return selected
    }
  }, [selected, selectionVariant]) as ItemProps[]

  const onSelectedChange = useCallback(
    (param: ItemInput[] | ItemInput | undefined) => {
      if (param === undefined) {
        if (!enforceAtleastOneSelected) {
          setSelected([])
        }
        return
      }

      const selectedItemInputs = Array.isArray(param) ? param : [param]
      const newSelection = selectedItemInputs
        .map(i => selectPanelItems.find(item => i.id === item.id))
        .filter(i => i !== undefined) as Array<ExtendedItemProps<T>>

      setSelected(newSelection)
    },
    [enforceAtleastOneSelected, selectPanelItems],
  )

  const onSpaceKeyPress = (event: KeyboardEvent) => {
    if (open) {
      const activeOption = document.querySelector(SELECTORS.activePickerOption(IDS.itemPickerRootId))

      if (activeOption) {
        const activeDataId = activeOption.getAttribute('data-id')
        const item = [...map.values()].find(i => i.id === activeDataId)

        if (item) {
          event.preventDefault()
          event.stopPropagation()
          // Toggle the selected state of the item
          item.selected = !item.selected
          setSelected([...map.values()].filter(i => i.selected))
        }
      }
    }
  }

  useKeyPress([' '], onSpaceKeyPress, {
    triggerWhenInputElementHasFocus: true,
    triggerWhenPortalIsActive: true,
  })

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (preventClose && !isOpen) {
        return
      }
      setOpen(isOpen)

      if (isOpen && onOpen) {
        onOpen()
        return
      }

      setFilter('')
      if (onClose) onClose()
      const selectedItems = [...map.values()].filter(i => i.selected).map(i => i.source)
      const selectionChanged =
        selectedItems.length !== initialSelectedItems.length ||
        selectedItems.some(item => !initialSelectedItems.some(item2 => wrappedGetItemKey(item2) === getItemKey(item)))

      if (selectionChanged) {
        onSelectionChange(selectedItems)
      }
    },
    [preventClose, onClose, map, initialSelectedItems, onOpen, wrappedGetItemKey, getItemKey, onSelectionChange],
  )

  useEffect(() => {
    filterItems(filter)
  }, [filter, filterItems])

  let hasItems = selectPanelItems.length > 0
  if (
    selectPanelItems.length === 1 &&
    (selectPanelItems[0]!.id === noMatchesItem.id || selectPanelItems[0]!.id === noResultsItem.id)
  ) {
    // Don't show groups if there are only placeholder items (which aren't grouped)
    hasItems = false
  }

  // SelectPanel doesn't handle an empty groupMetadata prop properly
  const groupMetadataProp = useMemo(
    () => (groups && groups?.length > 1 && hasItems ? {groupMetadata: groups} : {}),
    [groups, hasItems],
  )

  const overlayHeight = selectPanelItems.length <= maxVisibleItems ? 'auto' : height

  const selectPanelProps = useMemo<SelectPanelProps>(
    () => ({
      renderAnchor,
      placeholderText,
      open,
      onOpenChange,
      loading,
      items: selectPanelItems,
      selected: selectPanelSelectedItems,
      onSelectedChange,
      filterValue: filter,
      onFilterChange: setFilter,
      showItemDividers: true,
      overlayProps: {width, height: overlayHeight},
      ...groupMetadataProp,
      'aria-label': resultListAriaLabel,
      'data-id': IDS.itemPickerRootId,
      'data-testid': IDS.itemPickerTestId,
      title,
      subtitle,
      footer,
    }),
    [
      renderAnchor,
      placeholderText,
      open,
      onOpenChange,
      loading,
      selectPanelItems,
      selectPanelSelectedItems,
      onSelectedChange,
      filter,
      width,
      overlayHeight,
      groupMetadataProp,
      resultListAriaLabel,
      title,
      subtitle,
      footer,
    ],
  )

  return (
    <>
      {issues_react_ui_commands_migration && keybindingCommandId && (
        <GlobalCommands commands={{[keybindingCommandId]: handleKeyDown}} />
      )}
      <SelectPanel anchorRef={nested ? undefined : selectPanelRef} {...selectPanelProps} />
    </>
  )
}
