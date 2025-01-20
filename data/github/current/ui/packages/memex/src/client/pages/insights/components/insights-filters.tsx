import {type ChangeEventHandler, useMemo} from 'react'

import {
  FilterSuggestionsItemsContext,
  type FilterSuggestionsItemsContextProps,
} from '../../../components/filter-bar/filter-suggestions'
import {TokenizedFilterInput} from '../../../components/filter-bar/tokenized-filter-input'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'

type InsightsFilterProps = {
  filteredItems: Array<MemexItemModel> | null
  filterValue: string
  handleFilterValueChange: ChangeEventHandler<HTMLInputElement>
  onClearButtonClick: React.MouseEventHandler<HTMLButtonElement> | undefined
  setValueFromSuggestion: (value: string) => void
  onSaveChanges?: (() => void) | undefined
  onResetChanges?: (() => void) | undefined
  inputRef: React.RefObject<HTMLInputElement | null> | undefined
  hideSaveButton?: boolean
}

export const InsightsFilters = ({
  filteredItems,
  filterValue,
  handleFilterValueChange,
  onClearButtonClick,
  setValueFromSuggestion,
  onSaveChanges,
  onResetChanges,
  inputRef,
  hideSaveButton,
}: InsightsFilterProps) => {
  const {items} = useMemexItems()

  const contextValue: FilterSuggestionsItemsContextProps = useMemo(() => {
    return {
      items,
    }
  }, [items])

  return (
    <FilterSuggestionsItemsContext.Provider value={contextValue}>
      <TokenizedFilterInput
        inputRef={inputRef}
        height="32px"
        value={filterValue}
        onChange={handleFilterValueChange}
        onClearButtonClick={onClearButtonClick}
        setValueFromSuggestion={setValueFromSuggestion}
        filterCount={filteredItems ? filteredItems.length : null}
        onSaveChanges={onSaveChanges}
        onResetChanges={onResetChanges}
        hideSaveButton={hideSaveButton}
      />
    </FilterSuggestionsItemsContext.Provider>
  )
}
