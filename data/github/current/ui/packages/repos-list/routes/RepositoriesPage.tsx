import {debounce} from '@github/mini-throttle'
import {announce} from '@github-ui/aria-live'
import {newRepoPath, orgReposListPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ReposFilter} from '@github-ui/repos-filter'
import {getNoRepoMessage, NoReposMessage, useListResults} from '@github-ui/repos-list-shared'
import {useSearchParams} from '@github-ui/use-navigate'
import {Box, Button, PageLayout, Pagination} from '@primer/react'
import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import {getDisplayReposCount, ReposList} from '../components/ReposList'
import {getTypeFromQuery, Sidebar, SidebarCollapsedButton} from '../components/Sidebar'
import {getSortingKeyAndDirection, getSortingOptionLabel} from '../components/SortingDropdown'
import type {RepositoriesPayload} from '../types/repos-list-types'
import {addSortToQuery, getSortFromQuery} from '../utils/query'

const wideOnly = {display: ['none', 'none', 'block']}
const narrowOnly = {display: ['block', 'block', 'none']}

const debounceAnnounce = debounce(announce, 300)

export function RepositoriesPage() {
  const payload = useRoutePayload<RepositoriesPayload>()
  const [params] = useSearchParams()
  const {org} = useParams()

  const [query, setQuery] = useState(params.get('q') || '')

  const {userInfo, definitions, typeFilters, searchable} = payload
  const [fetchedType, setFetchedType] = useState(getTypeFromQuery(query, typeFilters))

  const fetchUrl = orgReposListPath({org: org || ''})
  const {results, currentPage, isFetching, fetchResults} = useListResults(payload, fetchUrl, Number(params.get('page')))
  const {repositories, repositoryCount, pageCount} = results

  const anyRepos = repositories.length > 0
  const filtered = !!query

  useEffect(() => {
    if (isFetching) return

    if (anyRepos) {
      const [sortKey, direction] = getSortingKeyAndDirection(getSortFromQuery(query))
      const sortingLabel = getSortingOptionLabel(sortKey)
      const message = `
        ${getDisplayReposCount(repositoryCount)} found.
        List is sorted by ${sortingLabel} in ${direction === 'asc' ? 'ascending' : 'descending'} order.
      `
      debounceAnnounce(message)
    } else {
      debounceAnnounce(getNoRepoMessage({currentPage, pageCount, filtered, userInfo}))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to depend on results to avoid unnecessary announcements
  }, [results])

  const {canCreateRepository} = userInfo || {}

  const showFilterDialog = useFeatureFlag('repos_list_show_filter_dialog')

  function updateQuery(q: string) {
    setQuery(q)
  }

  function submitQuery(q: string) {
    fetchResults({q, page: 1, searchOnSubmitEnabled: true})
    setFetchedType(getTypeFromQuery(q, typeFilters))
  }

  function updateAndSubmitQuery(q: string) {
    updateQuery(q)
    submitQuery(q)
  }

  const listTitle = typeFilters.find(({id}) => id === fetchedType)?.text || 'All'

  return (
    <PageLayout containerWidth="full" columnGap="none" padding="none">
      <PageLayout.Pane
        divider="line"
        hidden={{
          narrow: true,
          regular: false,
          wide: false,
        }}
        padding="condensed"
        position="start"
      >
        <aside>
          <Box as="h2" sx={{fontSize: 3, pl: 3}}>
            Repositories
          </Box>
          <Sidebar type={fetchedType} onQueryChanged={updateAndSubmitQuery} types={typeFilters} />
        </aside>
      </PageLayout.Pane>
      {/* setting px on top of the padding prop is required to visually compensate padding of the list items in the sidebar */}
      <PageLayout.Content sx={{minHeight: '100vh', maxWidth: 1400, mx: 'auto', px: 2}} padding="condensed">
        {searchable && (
          <>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mb: 3}}>
              <Box sx={narrowOnly}>
                <SidebarCollapsedButton
                  type={fetchedType}
                  onQueryChanged={updateAndSubmitQuery}
                  types={typeFilters}
                  listTitle={listTitle}
                />
              </Box>
              <Box as="h1" sx={{...wideOnly, fontSize: 3}}>
                {listTitle}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                {canCreateRepository && (
                  <Button as="a" href={newRepoPath({org})} variant="primary" size="medium">
                    New repository
                  </Button>
                )}
              </Box>
            </Box>
            <ReposFilter
              id="repos-list-filter"
              label="Search repositories"
              variant={showFilterDialog ? 'full' : 'input'}
              placeholder="Search repositories"
              filterValue={query}
              definitions={definitions}
              onChange={updateQuery}
              onSubmit={filterQuery => submitQuery(filterQuery.raw)}
            />
          </>
        )}

        <Box sx={{my: 3}}>
          <div data-hpc>
            {anyRepos ? (
              <ReposList
                compactMode={payload.compactMode}
                showSpinner={isFetching}
                repositoryCount={repositoryCount}
                repos={repositories}
                onSortingItemSelect={sort => updateAndSubmitQuery(addSortToQuery(query, sort))}
                sortingItemSelected={getSortFromQuery(query)}
              />
            ) : (
              <NoReposMessage
                currentPage={currentPage}
                filtered={filtered}
                orgName={org}
                pageCount={pageCount}
                userInfo={userInfo}
              />
            )}
          </div>
        </Box>
        {pageCount > 0 && (
          <Pagination
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={(e, page) => {
              // Avoid adding hash parameters
              e.preventDefault()

              window.scrollTo({top: 0})
              fetchResults({q: query, page})
            }}
          />
        )}
      </PageLayout.Content>
    </PageLayout>
  )
}
