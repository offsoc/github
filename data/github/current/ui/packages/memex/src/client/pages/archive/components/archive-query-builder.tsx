import {USER_FILTERS} from '@github-ui/query-builder/constants/search-filters'
import {QueryBuilder} from '@github-ui/query-builder/QueryBuilder'
import {createCustomFilter, createUserFilter} from '@github-ui/query-builder/utils/query'
import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {Octicon} from '@github-ui/query-builder-element/query-builder-api'
import {testIdProps} from '@github-ui/test-id-props'
import {useRefObjectAsForwardedRef} from '@primer/react'
import {type ChangeEvent, forwardRef, useCallback, useRef} from 'react'

import {normalizeToFilterName} from '../../../components/filter-bar/helpers/search-filter'
import {getInitialState} from '../../../helpers/initial-state'
import {useColumnsStableContext} from '../../../state-providers/columns/use-columns-stable-context'
import {Resources} from '../../../strings'
import {createSingleSelectFilter} from './filter-providers/single-select-filter-provider'

type ArchiveQueryBuilderProps = {
  onChange: (value: string) => void
  value: string
}

const KEYWORD_FILTERS = [
  {
    filter: {
      name: 'Is',
      value: 'is',
      icon: Octicon.Apps,
      description: 'Filter for "issues" or "pull requests", or items that are "open", "closed", "merged", or "draft"',
      priority: 3,
    },
    values: [
      {value: 'issue', description: 'Issues only', priority: 1, icon: Octicon.Issue},
      {value: 'pr', description: 'Pull Requests only', priority: 2, icon: Octicon.PullRequest, name: 'Pull Request'},
      {value: 'open', description: 'Items with open state', priority: 3, icon: Octicon.Issue},
      {value: 'closed', description: 'Items with closed state', priority: 4, icon: Octicon.IssueClosed},
      {value: 'merged', description: 'Items with merged state', priority: 5, icon: Octicon.Merged},
      {value: 'draft', description: 'Items with draft state', priority: 6, icon: Octicon.Draft},
    ],
  },
]

const NO_FILTER = {
  name: 'No',
  value: 'no',
  icon: Octicon.No,
  description: 'Fields without values',
  priority: 2,
}

const USER_VALUE_FILTERS = [USER_FILTERS.assignee]

const ArchiveQueryBuilder = forwardRef<HTMLInputElement, ArchiveQueryBuilderProps>(({onChange, value}, ref) => {
  const {loggedInUser} = getInitialState()
  const {allColumnsRef} = useColumnsStableContext()
  const queryBuilderRef = useRef<HTMLInputElement>(null)
  useRefObjectAsForwardedRef(ref, queryBuilderRef)

  const onRequestProvider = useCallback(
    (event: Event) => {
      event.stopPropagation()
      const queryBuilder = event.target as QueryBuilderElement

      KEYWORD_FILTERS.map(f => {
        return createCustomFilter(f.filter, queryBuilder, f.values)
      })

      const notValues = [
        {
          value: 'assignee',
          description: `Items without an assignee`,
          priority: 1,
          icon: Octicon.No,
          name: 'Assignee',
        },
      ]

      for (const column of allColumnsRef.current) {
        switch (column.dataType) {
          case 'singleSelect': {
            createSingleSelectFilter(queryBuilder, column)
            notValues.push({
              value: normalizeToFilterName(column.name),
              description: `Items without a '${column.name}' value`,
              priority: notValues.length + 1,
              icon: Octicon.No,
              name: column.name,
            })
            break
          }
          default:
            break
        }
      }

      createCustomFilter(NO_FILTER, queryBuilder, notValues)

      // User Value Filters
      USER_VALUE_FILTERS.map(f =>
        createUserFilter(f, queryBuilder, loggedInUser?.login ?? '', loggedInUser?.avatarUrl ?? ''),
      )
    },
    [allColumnsRef, loggedInUser?.avatarUrl, loggedInUser?.login],
  )

  const onChangeHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value)
    },
    [onChange],
  )

  return (
    <QueryBuilder
      inputRef={queryBuilderRef}
      label={Resources.filterByKeyboardOrByField}
      id={'archive-query-builder'}
      onChange={onChangeHandler}
      inputValue={value}
      placeholder={Resources.filterByKeyboardOrByField}
      onRequestProvider={onRequestProvider}
      {...testIdProps('filter-bar-input')}
    />
  )
})
ArchiveQueryBuilder.displayName = 'ArchiveQueryBuilder'

export {ArchiveQueryBuilder}
