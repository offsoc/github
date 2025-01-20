import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {StatCard} from '../components/StatCard'
import {FilterOption} from '../components/FilterOption'
import {PeriodFilter} from '../components/PeriodFilter'
import {RequestsTable} from '../components/RequestsTable'
import {testIdProps} from '@github-ui/test-id-props'
import {Breadcrumbs} from '@primer/react'
import {Suspense, lazy} from 'react'

import type {FilterOptionProps} from '../components/FilterOption'
import type {PeriodFilterProps} from '../components/PeriodFilter'
import type {RequestsTableProps} from '../components/RequestsTable'

const RequestsChart = lazy(() => import('../components/RequestsChart'))

export interface InstallationsPayload {
  breadcrumb: {
    api_insights_base_url: string
    name: string
  }
  installation_stats: {
    request_count: string
    rate_limited_request_count: string
    current_limit: string
  }
  time_stats: {
    request_count: Array<[number, number]>
    rate_limited_request_count: Array<[number, number]>
  }
  time_filters: [PeriodFilterProps, FilterOptionProps]
  requests_table: RequestsTableProps
}

export function Installations() {
  const {
    breadcrumb: {api_insights_base_url, name},
    installation_stats: {request_count, rate_limited_request_count, current_limit},
    time_stats,
    time_filters: [period_filter, interval_filter],
    requests_table,
  } = useRoutePayload<InstallationsPayload>()

  return (
    <div className="d-flex flex-column no-wrap gap-3">
      <Breadcrumbs>
        <Breadcrumbs.Item href={api_insights_base_url}>API</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>{name}</Breadcrumbs.Item>
      </Breadcrumbs>
      <div className="d-flex flex-column flex-lg-row border-bottom flex-justify-between pb-2">
        <h1 className="h3" data-hpc {...testIdProps('api-insights-header')}>
          API Insights
        </h1>
        <div className="d-flex gap-2">
          {period_filter && <PeriodFilter {...period_filter} />}
          {interval_filter && <FilterOption {...interval_filter} />}
        </div>
      </div>
      <div className="d-flex flex-column flex-lg-row pb-2 flex-justify-between gap-3">
        <StatCard
          title="Total Requests"
          stat={request_count}
          description="Total amount of requests for this API client"
          {...testIdProps('total-requests')}
        />
        <StatCard
          title="Rate-limited requests"
          stat={rate_limited_request_count}
          description="Total amount of requests that were rate-limited"
          {...testIdProps('rate-limited-requests')}
        />
        <StatCard
          title="Current limit"
          stat={current_limit}
          delimiter="hour"
          description="Current limit of allowed requests per hour"
          {...testIdProps('current-limit')}
        />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <RequestsChart
          request_count={time_stats.request_count}
          rate_limited_request_count={time_stats.rate_limited_request_count}
        />
      </Suspense>
      <RequestsTable {...requests_table} />
    </div>
  )
}
