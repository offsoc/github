import type {FilterProvider, FilterQuery} from '@github-ui/filter'
import {BlockType, Filter, ValidationMessage} from '@github-ui/filter'
import type {FilterValue, MetricsView} from '../models/models'
import {Observer} from '../observables/Observer'
import {LABELS} from '../resources/labels'
import type {IAnalyticsService} from '../services/analytics-service'
import type {IMetricsService} from '../services/metrics-service'
import {Services} from '../services/services'
import {FilterUtils} from '../utils/filter-utils'
import {useCallback, useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

export interface MetricsFilterProps {
  metricsService: IMetricsService
  providers: FilterProvider[]
  onChange: (filters?: FilterValue[]) => void
}

export const MetricsFilter = (props: MetricsFilterProps) => {
  const analyticsService = Services.get<IAnalyticsService>('IAnalyticsService')
  const view = props.metricsService.getMetricsView()

  const [filterText, setFilterText] = useState<string>(FilterUtils.stringifyFilters(view.value.filters) ?? '')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (FilterUtils.stringifyFilters(view.value.filters) !== filterText) {
      setFilterText(FilterUtils.stringifyFilters(view.value.filters) ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    // fix issue where onSubmit is not triggered when filter is cleared
    if (!filterText) {
      onChangeInternal('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText])

  // this provides a temporary fix to prevent users from using text filters on tabs it is not supported on,
  // see https://github.slack.com/archives/C06NSCQJS23/p1721247830298919 for more info
  const [validationMessage, setValidationMessage] = useState<string[]>([])
  const validationCallback = useCallback((_: string[], request: FilterQuery) => {
    const rawText = []
    for (const block of request.blocks) {
      if (block.type === BlockType.Text && !FilterUtils.TextFilterSupportEnabled(props.providers)) {
        const errorMessage = `${LABELS.filterValidationMessage}: <pre>${block.raw}</pre>`
        rawText.push(errorMessage)
      }
    }
    if (rawText.length > 0 || request.errors.length > 0) {
      setValidationMessage([...request.errors, ...rawText])
    } else {
      setValidationMessage([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onChangeInternal(newFilter: string) {
    analyticsService.logEvent('filter.change', 'MetricsFilter', {filter: newFilter})
    onChange(props, newFilter)
  }

  return (
    <Observer view={view}>
      {(obs: {view: MetricsView}) => {
        return (
          <div>
            <Filter
              key={`metrics-filter-${obs.view.tab}`}
              id={'metrics-filter'}
              label={LABELS.filter}
              onChange={v => setFilterText(v)}
              onSubmit={request => onChangeInternal(request.raw)}
              providers={props.providers}
              filterValue={filterText}
              variant={'full'}
              settings={{disableAdvancedTextFilter: true}}
              onValidation={validationCallback}
            />
            {validationMessage.length > 0 && (
              <ValidationMessage
                messages={validationMessage}
                key={`metrics-filter-validation-message-${obs.view.tab}`}
                id={'metrics-filter-validation-message'}
              />
            )}
          </div>
        )
      }}
    </Observer>
  )
}

const onChange = (props: MetricsFilterProps, filter: string) => {
  const newParsed = FilterUtils.parseFilter(props.providers, filter)
  props.onChange(newParsed)
}
