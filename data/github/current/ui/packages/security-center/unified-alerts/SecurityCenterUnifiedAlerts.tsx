import type {FilterProvider} from '@github-ui/filter'
import {useCallback, useMemo, useState} from 'react'

import PageLayout from '../common/components/page-layout'
import type {CustomProperty} from '../common/filter-providers/types'
import {useDirtyStateTracking} from '../common/hooks/use-dirty-state-tracking'
import {AlertList} from './components/alert-list'
import type {GroupKey} from './types'
import {useUpdateUrl} from './utils/url-utils'

export interface SecurityCenterUnifiedAlertsProps {
  initialQuery?: string
  initialGroupKey?: GroupKey
  feedbackLink: {
    text: string
    url: string
  }
  showIncompleteDataWarning: boolean
  incompleteDataWarningDocHref: string
  filterProviders: FilterProvider[]
  customProperties: CustomProperty[]
}

const DEFAULT_QUERY: string = 'is:open archived:false'

export function SecurityCenterUnifiedAlerts({
  initialQuery,
  initialGroupKey,
  feedbackLink,
  showIncompleteDataWarning,
  incompleteDataWarningDocHref,
  filterProviders,
  customProperties,
}: SecurityCenterUnifiedAlertsProps): JSX.Element {
  // track selected filter state
  const [query, setQuery] = useState<string>(initialQuery ?? DEFAULT_QUERY)
  const [queryIsDirty, resetQueryIsDirty] = useDirtyStateTracking(query, DEFAULT_QUERY, !!initialQuery)
  const [groupKey, setGroupKey] = useState<GroupKey>(initialGroupKey || 'none')

  const onStateFilterChanged = useCallback(
    (state: 'open' | 'closed') => {
      // TODO naive, doesn't handle quotes, multi-select, etc
      const queryWithoutState = query.replaceAll(/is:(open|closed)/g, '').trim()
      setQuery(`${queryWithoutState} is:${state}`)
    },
    [query, setQuery],
  )

  const onGroupKeyChanged = useCallback(
    (newGroupKey: GroupKey) => {
      setGroupKey(newGroupKey)
    },
    [setGroupKey],
  )

  const {openSelected, closedSelected} = useMemo(() => {
    return {
      openSelected: query.includes('is:open'),
      closedSelected: query.includes('is:closed'),
    }
  }, [query])

  useUpdateUrl(query, queryIsDirty, groupKey)

  return (
    <PageLayout>
      <PageLayout.Banners />

      <PageLayout.Header title="Alerts" feedbackLink={feedbackLink} />

      <PageLayout.FilterBar
        filter={<PageLayout.Filter providers={filterProviders} query={query} onSubmit={setQuery} />}
        revert={
          <PageLayout.FilterRevert
            show={queryIsDirty}
            onRevert={() => {
              setQuery(DEFAULT_QUERY)
              resetQueryIsDirty()
            }}
          />
        }
      />

      <PageLayout.LimitedRepoWarning show={showIncompleteDataWarning} href={incompleteDataWarningDocHref} />

      <PageLayout.Content>
        <AlertList
          openSelected={openSelected && !closedSelected}
          closedSelected={closedSelected && !openSelected}
          query={query}
          groupKey={groupKey}
          onStateFilterChanged={onStateFilterChanged}
          onGroupKeyChanged={onGroupKeyChanged}
          customProperties={customProperties}
        />
      </PageLayout.Content>
    </PageLayout>
  )
}
