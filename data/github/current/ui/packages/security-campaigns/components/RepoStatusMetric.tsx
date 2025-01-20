import {useRepoAlertsQuery} from '../hooks/use-repo-alerts-query'
import {defaultQuery} from './AlertsList'
import {StatusMetric} from './StatusMetric'

interface RepoStatusMetricProps {
  alertsPath: string
  endsAt: Date
}

export function RepoStatusMetric({alertsPath, endsAt}: RepoStatusMetricProps) {
  // Always make this request separately since we don't want to apply any filters here
  const query = useRepoAlertsQuery(alertsPath, {query: defaultQuery, cursor: null})

  return <StatusMetric endsAt={endsAt} isCompleted={query.data?.openCount === 0} />
}
