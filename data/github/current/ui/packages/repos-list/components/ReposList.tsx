import {getSignificanceBasedPrecision, human} from '@github-ui/formatters'
import {ListView} from '@github-ui/list-view'
import {ListViewDensityToggle} from '@github-ui/list-view/ListViewDensityToggle'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import type {RepositoryItem} from '@github-ui/repos-list-shared'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Box, Spinner, Text} from '@primer/react'
import {type ComponentProps, useRef} from 'react'

import {ReposListItem} from './ReposListItem'
import {SortingDropdown} from './SortingDropdown'

export type ListViewVariant = ComponentProps<typeof ListView>['variant']

export function ReposList({
  compactMode,
  showSpinner,
  repositoryCount,
  repos,
  sortingItemSelected,
  onSortingItemSelect,
}: {
  compactMode: boolean
  showSpinner: boolean
  repositoryCount: number
  repos: RepositoryItem[]
  sortingItemSelected?: string
  onSortingItemSelect: (key: string) => void
}) {
  const savedCompactModeRef = useRef(compactMode)
  function updateCompactModeSetting(value: boolean) {
    if (savedCompactModeRef.current === value) {
      return
    }

    savedCompactModeRef.current = value

    const formData = new FormData()
    formData.set('orgs_repos_compact_mode', value.toString())
    verifiedFetch('/repos/preferences', {method: 'PUT', body: formData})
  }

  const metadata = (
    <ListViewMetadata
      title={<Text sx={{fontWeight: 'bold'}}>{getDisplayReposCount(repositoryCount)}</Text>}
      densityToggle={<ListViewDensityToggle />}
    >
      {showSpinner && <Spinner size="small" />}
      <SortingDropdown sortingItemSelected={sortingItemSelected || ''} onSortingItemSelect={onSortingItemSelect} />
    </ListViewMetadata>
  )

  return (
    <Box sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}}>
      <ListView
        onVariantChange={value => updateCompactModeSetting(value === 'compact')}
        variant={compactMode ? 'compact' : 'default'}
        metadata={metadata}
        title="Repositories list"
        titleHeaderTag="h2"
      >
        {repos.map(repo => (
          <ReposListItem key={repo.name} repo={repo} />
        ))}
      </ListView>
    </Box>
  )
}

export function getDisplayReposCount(count: number): string {
  const displayCount = human(count, {
    precision: getSignificanceBasedPrecision(count),
  })

  return ` ${displayCount} ${count === 1 ? 'repository' : 'repositories'}`
}
