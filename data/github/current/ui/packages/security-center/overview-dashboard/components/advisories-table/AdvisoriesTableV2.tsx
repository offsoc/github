import DataCard from '@github-ui/data-card'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Link, sx} from '@primer/react'
import {Blankslate, DataTable, Table} from '@primer/react/drafts'
import {useMemo} from 'react'

import type {Advisory} from '../AdvisoriesTable'
import SeverityChip from '../SeverityChip'
import type {UseAdvisoriesQueryParams} from './use-advisories-query'
import useAdvisoriesQuery from './use-advisories-query'

interface AdvisoriesTableProps extends UseAdvisoriesQueryParams {}

type PickedAdvisoryProps = Omit<Advisory, 'openAlerts'>
type MappedAdvisoryProps = {[K in keyof Pick<Advisory, 'openAlerts'>]: string}
interface TableRow extends PickedAdvisoryProps, MappedAdvisoryProps {
  id: string | number
  url: string
  cveId: string
}

export function AdvisoriesTableV2(props: AdvisoriesTableProps): JSX.Element {
  const dataQuery = useAdvisoriesQuery(props)
  const numberFormatter = useMemo(() => Intl.NumberFormat('en-US', {notation: 'standard'}), [])

  const rows = (): TableRow[] => {
    if (dataQuery.isSuccess) {
      return dataQuery.data.advisories.map<TableRow>((advisory, idx) => {
        return {
          ...advisory,
          id: idx,
          url: `/advisories/${advisory.ghsaId}`,
          cveId: advisory.cveId ?? '-',
          openAlerts: numberFormatter.format(advisory.openAlerts),
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
            {header: 'Advisory', align: 'end'},
            {header: 'CVE ID', align: 'end'},
            {header: 'Ecosystem', align: 'end'},
            {header: 'Open alerts', align: 'end'},
            {header: 'Severity', align: 'end'},
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
          <Blankslate.Description>Advisory information could not be loaded right now</Blankslate.Description>
        </Blankslate>
      </DataCard>
    )
  }

  if (dataQuery.isSuccess && dataQuery.data.advisories.length === 0) {
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
        data={rows()}
        columns={[
          {
            header: 'Advisory',
            field: 'summary',
            maxWidth: 305,
            renderCell: (row: TableRow) => (
              <Link sx={{fontWeight: 'bold'}} href={row.url}>
                {row.summary}
              </Link>
            ),
          },
          {header: 'CVE ID', field: 'cveId'},
          {header: 'Ecosystem', field: 'ecosystem'},
          {header: 'Open alerts', field: 'openAlerts', align: 'end'},
          {
            header: 'Severity',
            field: 'severity',
            renderCell: (row: TableRow) => <SeverityChip severity={row.severity} />,
          },
        ]}
      />
    </Table.Container>
  )
}
