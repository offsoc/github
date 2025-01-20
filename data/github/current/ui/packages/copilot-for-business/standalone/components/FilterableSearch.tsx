import type {SeatType} from '../../types'
import {FilterIcon, SearchIcon} from '@primer/octicons-react'
import {ActionMenu, IconButton, ActionList, TextInput, type SxProp} from '@primer/react'
import {useCallback} from 'react'

type FilterOptions = SeatType[]
type FilterFunction = (filter: SeatType) => void
type FilterProps = {
  filter: FilterFunction
  currentFilter: string
  filterOptions: FilterOptions
}

type BaseProps = {
  search: (query: string) => void
  placeholder?: string
  searchProps?: {sx: SxProp}
}

type Props = BaseProps &
  (
    | FilterProps
    | {
        [K in keyof FilterProps]?: never
      }
  )

type FilterOptionProps = {
  filter: FilterFunction
  filterItem: SeatType
  selected: boolean
}

function assertFilterProps(props: object): asserts props is FilterProps {
  if ('filter' in props || 'currentFilter' in props || 'filterOptions' in props) {
    if (!('filter' in props && 'currentFilter' in props && 'filterOptions' in props)) {
      throw new Error('If any of filter, currentFilter, or filterOptions is provided, all must be provided.')
    }
  }
}

function FilterOption(props: FilterOptionProps) {
  const {filter, filterItem, selected} = props
  const filterer = useCallback(() => filter(filterItem), [filterItem, filter])

  return (
    <ActionList.Item onSelect={filterer} selected={selected}>
      {filterItem}
    </ActionList.Item>
  )
}

export function FilterableSearch(props: Props) {
  const {placeholder, search, searchProps, ...filterProps} = props

  assertFilterProps(filterProps)

  const filterStyleOpts = (filterProps.filterOptions && {borderTopLeftRadius: 0, borderBottomLeftRadius: 0}) || {}

  return (
    <>
      {filterProps.filterOptions && filterProps.filterOptions.length > 0 && (
        <ActionMenu>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={FilterIcon}
              variant="default"
              aria-label="Open filter options"
              sx={{borderRight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay width="medium">
            <ActionList data-testid="copilot-user-search-filter" selectionVariant="single" showDividers>
              {filterProps.filterOptions.map(filterItem => (
                <FilterOption
                  key={filterItem}
                  filter={filterProps.filter}
                  filterItem={filterItem}
                  selected={filterItem === filterProps.currentFilter}
                />
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
      <TextInput
        leadingVisual={SearchIcon}
        aria-label={placeholder ?? 'Search by name or email'}
        name="search-seats"
        placeholder={placeholder ?? 'Search by name or email'}
        data-testid="cfb-search-seats"
        block={true}
        sx={{
          ...filterStyleOpts,
          ...searchProps,
        }}
        onChange={event => search(event.target.value)}
      />
    </>
  )
}
