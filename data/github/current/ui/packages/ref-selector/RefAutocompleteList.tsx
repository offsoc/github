import {CheckIcon, SearchIcon} from '@primer/octicons-react'
import {Autocomplete, Box, Label, Octicon, TextInput} from '@primer/react'
import {useContext, useMemo, useRef} from 'react'

import {RefItemContent} from './RefItem'
import {LoadingFailed, type RefType} from './RefSelector'
import type {RefsState} from './use-refs'

const REF_LIST_LIMIT = 30
const MAX_HEIGHT_PX = 330
interface RefAutocompleteListProps {
  refs: string[]
  inputRef?: React.RefObject<HTMLInputElement>
  status: RefsState['status']
  value: string
  selectedRef: string
  refType: RefType
  defaultBranch: string
  onChange(value: string): void
  onSelect(ref: string): void
}
export function RefAutocompleteList({
  refs,
  inputRef,
  defaultBranch,
  selectedRef,
  refType,
  value,
  onChange,
  onSelect,
  status,
}: RefAutocompleteListProps) {
  const scrollContainerRef = useRef(null)
  const context = useContext(Autocomplete.Context)
  if (context === null) {
    throw new Error('Autocomplete.Context returned null values')
  }

  const autocompleteContextValue = useMemo<typeof context>(() => {
    return {
      ...context,
      autocompleteSuggestion: '',
      setAutocompleteSuggestion: () => false,
      showMenu: true,
      id: `${refType}-autocomplete`,
    }
  }, [context, refType])

  const slicedRefs = refs.slice(0, REF_LIST_LIMIT)

  function onRefSelect<T extends {id: string}>(selection: T | T[]) {
    const item: T = Array.isArray(selection) ? selection[0]! : selection
    if (item) {
      onSelect(item.id)
    }
  }

  return (
    <Autocomplete.Context.Provider value={autocompleteContextValue}>
      <Autocomplete.Input
        id="searchbox"
        ref={inputRef}
        block
        as={TextInput}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Start typing to see more"
        aria-activedescendant="IDREF"
        leadingVisual={() => (
          <label htmlFor="searchbox">
            <SearchIcon aria-label="Search refs" />
          </label>
        )}
      />
      <Box sx={{maxHeight: MAX_HEIGHT_PX, overflowY: 'auto'}} ref={scrollContainerRef}>
        <div className="sr-only" role="status">
          {slicedRefs.length} results returned
        </div>
        {status === 'failed' ? (
          <Box aria-live="assertive" sx={{py: 2}}>
            <LoadingFailed refType={refType} />
          </Box>
        ) : (
          <Autocomplete.Menu
            // Filtering happens in `useRefs` hook.
            filterFn={() => true}
            items={slicedRefs.map(ref => {
              const trailingVisual =
                ref === defaultBranch
                  ? () => (
                      <>
                        &nbsp;<Label>default</Label>
                      </>
                    )
                  : undefined
              const leadingVisual = () => (
                <Octicon icon={CheckIcon} sx={{visibility: ref === selectedRef ? undefined : 'hidden'}} />
              )
              return {
                id: ref,
                trailingVisual,
                ['aria-selected']: ref === selectedRef,
                leadingVisual,
                showDivider: true,
                sx: {mx: 0},
                children: <RefItemContent gitRef={ref} filterText={value} showLeadingVisual={false} />,
                ...(selectedRef === ref ? {['data-testid']: 'selected-option'} : {}),
              }
            })}
            aria-labelledby="searchbox"
            selectedItemIds={[]}
            customScrollContainerRef={scrollContainerRef}
            onSelectedChange={onRefSelect}
            loading={status === 'loading' || status === 'uninitialized'}
            emptyStateText="Nothing to show"
            selectionVariant="single"
          />
        )}
      </Box>
    </Autocomplete.Context.Provider>
  )
}
