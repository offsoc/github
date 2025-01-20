import DataCard from '@github-ui/data-card'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Label, Text} from '@primer/react'
import {Blankslate, DataTable, Table} from '@primer/react/drafts'
import {useEffect, useMemo, useState} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {tryFetchJson} from '../../common/utils/fetch-json'
import type CardProps from '../types/card-props'
import SeverityChip from './SeverityChip'

interface Data {
  countOpenAlerts: number
  cwes: string[]
  name: string
  severity: string
}

interface TableRow extends Data {
  id: number
}

interface FetchResponse {
  data: Data[]
}

export function SastTable({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const [state, setState] = useState<'loading' | 'error' | 'no data' | 'data'>('loading')
  const [tableData, setTableData] = useState<TableRow[]>([])
  const paths = usePaths()

  useEffect(() => {
    async function fetchData(): Promise<void> {
      setState('loading')

      const url = paths.sastPath({startDate, endDate, query})
      const result = await tryFetchJson<FetchResponse>(url)

      if (result == null) {
        setState('error')
        return
      }

      const rows = result.data.map<TableRow>((item, idx) => {
        return {...item, id: idx}
      })

      if (rows.length === 0) {
        setState('no data')
      } else {
        setTableData(rows)
        setState('data')
      }
    }

    fetchData()
  }, [paths, startDate, endDate, query])

  const blankslateParentStyle = useMemo(() => {
    return {display: 'flex', flexDirection: 'column', height: 366, width: '100%', justifyContent: 'center'}
  }, [])

  if (state === 'loading') {
    return (
      <Table.Container sx={{my: 4}}>
        <Table.Skeleton
          columns={[
            {header: 'Type'},
            {header: 'Common Weakness Enumerator'},
            {header: 'Open alerts'},
            {header: 'Severity'},
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
          <Blankslate.Description>Information could not be loaded right now</Blankslate.Description>
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
            header: 'Type',
            field: 'name',
            renderCell: (data: TableRow) => <Text sx={{fontWeight: 'bold'}}>{data.name}</Text>,
          },
          {
            header: 'Common Weakness Enumerator',
            field: 'cwes',
            renderCell: (data: TableRow) =>
              data.cwes.map((cwe, idx) => (
                <Label key={idx} variant="secondary">
                  {cwe}
                </Label>
              )),
          },
          {
            header: 'Open alerts',
            field: 'countOpenAlerts',
            align: 'end',
          },
          {
            header: 'Severity',
            field: 'severity',
            renderCell: (data: TableRow) => <SeverityChip severity={data.severity} />,
          },
        ]}
      />
    </Table.Container>
  )
}
