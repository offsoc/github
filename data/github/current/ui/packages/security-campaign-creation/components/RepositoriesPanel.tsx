import {useCallback, useMemo, useState} from 'react'
import {Box, Link, Text, TextInput} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import pluralize from 'pluralize'
import {fuzzyFilter} from '@github-ui/fuzzy-score/fuzzy-filter'
import {RepositoryTypeIcon} from '@github-ui/security-campaigns-shared/components/RepositoryTypeIcon'
import type {AlertsSummaryResponse} from '../hooks/use-alerts-summary-query'

export type RepositoriesPanelProps = {
  alertsSummary: AlertsSummaryResponse | undefined
}

export function RepositoriesPanel({alertsSummary}: RepositoriesPanelProps) {
  const [filter, setFilter] = useState('')

  const filteredRepositories = useMemo(() => {
    if (!alertsSummary) {
      return []
    }

    const normalizedFilter = filter.trim()
    if (!normalizedFilter) {
      return [...alertsSummary.repositories].sort((a, b) => a.repository.name.localeCompare(b.repository.name))
    }

    return fuzzyFilter({
      items: alertsSummary.repositories,
      filter: normalizedFilter,
      key: alertSummary => alertSummary.repository.name,
    })
  }, [filter, alertsSummary])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value)
  }, [])

  return (
    <Box sx={{height: '100%'}}>
      <Box sx={{padding: 2, borderBottomColor: 'border.default', borderBottomWidth: 1, borderBottomStyle: 'solid'}}>
        <TextInput
          type="search"
          leadingVisual={SearchIcon}
          placeholder="Search selected repositories"
          value={filter}
          onChange={handleChange}
          sx={{width: '100%'}}
        />
      </Box>
      <Box as="ul" sx={{height: 'calc(100% - 50px)', overflowY: 'auto'}}>
        {filteredRepositories.map(alertSummary => (
          <Box
            key={`${alertSummary.repository.ownerLogin}/${alertSummary.repository.name}`}
            as="li"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              padding: 2,
              lineHeight: '20px',
              marginX: 2,
              borderBottomColor: 'border.default',
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1}}>
              <RepositoryTypeIcon typeIcon={alertSummary.repository.typeIcon} size={16} />
              <Link href={alertSummary.repository.path} target="_blank">
                <span>{alertSummary.repository.name}</span>
              </Link>
            </Box>
            <Text sx={{color: 'fg.muted'}}>
              {alertSummary.alertCount} {pluralize('alert', alertSummary.alertCount)}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
