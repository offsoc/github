import type {TextInputProps} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {SpaceProps, TypographyProps} from 'styled-system'

import type {Repository} from '../api/common-contracts'
import type {RepositoryItem} from '../api/repository/contracts'
import {useAutocomplete} from '../hooks/common/use-autocomplete'
import {useComboboxMenuVisibilityBehavior} from '../hooks/common/use-combobox-menu-visibility-behavior'
import {FocusType, NavigationDirection} from '../navigation/types'
import {Resources} from '../strings'
import {useStartIssueCreator} from './issue-creator'
import {moveTableFocus, useStableTableNavigation} from './react_table/navigation'
import {
  type ADD_MULTIPLE_ITEMS,
  ADD_MULTIPLE_ITEMS_KEY,
  type CREATE_ISSUE,
  CREATE_ISSUE_KEY,
  SuggestedItemList,
} from './suggested-item-list'

/**
 * A callback used to render the item picker input.
 */
export type RenderInput = (props: TextInputProps & TypographyProps & SpaceProps) => React.ReactElement

export type ItemPickerInteractionsProps = {
  /** Required callback to render the text element */
  renderInput: RenderInput

  /**
   * An optional ref to the input to which the behavior is being added.
   * If not provided, will be created and tracked by the useCombobox hook.
   **/
  inputRef?: React.RefObject<HTMLInputElement>

  /** Callback to invoke when user selects an item from the list */
  onItemSelected: (item: RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS) => Promise<void>

  /**
   * Callback to invoke when user presses Backspace/Escape to clear the
   * selected repository from the current context
   */
  onRemovePicker: () => void
}

type SuggestedItemPickerProps = ItemPickerInteractionsProps & {
  /** Whether or not filteredItems are currently being refreshed. */
  loading: boolean

  /** Set of filtered items to render in the suggested item list */
  filteredItems: Array<RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS>

  /**
   * Required callback to apply filtering to suggests as the user specifies
   * changes
   */
  onFilterTextChanged: (query: string) => void

  /** The current selected repository */
  repository: Repository
}

export const SuggestedItemPicker: React.FC<SuggestedItemPickerProps> = ({
  onItemSelected,
  onRemovePicker,
  onFilterTextChanged,
  inputRef,
  renderInput,
  loading,
  filteredItems,
  repository,
}) => {
  const {isOpen, setIsOpen, inputOnBlur, itemOnMouseDown, onResetListInteraction, inputOnFocus} =
    useComboboxMenuVisibilityBehavior()
  const containerRef = useRef<HTMLDivElement>(null)
  const {navigationDispatch} = useStableTableNavigation()
  const canCreateIssues = useStartIssueCreator() !== null
  const [query, setQuery] = useState<string | undefined>()

  const items = useMemo(() => {
    const listItems = Array.from(filteredItems)

    if (canCreateIssues) {
      listItems.push({
        type: CREATE_ISSUE_KEY,
        title: query,
        repository,
      })
    }

    if (filteredItems.length > 1) {
      listItems.push({
        type: ADD_MULTIPLE_ITEMS_KEY,
        title: query,
        repository,
      })
    }

    return listItems
  }, [filteredItems, canCreateIssues, query, repository])

  const onSelectedItemChange = useCallback(
    async (item: RepositoryItem | CREATE_ISSUE | ADD_MULTIPLE_ITEMS) => {
      onResetListInteraction()
      onItemSelected(item)
      setInputValue('')
      setQuery('')
      selectFirstItem()
    },
    // selectFirstItem and setInputValue are returned by the useCombobox hook
    // and this function is passed to that as a parameter, therefore, it cannot
    // easily define these two as dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, onResetListInteraction],
  )

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onFilterTextChanged(e.target.value)
  }

  const {getInputProps, getListProps, getItemProps, inputValue, selectFirstItem, setInputValue} = useAutocomplete(
    {
      items,
      onSelectedItemChange,
      isOpen,
    },
    inputRef,
  )

  useEffect(() => {
    if (isOpen) {
      selectFirstItem()
    }
  }, [isOpen, items, selectFirstItem])

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    switch (event.key) {
      case 'Backspace':
        if (!inputValue) {
          event.preventDefault()
          onRemovePicker()
        }
        break
      case 'Escape':
        onRemovePicker()
        event.stopPropagation()
        break
      case 'ArrowDown':
      case 'ArrowUp':
        if (isOpen) {
          // Do not propagate arrow key presses when open, as
          // they're used for cell navigation.
          event.stopPropagation()
        }
        break
      case 'Tab':
        /**
         * https://github.com/github/memex/issues/8527
         * @todo this does not work in production currently
         */
        onRemovePicker()
        requestAnimationFrame(() => {
          navigationDispatch(
            moveTableFocus({
              x: NavigationDirection.Second,
              y: NavigationDirection.Last,
              focusType: FocusType.Focus,
            }),
          )
        })
        break
    }
  }

  const onMouseDownWrap = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      // Stop default focus of element under
      // and keep multi-select on added items.
      e.stopPropagation()
      e.preventDefault()
      itemOnMouseDown()
    },
    [itemOnMouseDown],
  )

  const onComponentBlur = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <div
      ref={containerRef}
      onBlur={onComponentBlur}
      style={{position: 'relative', width: '100%', cursor: 'text', display: 'flex'}}
    >
      {renderInput({
        ...getInputProps({onFocus: inputOnFocus, onBlur: inputOnBlur, onChange: inputOnChange}),
        fontSize: 1,
        lineHeight: 1.5,
        placeholder: Resources.newItemFindIssuePlaceholder(canCreateIssues),
        'aria-label': Resources.newItemFindIssuePlaceholder(canCreateIssues),
        autoComplete: 'off',
        onKeyDown,
      })}
      <SuggestedItemList
        {...getListProps()}
        containerRef={containerRef}
        isOpen={isOpen}
        loading={loading}
        items={items}
        getItemProps={getItemProps}
        itemOnMouseDown={onMouseDownWrap}
        aria-label={Resources.newItemFindIssuePlaceholder(canCreateIssues)}
      />
    </div>
  )
}

SuggestedItemPicker.displayName = 'SuggestedItemPicker'
