import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'
import {useEffect, useState} from 'react'

import {CursorPagination} from '../../../common/components/cursor-pagination'
import type {GroupKey} from '../../types'
import {EmptyDataBlankslate, ListErrorBlankslate} from '../blankslates'
import {AlertListItem} from './AlertListItem'
import {useAlertsQuery} from './use-alerts-query'

interface Props {
  groupKey: GroupKey
  groupValue?: string
  query: string
}

export function AlertListItems(props: Props): JSX.Element {
  // track paging cursor; reset when query changes
  const [cursor, setCursor] = useState<string | undefined>()
  useEffect(() => setCursor(undefined), [props.query])

  const alertsQuery = useAlertsQuery({...props, cursor})

  if (alertsQuery.isPending) {
    return <ListLoading rowCount={5} />
  }

  if (alertsQuery.isError) {
    return <ListErrorBlankslate />
  }

  if (alertsQuery.data.alerts.length === 0) {
    return (
      <>
        <span data-hpc hidden />
        <EmptyDataBlankslate
          heading="No alerts found"
          description="Try modifying your filters or selecting a different group option."
        />
      </>
    )
  }

  // eslint-disable-next-line prettier/prettier
  const pagingAriaLabel = props.groupKey === 'none'
    ? "Paging controls for alerts in the current group"
    : "Paging controls for alerts"

  return (
    <>
      <span data-hpc hidden />
      {alertsQuery.data.alerts.map(alert => {
        return <AlertListItem key={`${alert.repositoryId}:${alert.featureType}:${alert.alertNumber}`} {...alert} />
      })}

      <li aria-label={pagingAriaLabel}>
        <CursorPagination
          previousCursor={alertsQuery.data.previous}
          nextCursor={alertsQuery.data.next}
          onPageChange={setCursor}
        />
      </li>
    </>
  )
}

function ListLoading({rowCount}: {rowCount: number}): JSX.Element {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      {[...Array(rowCount)].map((_, index) => (
        <RowLoading key={index} />
      ))}
    </>
  )
}

function RowLoading(): JSX.Element {
  function randomLabelWidth(): string {
    const min = 40
    const max = 60
    const randomWidth = Math.floor(Math.random() * (max - min + 1) + min)
    return `${randomWidth}%`
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          paddingX: '12px',
          paddingY: '8px',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'border.muted',
        }}
      >
        <LoadingSkeleton variant="elliptical" height="md" width="md" />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <LoadingSkeleton variant="rounded" height="sm" width={randomLabelWidth()} />
          <LoadingSkeleton variant="rounded" height="12px" width={randomLabelWidth()} sx={{marginTop: '8px'}} />
        </Box>
      </Box>
    </>
  )
}
