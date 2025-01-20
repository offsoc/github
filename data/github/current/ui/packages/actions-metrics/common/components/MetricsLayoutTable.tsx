import {MetricsLayout, type MetricsHeaderProps} from './MetricsLayout'
import {LABELS} from '../resources/labels'
import {MetricsTable} from './MetricsTable'
import {Observer} from '../observables/Observer'
import type {FilterProvider} from '@github-ui/filter'
import {MetricsFilter} from './MetricsFilter'
import {ZeroDataType} from '../models/enums'
import {MetricsZeroData} from './MetricsZeroData'
import {ZERO_DATA_RESOURCES} from '../resources/zero-data'
import {MetricsExport} from './MetricsExport'
import {MetricsTabs} from './MetricsTabs'
import type {IMetricsService} from '../services/metrics-service'
import {Services} from '../services/services'
import {MetricsHeroCards} from './MetricsHeroCards'

export interface MetricsLayoutTableProps extends MetricsHeaderProps {
  hideSideNav?: boolean
}

export function MetricsLayoutTable(props: MetricsLayoutTableProps) {
  const metricsService = Services.get<IMetricsService>('IMetricsService')
  const providers = metricsService.getFilterProviders()
  const zeroData = metricsService.getZeroDataState()

  return (
    <MetricsLayout
      title={props.title ?? LABELS.actions}
      metricsService={metricsService}
      hideSideNav={props.hideSideNav}
      beta={props.beta}
    >
      <MetricsHeroCards />
      <MetricsTabs metricsService={metricsService}>
        <div className="d-flex pb-3">
          <div className="flex-1">
            <Observer providers={providers}>
              {(obs: {providers: FilterProvider[]}) => {
                return (
                  <MetricsFilter
                    metricsService={metricsService}
                    onChange={filters => metricsService.setFilters(filters)}
                    providers={obs.providers}
                  />
                )
              }}
            </Observer>
          </div>
          <div className="d-flex flex-nowrap flex-items-center flex-self-start mt-1 pl-1">
            <MetricsExport metricsService={metricsService} />
          </div>
        </div>

        <Observer zeroData={zeroData}>
          {(obs: {zeroData: ZeroDataType}) => {
            if (obs.zeroData === ZeroDataType.Start) {
              return (
                <MetricsZeroData
                  heading={ZERO_DATA_RESOURCES.start.heading}
                  description={ZERO_DATA_RESOURCES.start.description}
                  secondaryActionText={ZERO_DATA_RESOURCES.start.action}
                  secondaryActionHref={'https://docs.github.com/actions/quickstart'}
                />
              )
            }

            if (obs.zeroData === ZeroDataType.Search) {
              return (
                <MetricsZeroData
                  heading={ZERO_DATA_RESOURCES.search.heading}
                  description={ZERO_DATA_RESOURCES.search.description}
                />
              )
            }

            return <MetricsTable metricsService={metricsService} />
          }}
        </Observer>
      </MetricsTabs>
    </MetricsLayout>
  )
}
