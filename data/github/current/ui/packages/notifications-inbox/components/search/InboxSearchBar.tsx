import {debounce} from '@github/mini-throttle'
import {QueryBuilder} from '@github-ui/query-builder/QueryBuilder'
import {FILTERS, USER_VALUE_FILTERS} from '@github-ui/query-builder/constants/search-filters'
import {InboxOrgFilterProvider} from '@github-ui/query-builder/providers/inbox-org-filter-provider'
import {
  NotificationFilterProvider,
  VALUE_FILTERS,
} from '@github-ui/query-builder/providers/notification-filter-provider'
import {UserFilterProvider} from '@github-ui/query-builder/providers/user-filter-provider'

import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import type {SxProp, TextInputProps} from '@primer/react'
import React, {type FC, type KeyboardEventHandler, useCallback, useRef} from 'react'
import {useRelayEnvironment} from 'react-relay'

import useUser from '../../utils/hooks/use-user'
import {LABELS as NOTIFICATION_LABELS} from '../../notifications/constants/labels'
import {RepoFilterProvider} from '../../utils/query-builder/providers/RepoFilterProvider'

type NotificationUrlProps = {
  query: string
}

type InboxSearchBarProps = TextInputProps &
  NotificationUrlProps & {
    setQuery: (query: string) => void
    onInputChange?: (query: string) => void
    sx?: SxProp | null
  }

const InboxSearchBar: FC<InboxSearchBarProps> = ({query, setQuery, onInputChange, ...rest}) => {
  // Keep track of search query value, and callback when it is submitted
  const [inputQuery, setInputQuery] = React.useState(query ?? '')
  const relayEnvironment = useRelayEnvironment()
  const debouncedSetQuery = useRef(debounce((newQuery: string) => setQuery(newQuery), 500))
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const currentInputQuery = inputQuery
      const newInputQuery = e.currentTarget.value

      if (newInputQuery !== currentInputQuery) {
        setInputQuery(newInputQuery)
        if (onInputChange) onInputChange(newInputQuery)
        // Only submit the query if the user has finished typing a filter
        !newInputQuery.trim().endsWith(':') && debouncedSetQuery.current(newInputQuery)
      }
    },
    [inputQuery, onInputChange, debouncedSetQuery],
  )

  const handleEnterKeyPress: KeyboardEventHandler = useCallback(
    event => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic -- manual shortcut logic is idiomatic in React
      if (event.key !== 'Enter') return
      event.preventDefault()
      setQuery(inputQuery)
    },
    [setQuery, inputQuery],
  )

  const {currentUser} = useUser()

  const onRequestProvider = useCallback(
    (event: Event) => {
      event.stopPropagation()
      const queryBuilder = event.target as QueryBuilderElement

      // Organization
      new InboxOrgFilterProvider(queryBuilder, {...FILTERS.org, relayEnvironment})

      // Author
      USER_VALUE_FILTERS.map(
        f => new UserFilterProvider(queryBuilder, f, currentUser?.login ?? '', currentUser?.avatarUrl),
      )

      // Repository
      new RepoFilterProvider(queryBuilder, {...FILTERS.repo, relayEnvironment})

      // Reason
      // Subject type
      // State
      VALUE_FILTERS.map(f => new NotificationFilterProvider(queryBuilder, f))
    },
    [currentUser?.avatarUrl, currentUser?.login, relayEnvironment],
  )

  return (
    <QueryBuilder
      id={NOTIFICATION_LABELS.searchId}
      label={NOTIFICATION_LABELS.searchAriaLabel}
      data-testid={NOTIFICATION_LABELS.searchTestId}
      placeholder={NOTIFICATION_LABELS.searchPlaceholder}
      inputValue={inputQuery}
      onKeyPress={handleEnterKeyPress}
      onChange={handleInputChange}
      onRequestProvider={onRequestProvider}
      renderSingularItemNames={false}
      {...rest}
    />
  )
}

export default InboxSearchBar
