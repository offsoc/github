import {useMemo} from 'react'

import {ActionList, ActionMenu} from '@primer/react'
import {useFilterContext} from '../contexts/FilterContext'
import ModelsFilters from './models/ModelsFilters'

export default function Filters() {
  const filterOptions = {
    all: 'All',
    free_trial: 'Free trial',
  }
  const {filter, setFilter, creators, setCreators, sort, setSort, type} = useFilterContext()

  // TODO: Let's add some constants
  const creatorOptions = ['All creators', 'Verified creators']

  const sortOptions = useMemo(() => {
    return {
      'popularity-desc': 'Popularity',
      'created-desc': 'Recently added',
      'match-desc': 'Best match',
    }
  }, [])

  const sortText = useMemo(() => {
    switch (sort) {
      case 'popularity-desc':
        return sortOptions['popularity-desc']
      case 'created-desc':
        return sortOptions['created-desc']
      case 'match-desc':
        return sortOptions['match-desc']
      default:
        return ''
    }
  }, [sort, sortOptions])

  const onCreatorChange = (creator: string) => {
    setCreators(creator)
  }

  const onFilterChange = (newFilter: string) => {
    setFilter(newFilter)
  }

  const onSortChange = (newSort: string) => {
    setSort(newSort)
  }

  if (type === 'models') {
    return <ModelsFilters />
  }

  return (
    <div className="d-flex gap-2 flex-wrap">
      <ActionMenu>
        <ActionMenu.Button data-testid="filter-button">
          <span className="fgColor-muted">Filter:</span> {filter}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="filter-menu">
            {Object.entries(filterOptions).map(([key, value]) => (
              <ActionList.Item key={key} selected={value === filter} onSelect={() => onFilterChange(value)}>
                {value}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <ActionMenu>
        <ActionMenu.Button data-testid="creator-button">
          <span className="fgColor-muted">By:</span> {creators}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {creatorOptions.map(option => (
              <ActionList.Item key={option} selected={option === creators} onSelect={() => onCreatorChange(option)}>
                {option}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <ActionMenu>
        <ActionMenu.Button data-testid="sort-button">
          <span className="fgColor-muted">Sort:</span> {sortText}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="sort-menu">
            {Object.entries(sortOptions).map(([key, value]) => (
              <ActionList.Item key={key} selected={key === sort} onSelect={() => onSortChange(key)}>
                {value}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}
