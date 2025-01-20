import DataCard from '@github-ui/data-card'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {Blankslate, DataTable, Table} from '@primer/react/drafts'
import {useEffect, useMemo, useState} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {tryFetchJson} from '../../common/utils/fetch-json'
import type CardProps from '../types/card-props'
import SeverityChip from './SeverityChip'

export interface Advisory {
  summary: string
  cveId: string | undefined
  ghsaId: string
  ecosystem: string
  openAlerts: number
  severity: string
}

type PickedAdvisoryProps = Omit<Advisory, 'openAlerts'>
type MappedAdvisoryProps = {[K in keyof Pick<Advisory, 'openAlerts'>]: string}
interface TableRow extends PickedAdvisoryProps, MappedAdvisoryProps {
  id: string | number
  url: string
  cveId: string
}

interface FetchResponse {
  advisories: Advisory[]
}

export function AdvisoriesTable({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const [state, setState] = useState<'loading' | 'error' | 'no data' | 'data'>('loading')
  const [tableData, setTableData] = useState<TableRow[]>([])
  const numberFormatter = useMemo(() => Intl.NumberFormat('en-US', {notation: 'standard'}), [])
  const paths = usePaths()

  useEffect(() => {
    async function fetchData(): Promise<void> {
      setState('loading')

      const url = paths.advisoriesPath({startDate, endDate, query})
      const data = await tryFetchJson<FetchResponse>(url)

      if (data == null) {
        setState('error')
        return
      }

      const rows = data.advisories.map<TableRow>((advisory, idx) => {
        return {
          ...advisory,
          id: idx,
          url: `/advisories/${advisory.ghsaId}`,
          cveId: advisory.cveId ?? '-',
          openAlerts: numberFormatter.format(advisory.openAlerts),
        }
      })

      if (data.advisories.length === 0) {
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

  if (state === 'error') {
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
        data={tableData}
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
