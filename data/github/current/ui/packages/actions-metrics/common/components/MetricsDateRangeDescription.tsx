import {Observer} from '../observables/Observer'
import {LABELS} from '../resources/labels'
import type {IMetricsService} from '../services/metrics-service'
import type {MetricsView} from '../models/models'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {DateRangeType} from '../models/enums'
import type {ReactNode} from 'react'
import {RelativeTime} from '@primer/react'
import {Utils} from '../utils/utils'

export interface MetricsDateRangeDescriptionProps {
  metricsService: IMetricsService
}

export const MetricsDateRangeDescription = (props: MetricsDateRangeDescriptionProps) => {
  const metricsService = props.metricsService

  return (
    <Observer loading={metricsService.getLoading()} view={metricsService.getMetricsView()}>
      {(obs: {loading: boolean; view: MetricsView}) => {
        if (obs.loading) {
          return <LoadingSkeleton height={'21px'} width={'300px'} />
        }

        const start = Utils.getUTCDateString(obs.view.startTime)
        let end: ReactNode = <RelativeTime date={obs.view.endTime} />

        if (obs.view.dateRangeType === DateRangeType.LastMonth) {
          end = Utils.getUTCDateString(obs.view.endTime)
        }

        return (
          <span>
            {`${LABELS.dateDescription} ${start} ${LABELS.dateDescriptionDelimiter} `}
            {end}
          </span>
        )
      }}
    </Observer>
  )
}
