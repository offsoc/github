import type {TimePeriod} from './types'
import {Chart} from './components/Chart'
import {useChartData, StatKey} from './hooks/use-chart-data'

export interface EnterpriseServerStatsProps extends React.ComponentProps<'div'> {
  enterpriseSlug: string
  selectedServer: string
  timePeriod: TimePeriod
}

export function EnterpriseServerStats({
  enterpriseSlug,
  selectedServer: server,
  timePeriod: period,
  ...restProps
}: EnterpriseServerStatsProps) {
  const chartOptions = {enterpriseSlug, period, server}
  const issuesChart = useChartData(StatKey.Issues, chartOptions)
  const pullsChart = useChartData(StatKey.Pulls, chartOptions)
  const reposChart = useChartData(StatKey.Repos, chartOptions)
  const usersChart = useChartData(StatKey.Users, chartOptions)
  const orgsChart = useChartData(StatKey.Orgs, chartOptions)

  return (
    <div {...restProps}>
      {[issuesChart, pullsChart, reposChart, usersChart, orgsChart].map(({loading, error, title, statKey, data}) => (
        <Chart
          data-hpc
          error={error ? `Could not load ${title} data` : undefined}
          key={statKey}
          loading={loading}
          sx={{my: 4}}
          title={title}
          {...data}
        />
      ))}
    </div>
  )
}
