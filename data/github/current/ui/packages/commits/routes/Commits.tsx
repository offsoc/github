import {useCurrentRepository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useEffect} from 'react'

import {CommitHelpMessage} from '../components/Commits/CommitHelpMessage'
import {CommitList} from '../components/Commits/CommitList'
import {ListHeader} from '../components/Commits/ListHeader'
import {Pagination} from '../components/Commits/Pagination'
import Layout from '../components/Layout'
import {FilterProvider} from '../contexts/FilterContext'
import {useCommitsAppPayload} from '../hooks/use-commits-app-payload'
import {CommitsBlankState} from '../shared/CommitsBlankState'
import type {CommitsPayload} from '../types/commits-types'

export function Commits() {
  const repo = useCurrentRepository()
  const appPayload = useCommitsAppPayload()
  const payload = useRoutePayload<CommitsPayload>()
  const filters = payload.filters
  const commitGroups = payload.commitGroups
  const softNavToCommit = payload.metadata.softNavToCommit

  const unavailableMessage = `There isn't any commit history to show here${
    filters.since !== null || filters.until !== null ? ' for the selected date range' : ''
  }`

  useEffect(() => {
    // scroll to top of code nav on file change if not going to a specific line and already scrolled down
    if (!ssrSafeLocation.hash && window.scrollY > 0) {
      const header = document.querySelector('#commits-pagehead') as HTMLElement
      header?.scrollIntoView()
    }
  }, [payload.filters.pagination, payload.filters.since, payload.filters.until])

  return (
    <FilterProvider filters={payload.filters}>
      <Layout title="Commits">
        <ListHeader
          repo={repo}
          contributorsUrl={payload.metadata.deferredContributorUrl}
          since={filters.since}
          until={filters.until}
          author={filters.author}
          refInfo={payload.refInfo}
          path={filters.currentBlobPath}
          sx={{mb: 3}}
        />

        {commitGroups.length === 0 && (
          <CommitsBlankState timeoutMessage={payload.timedOutMessage} unavailableMessage={unavailableMessage} />
        )}
        {commitGroups.length > 0 && (
          <>
            <CommitList
              commitGroups={commitGroups}
              deferredDataUrl={payload.metadata.deferredDataUrl}
              softNavToCommit={softNavToCommit}
            />
            <Pagination paginationInfo={filters.pagination} />
          </>
        )}
        {payload.metadata.showProfileHelp && (
          <CommitHelpMessage url={`${appPayload.helpUrl}/articles/troubleshooting-commits-on-your-timeline`} />
        )}
      </Layout>
    </FilterProvider>
  )
}
