import DataCard from '@github-ui/data-card'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {Blankslate, DataTable, Table} from '@primer/react/drafts'
import {useEffect, useMemo, useState} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {tryFetchJson} from '../../common/utils/fetch-json'
import type CardProps from '../types/card-props'

export interface Repo {
  id: number
  repository: string
  ownerType: string
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

type PickedRepoProps = Pick<Repo, 'id' | 'repository'>
type MappedRepoProps = {[K in keyof Omit<Repo, 'id' | 'repository'>]: string}
interface TableRow extends PickedRepoProps, MappedRepoProps {
  url: string
}

interface FetchResponse {
  repositories: Repo[]
  urlInfo: {[repositoryId: number]: string}
}

export function RepositoriesTable({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const [state, setState] = useState<'loading' | 'error' | 'no data' | 'data'>('loading')
  const [tableData, setTableData] = useState<TableRow[]>([])
  const numberFormatter = useMemo(() => Intl.NumberFormat('en-US', {notation: 'standard'}), [])
  const paths = usePaths()

  useEffect(() => {
    async function fetchData(): Promise<void> {
      setState('loading')

      const url = paths.repositoriesPath({startDate, endDate, query})
      const data = await tryFetchJson<FetchResponse>(url)

      function severityDisplayValue(count: number): string {
        return count == null ? 'N/A' : numberFormatter.format(count)
      }

      if (data == null) {
        setState('error')
        return
      }

      const rows = data.repositories.map<TableRow>(repo => {
        return {
          ...repo,
          url:
            repo.ownerType === 'ORGANIZATION'
              ? data.urlInfo[repo.id]!
              : paths.secretScanningAlertCentricViewPath({query: `repo:${repo.repository}`}),
          total: numberFormatter.format(repo.total),
          critical: severityDisplayValue(repo.critical),
          high: severityDisplayValue(repo.high),
          medium: severityDisplayValue(repo.medium),
          low: severityDisplayValue(repo.low),
        }
      })

      if (data.repositories.length === 0) {
        setState('no data')
      } else {
        setTableData(rows)
        setState('data')
      }
    }

    fetchData()
  }, [paths, startDate, endDate, query, numberFormatter])

  const blankslateParentStyle = useMemo(() => {
    return {display: 'flex', flexDirection: 'column', height: 366, width: '100%', justifyContent: 'center'}
  }, [])

  if (state === 'loading') {
    return (
      <Table.Container sx={{my: 4}}>
        <Table.Skeleton
          columns={[
            {header: 'Repository'},
            {header: 'Open alerts', align: 'end'},
            {header: 'Critical', align: 'end'},
            {header: 'High', align: 'end'},
            {header: 'Medium', align: 'end'},
            {header: 'Low', align: 'end'},
          ]}
          rows={10}
        />
      </Table.Container>
    )
  }

  if (state === 'error') {
    return (
      <DataCard sx={blankslateParentStyle} data-testid="error">
        <Blankslate>
          <Blankslate.Visual>
            <AlertIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Description>Repository information could not be loaded right now</Blankslate.Description>
        </Blankslate>
      </DataCard>
    )
  }

  if (state === 'no data') {
    return (
      <DataCard sx={blankslateParentStyle}>
        <Blankslate>
          <Blankslate.Visual>
            <ShieldCheckIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Description>
            Try modifying your filters to see the security impact on your organization.
          </Blankslate.Description>
        </Blankslate>
      </DataCard>
    )
  }

  return (
    <Table.Container sx={{my: 4, ...sx}}>
      <DataTable
        columns={[
          {
            header: 'Repository',
            field: 'repository',
            renderCell: row => (
              <Link sx={{fontWeight: 'bold'}} href={row.url}>
                {row.repository}
              </Link>
            ),
          },
          {header: 'Open alerts', field: 'total', align: 'end'},
          {header: 'Critical', field: 'critical', align: 'end'},
          {header: 'High', field: 'high', align: 'end'},
          {header: 'Medium', field: 'medium', align: 'end'},
          {header: 'Low', field: 'low', align: 'end'},
        ]}
        data={tableData}
      />
    </Table.Container>
  )
}
