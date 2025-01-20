import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'
import {useEffect, useState} from 'react'

import {CursorPagination} from '../../../common/components/cursor-pagination'
import type {GroupKey} from '../../types'
import {EmptyDataBlankslate, ListErrorBlankslate} from '../blankslates'
import {AlertListGroupItem} from './AlertListGroupItem'
import {useAlertGroupsQuery} from './use-alert-groups-query'

interface Props {
  groupKey: GroupKey
  query: string
}

export function AlertListGroupItems({groupKey, query}: Props): JSX.Element {
  // track paging cursor; reset when query changes
  const [cursor, setCursor] = useState<string | undefined>()
  useEffect(() => setCursor(undefined), [query])

  const groupsQuery = useAlertGroupsQuery({groupKey, query, cursor})

  if (groupKey === 'none') {
    return <></>
  }

  if (groupsQuery.isPending) {
    return <ListLoading rowCount={5} />
  }

  if (groupsQuery.isError) {
    return <ListErrorBlankslate />
  }

  if (groupsQuery.data.alertGroups.length === 0) {
    return (
      <>
        <span data-hpc hidden />
        <EmptyDataBlankslate
          heading="No alert groups found"
          description="Try modifying your filters or selecting a different group option."
        />
      </>
    )
  }

  return (
    <>
      <span data-hpc hidden />
      {groupsQuery.data.alertGroups.map(alertGroup => {
        return (
          <AlertListGroupItem
            key={`${groupKey}-${alertGroup.key}`}
            groupKey={groupKey}
            groupValue={alertGroup.key}
            query={query}
            label={alertGroup.name}
            counts={{
              critical: alertGroup.countCritical,
              high: alertGroup.countHigh,
              medium: alertGroup.countMedium,
              low: alertGroup.countLow,
            }}
            totalCount={alertGroup.total}
          />
        )
      })}

      <Box
        as="li"
        role="listitem"
        aria-label="Paging controls for alert groups"
        sx={{backgroundColor: 'canvas.subtle', py: 2}}
      >
        <CursorPagination
          previousCursor={groupsQuery.data.previous}
          nextCursor={groupsQuery.data.next}
          onPageChange={setCursor}
        />
      </Box>
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
    const min = 15
    const max = 30
    const randomWidth = Math.floor(Math.random() * (max - min + 1) + min)
    return `${randomWidth}%`
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'canvas.subtle',
          padding: '8px',
          paddingLeft: '50px',
          paddingRight: '16px',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'border.muted',
        }}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <LoadingSkeleton variant="rounded" height="md" width={randomLabelWidth()} />
          <LoadingSkeleton variant="rounded" height="sm" width={'350px'} marginY={'2px'} />
        </Box>
      </Box>
    </>
  )
}
