import {ActionList, ActionMenu} from '@primer/react'
import {Observer} from '../observables/Observer'
import type {IMetricsService} from '../services/metrics-service'
import {DateRangeType, GET_DATE_RANGE_LABEL} from '../models/enums'
import type {MetricsView} from '../models/models'
import {Services} from '../services/services'
import type {IAnalyticsService} from '../services/analytics-service'
import {LABELS} from '../resources/labels'

export interface MetricsDateRangeSelectorProps {
  metricsService: IMetricsService
}

export const MetricsDateRangeSelector = (props: MetricsDateRangeSelectorProps) => {
  const analyticsService = Services.get<IAnalyticsService>('IAnalyticsService')
  const metricsService = props.metricsService
  const state = metricsService.getMetricsView()

  const dateRangeOptions: DateRangeOption[] = [
    GET_DATE_RANGE_OPTION(DateRangeType.CurrentWeek),
    GET_DATE_RANGE_OPTION(DateRangeType.CurrentMonth),
    GET_DATE_RANGE_OPTION(DateRangeType.LastMonth),
    GET_DATE_RANGE_OPTION(DateRangeType.Last30Days),
    GET_DATE_RANGE_OPTION(DateRangeType.Last90Days),
    GET_DATE_RANGE_OPTION(DateRangeType.LastYear),
  ]

  return (
    <Observer state={state}>
      {(obs: {state: MetricsView}) => {
        const selectedOptionIndex = dateRangeOptions.findIndex(
          (option: DateRangeOption) => option.key === obs.state.dateRangeType,
        )
        const selectedOption = dateRangeOptions[selectedOptionIndex]
        return (
          <ActionMenu>
            <ActionMenu.Button>
              <span>
                {LABELS.period}: {selectedOption?.display}
              </span>
            </ActionMenu.Button>
            <ActionMenu.Overlay width="medium">
              <ActionList selectionVariant="single">
                {dateRangeOptions.map((option, index) => (
                  <ActionList.Item
                    key={index}
                    selected={index === selectedOptionIndex}
                    onSelect={() => {
                      analyticsService.logEvent('date-range-selector.select', 'MetricsDateRangeSelector', {
                        date: option.key,
                        previous: JSON.stringify(obs.state),
                      })
                      metricsService.setDateRange(option.key)
                    }}
                  >
                    {option.display}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )
      }}
    </Observer>
  )
}

interface DateRangeOption {
  key: DateRangeType
  display: string
}

const GET_DATE_RANGE_OPTION = (dateRange: DateRangeType): DateRangeOption => {
  return {display: GET_DATE_RANGE_LABEL(dateRange), key: dateRange}
}
