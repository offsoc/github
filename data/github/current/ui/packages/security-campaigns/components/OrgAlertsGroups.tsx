import {useState, useCallback} from 'react'
import type {AlertsGroup, GetAlertsGroupsCursor} from '../types/get-alerts-groups-request'
import {AlertsList, type AlertsListProps} from './AlertsList'
import {useOrgAlertsGroupsQuery} from '../hooks/use-org-alerts-groups-query'
import {AlertsListGroups} from './AlertsListGroups'
import {AlertListGroup} from './AlertListGroup'
import type {GetAlertsCursor} from '../types/get-alerts-request'
import {useOrgAlertsQuery} from '../hooks/use-org-alerts-query'
import {AlertsListItems} from './AlertsListItems'
import {AlertListItem} from './AlertListItem'
import {PrevNextPagination} from './PrevNextPagination'

function RepositoriesAlerts({
  alertsPath,
  query,
  repositories,
}: {
  alertsPath: string
  query: string
  repositories: string[]
}) {
  const scopedQuery = [query, ...repositories.map(repo => `repo:${repo}`)].join(' ')

  const [cursor, setCursor] = useState<GetAlertsCursor | null>(null)
  const alertsQuery = useOrgAlertsQuery(alertsPath, {query: scopedQuery, cursor})

  return (
    <>
      <AlertsListItems
        alerts={alertsQuery.data?.alerts || []}
        query={query}
        isLoading={alertsQuery.isLoading}
        isError={alertsQuery.isError}
        renderAlert={props => <AlertListItem alert={props} showRepository />}
      />
      <PrevNextPagination
        onCursorChange={setCursor}
        prevCursor={alertsQuery.data?.prevCursor}
        nextCursor={alertsQuery.data?.nextCursor}
      />
    </>
  )
}

export type OrgAlertsGroupsProps = {
  group: AlertsGroup
  alertsPath: string
  alertsGroupsPath: string
  query: string
  onStateFilterChange: (state: 'open' | 'closed') => void
} & Pick<AlertsListProps, 'actions'>

export function OrgAlertsGroups({
  actions,
  alertsGroupsPath,
  alertsPath,
  group,
  onStateFilterChange,
  query,
}: OrgAlertsGroupsProps): React.ReactNode {
  const [cursor, setCursor] = useState<GetAlertsGroupsCursor | null>(null)

  const [isExpanded, setIsExpanded] = useState<{[key: string]: boolean}>({})
  const toggleExpanded = useCallback(
    async (expandedGroup: string) => {
      setIsExpanded({
        ...isExpanded,
        [expandedGroup]: !isExpanded[expandedGroup],
      })
    },
    [isExpanded, setIsExpanded],
  )

  const alertsQuery = useOrgAlertsGroupsQuery(alertsGroupsPath, {query, group, cursor})

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
      <AlertsListGroups
        groups={alertsQuery.data?.groups || []}
        query={query}
        isLoading={alertsQuery.isLoading}
        isError={alertsQuery.isError}
        renderGroup={props => (
          <AlertListGroup
            group={props}
            expanded={isExpanded[props.title] || false}
            onExpandedChange={toggleExpanded}
            renderGroup={({repositories}) => (
              <RepositoriesAlerts repositories={repositories} alertsPath={alertsPath} query={query} />
            )}
          />
        )}
      />
    </AlertsList>
  )
}
