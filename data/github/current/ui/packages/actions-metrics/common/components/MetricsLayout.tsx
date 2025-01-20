import {Box, Label} from '@primer/react'
import {MetricsRouteHelper, type MetricsRouteHelperProps} from './MetricsRouteHelper'
import {MetricsError} from './MetricsError'
import {MetricsDateRangeSelector} from './MetricsDateRangeSelector'
import type {IMetricsService} from '../services/metrics-service'
import {MetricsSideNav} from './MetricsSideNav'
import {PageHeader} from '@primer/react/drafts'
import {MetricsDateRangeDescription} from './MetricsDateRangeDescription'
import {LABELS} from '../resources/labels'
import {Services} from '../services/services'

export interface MetricsLayoutProps extends MetricsHeaderProps, MetricsRouteHelperProps {
  children: React.ReactNode
  hideSideNav?: boolean
}

export function MetricsLayout(props: MetricsLayoutProps) {
  if (props.hideSideNav === false) {
    return (
      <>
        <MetricsRouteHelper metricsService={props.metricsService} />
        <div>
          <MetricsHeader {...props} />
          <MetricsError />
          {props.children}
        </div>
        <div />
      </>
    )
  }

  return (
    <>
      <MetricsRouteHelper metricsService={props.metricsService} />
      <div className="d-flex flex-column flex-lg-row flex-content-stretch">
        <MetricsSideNav />
        <Box className="flex-1 mx-lg-auto" sx={{maxWidth: 1664 /* 1280 + 336 (side nav width) + 48 padding */, p: 4}}>
          <div className="container-xl mx-auto mr-lg-auto ml-lg-0">
            <MetricsHeader {...props} />
            <MetricsError />
            {props.children}
          </div>
        </Box>
      </div>
      <div />
    </>
  )
}

export interface MetricsHeaderProps {
  beta?: boolean
  title: string
}

export function MetricsHeader(props: MetricsHeaderProps) {
  const metricsService = Services.get<IMetricsService>('IMetricsService')
  return (
    <>
      <PageHeader
        className="hide-sm"
        sx={{
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderColor: 'border.default',
          pb: 2,
          mb: 3,
        }}
      >
        <PageHeader.TitleArea>
          <PageHeader.Title as="h1">{props.title}</PageHeader.Title>
          <PageHeader.TrailingVisual>
            {props.beta && <Label variant="success">{LABELS.beta}</Label>}
          </PageHeader.TrailingVisual>
        </PageHeader.TitleArea>
        <PageHeader.Actions>
          <MetricsDateRangeSelector metricsService={metricsService} />
        </PageHeader.Actions>
        <PageHeader.Description>
          <MetricsDateRangeDescription metricsService={metricsService} />
        </PageHeader.Description>
      </PageHeader>

      <Box
        className="d-flex flex-column hide-md hide-lg hide-xl"
        sx={{
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderColor: 'border.default',
          pb: 2,
          mb: 3,
        }}
      >
        <PageHeader>
          <PageHeader.TitleArea>
            <PageHeader.Title as="h1">{props.title}</PageHeader.Title>
            <PageHeader.TrailingVisual>
              {props.beta && <Label variant="success">{LABELS.beta}</Label>}
            </PageHeader.TrailingVisual>
          </PageHeader.TitleArea>
        </PageHeader>
        <div className="py-2">
          <MetricsDateRangeSelector metricsService={metricsService} />
        </div>
        <MetricsDateRangeDescription metricsService={metricsService} />
      </Box>
    </>
  )
}
