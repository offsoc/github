import {Text} from '@primer/react'
import {type Column, DataTable, Table} from '@primer/react/drafts'
import {useMemo} from 'react'

import {humanReadableDate} from '../../common/utils/date-formatter'
import type {DataState, EnablementCounts} from '../hooks/use-enablement-trend-data'
import {
  asDataState,
  calculatePercentage,
  isErrorState,
  isLoadingState,
  isNoDataState,
} from '../hooks/use-enablement-trend-data'

export type TableColumn = {
  label: string
  field: keyof EnablementCounts
}

export type TableRow = {
  id: string | number
  date: string
  totalRepositories: number
} & Partial<EnablementCounts>

export interface EnablementTrendTableProps {
  state: 'loading' | 'error' | 'no-data' | 'ready'
  columns: TableColumn[]
  rows: TableRow[]
}

const numberFormatter = Intl.NumberFormat('en-US', {notation: 'standard'})
const dateColumn: Column<TableRow> = {
  header: 'Date',
  field: 'date',
  renderCell: (row: TableRow): JSX.Element => {
    const dateString = humanReadableDate(new Date(row.date), {includeYear: true})
    return <Text sx={{lineHeight: 2, fontWeight: 'bold'}}>{dateString}</Text>
  },
}

export function EnablementTrendTable({state, columns, rows}: EnablementTrendTableProps): JSX.Element {
  const featureColumns: Array<Column<TableRow>> = useMemo(() => {
    return columns.map(c => ({
      header: c.label,
      field: c.field,
      align: 'end',
      renderCell: (row: TableRow): JSX.Element => {
        const numerator = row[c.field] || 0
        const denominator = row.totalRepositories
        const percentage = calculatePercentage(numerator, denominator)

        return (
          <Text sx={{lineHeight: 2}}>
            {`${percentage}% (${numberFormatter.format(numerator)} / ${numberFormatter.format(denominator)})`}
          </Text>
        )
      },
    }))
  }, [columns])

  const dataState: DataState<TableRow[]> = asDataState(state, rows)

  if (isLoadingState(dataState)) {
    return (
      <Table.Container sx={{mb: 4}}>
        <Table.Skeleton data-testid="loading-indicator" columns={[dateColumn, ...featureColumns]} rows={10} />
      </Table.Container>
    )
  }

  if (isErrorState(dataState)) {
    return <div data-testid="error-indicator" />
  }

  if (isNoDataState(dataState)) {
    return <div data-testid="no-data-indicator" />
  }

  return (
    <Table.Container sx={{mb: 4}}>
      <DataTable data-testid="enablement-trend-table" data={rows} columns={[dateColumn, ...featureColumns]} />
    </Table.Container>
  )
}
