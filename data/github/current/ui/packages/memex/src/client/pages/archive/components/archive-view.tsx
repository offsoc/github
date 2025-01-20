import {Box, PageLayout} from '@primer/react'
import {useCallback, useMemo, useRef} from 'react'

import {
  FilterSuggestionsItemsContext,
  type FilterSuggestionsItemsContextProps,
} from '../../../components/filter-bar/filter-suggestions'
import {TokenizedFilterInput} from '../../../components/filter-bar/tokenized-filter-input'
import {getInitialState} from '../../../helpers/initial-state'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {useArchivedItems, useFilterArchiveItems, useSelectArchiveItems} from '../archive-page-provider'
import {ArchiveHeader} from './archive-header'
import {ArchiveItem} from './archive-item'
import {ArchiveList} from './shared/archive-list'

const filterBarHeight = 40

const fallbackFilterSuggestions: Array<MemexItemModel> = []

export function ArchiveView() {
  const {archivedItems, loaded} = useArchivedItems()
  const {filterValue, setFilterValue, filteredItems} = useFilterArchiveItems()
  const {selectedItems} = useSelectArchiveItems()

  const {items} = useMemexItems()
  const projectItemLimit = getInitialState().projectLimits.projectItemLimit
  const willSelectionExceedLimit = selectedItems.length + items.length > projectItemLimit
  const willSingleRestoreExceedLimit = items.length + 1 > projectItemLimit

  const renderItem = useCallback(
    (item: MemexItemModel) => {
      return (
        <ArchiveItem
          archivedItem={item}
          columnData={item.columns}
          canRestore={!willSingleRestoreExceedLimit}
          projectItemLimit={projectItemLimit}
        />
      )
    },
    [projectItemLimit, willSingleRestoreExceedLimit],
  )

  const contextValue: FilterSuggestionsItemsContextProps = useMemo(() => {
    return {
      items: archivedItems ?? fallbackFilterSuggestions,
    }
  }, [archivedItems])
  const searchInputRef = useRef<HTMLInputElement>(null)
  return (
    <PageLayout sx={{pt: 4}} containerWidth="large" rowGap="condensed">
      <PageLayout.Content>
        <Box sx={{position: 'sticky', top: -2, pt: 5, mt: -5, backgroundColor: 'canvas.default', zIndex: 1}}>
          <FilterSuggestionsItemsContext.Provider value={contextValue}>
            <TokenizedFilterInput
              inputRef={searchInputRef}
              height={filterBarHeight}
              value={filterValue}
              onChange={useCallback(e => setFilterValue(e.target.value), [setFilterValue])}
              onClearButtonClick={useCallback(() => {
                setFilterValue('')
              }, [setFilterValue])}
              filterCount={filterValue.trim() ? filteredItems.length : undefined}
              setValueFromSuggestion={setFilterValue}
              hideSaveButton
              hideResetChangesButton
            />
          </FilterSuggestionsItemsContext.Provider>
          <ArchiveHeader projectItemLimit={projectItemLimit} canBulkRestore={!willSelectionExceedLimit} />
        </Box>
        <ArchiveList
          filteredItems={filteredItems}
          loaded={loaded}
          hasArchive={archivedItems ? archivedItems.length > 0 : false}
          renderItem={renderItem}
        />
      </PageLayout.Content>
    </PageLayout>
  )
}
