import DataCard from '@github-ui/data-card'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Link, sx} from '@primer/react'
import {Blankslate, DataTable, Table} from '@primer/react/drafts'
import {useMemo} from 'react'

import {usePaths} from '../../../common/contexts/Paths'
import type {Repo} from '../RepositoriesTable'
import useRepositoriesQuery, {type UseRepositoriesQueryParams} from './use-repositories-query'

interface RepositoriesTableProps extends UseRepositoriesQueryParams {}

type PickedRepoProps = Pick<Repo, 'id' | 'repository'>
type MappedRepoProps = {[K in keyof Omit<Repo, 'id' | 'repository'>]: string}
interface TableRow extends PickedRepoProps, MappedRepoProps {
  url: string
}

export function RepositoriesTableV2(props: RepositoriesTableProps): JSX.Element {
  const paths = usePaths()
  const dataQuery = useRepositoriesQuery(props)
  const numberFormatter = useMemo(() => Intl.NumberFormat('en-US', {notation: 'standard'}), [])
  function severityDisplayValue(count: number): string {
    return count == null ? 'N/A' : numberFormatter.format(count)
  }

  const rows = (): TableRow[] => {
    if (dataQuery.isSuccess) {
      return dataQuery.data.repositories.map<TableRow>(repo => {
        return {
          ...repo,
          url:
            repo.ownerType === 'ORGANIZATION'
              ? dataQuery.data.urlInfo[repo.id]!
              : paths.secretScanningAlertCentricViewPath({query: `repo:${repo.repository}`}),
          total: numberFormatter.format(repo.total),
          critical: severityDisplayValue(repo.critical),
          high: severityDisplayValue(repo.high),
          medium: severityDisplayValue(repo.medium),
          low: severityDisplayValue(repo.low),
        }
      })
    } else {
      return []
    }
  }

  const blankslateParentStyle = useMemo(() => {
    return {display: 'flex', flexDirection: 'column', height: 366, width: '100%', justifyContent: 'center'}
  }, [])

  if (dataQuery.isPending) {
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

  if (dataQuery.isError) {
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

  if (dataQuery.isSuccess && dataQuery.data.repositories.length === 0) {
    return (
      <DataCard sx={blankslateParentStyle} data-testid="empty">
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
        data={rows()}
      />
    </Table.Container>
  )
}
