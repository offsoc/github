import type React from 'react'
import {useState, type ReactElement} from 'react'
import {AlertsList, type AlertsListProps} from './AlertsList'
import {useOrgAlertsQuery} from '../hooks/use-org-alerts-query'
import type {GetAlertsCursor} from '../types/get-alerts-request'
import {AlertsListItems} from './AlertsListItems'
import {AlertListItem} from './AlertListItem'

export type OrgAlertsListProps = {
  alertsPath: string
  alertsGroupsPath: string
  query: string
  onStateFilterChange: (state: 'open' | 'closed') => void
} & Pick<AlertsListProps, 'actions'>

export function OrgAlertsList({alertsPath, query, onStateFilterChange, actions}: OrgAlertsListProps): React.ReactNode {
  const [cursor, setCursor] = useState<GetAlertsCursor | null>(null)
  const alertsQuery = useOrgAlertsQuery(alertsPath, {query, cursor})

  return (
    <AlertsList
      openCount={alertsQuery.data?.openCount}
      closedCount={alertsQuery.data?.closedCount}
      prevCursor={alertsQuery.data?.prevCursor}
      nextCursor={alertsQuery.data?.nextCursor}
      isLoading={alertsQuery.isLoading}
      isError={alertsQuery.isError}
      query={query}
      onStateFilterChange={onStateFilterChange}
      onCursorChange={setCursor}
      actions={actions}
    >
      <AlertsListItems
        alerts={alertsQuery.data?.alerts || []}
        query={query}
        isLoading={alertsQuery.isLoading}
        isError={alertsQuery.isError}
        renderAlert={props => <AlertListItem alert={props} showRepository />}
      />
    </AlertsList>
  )
}
