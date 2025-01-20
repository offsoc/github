import {DownloadIcon} from '@primer/octicons-react'
import type {IMetricsService} from '../services/metrics-service'
import {Box, IconButton, Spinner} from '@primer/react'
import {LABELS} from '../resources/labels'
import {Observer} from '../observables/Observer'
import type {MetricsView} from '../models/models'
import type {IAnalyticsService} from '../services/analytics-service'
import {Services} from '../services/services'
export interface MetricsExportProps {
  metricsService: IMetricsService
}

export const MetricsExport = (props: MetricsExportProps) => {
  const analyticsService = Services.get<IAnalyticsService>('IAnalyticsService')
  const isExporting = props.metricsService.getIsExporting()
  const state = props.metricsService.getMetricsView()
  return (
    <Observer isExporting={isExporting} state={state}>
      {(obs: {isExporting: boolean; state: MetricsView}) => {
        if (!obs.isExporting) {
          return (
            <div>
              <IconButton
                tooltipDirection="w"
                description={LABELS.downloadReport}
                aria-label={LABELS.downloadReport}
                icon={DownloadIcon}
                size="small"
                onClick={() => {
                  analyticsService.logEvent('export.click', 'MetricsExport', {
                    view: props.metricsService.getMetricsView().value,
                  })
                  props.metricsService.downloadExport()
                }}
                variant="invisible"
                disabled={!state.value.totalItems}
              />
            </div>
          )
        } else {
          return (
            <Box className="mt-1" sx={{width: 22, height: 18}}>
              <Spinner size="small" srText={LABELS.loading} />
            </Box>
          )
        }
      }}
    </Observer>
  )
}
