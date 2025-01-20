import {useRepoAlertsQuery} from '../hooks/use-repo-alerts-query'
import {defaultQuery} from './AlertsList'
import {ProgressMetric} from './ProgressMetric'

interface RepoProgressMetricProps {
  alertsPath: string
  endsAt: Date
  createdAt: Date
}

export function RepoProgressMetric({alertsPath, endsAt, createdAt}: RepoProgressMetricProps) {
  // Always make this request separately since we don't want to apply any filters here
  const query = useRepoAlertsQuery(alertsPath, {query: defaultQuery, cursor: null})

  return (
    <ProgressMetric
      openCount={query.data?.openCount}
      closedCount={query.data?.closedCount}
      isSuccess={query.isSuccess}
      endsAt={endsAt}
      createdAt={createdAt}
    />
  )
}
