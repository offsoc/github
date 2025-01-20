import {Box, TabNav} from '@primer/react'
import type {IMetricsService} from '../services/metrics-service'
import type {MetricsTab, MetricsViewReadOnly} from '../models/models'
import {Observer} from '../observables/Observer'
import type {Icon, IconProps} from '@primer/octicons-react'
import type {IAnalyticsService} from '../services/analytics-service'
import {Services} from '../services/services'

export interface MetricsTabsProps {
  children: React.ReactNode
  metricsService: IMetricsService
  panelId?: string
}
export const MetricsTabs = (props: MetricsTabsProps) => {
  const analyticsService = Services.get<IAnalyticsService>('IAnalyticsService')
  const metricsService = props.metricsService
  const tabs = metricsService.getTabs()
  const view = metricsService.getMetricsView()
  return (
    <div>
      <Observer view={view} tabs={tabs}>
        {(obs: {view: MetricsViewReadOnly; tabs: MetricsTab[]}) => {
          return (
            <TabNav>
              {obs.tabs.map((tab, index) => {
                const preview = metricsService.setTab(tab.value, {preview: true})
                const url = metricsService.getViewUrl(preview)
                return (
                  <MetricsTabButton
                    key={tab.value}
                    href={url}
                    value={tab.value}
                    displayValue={tab.displayValue}
                    icon={tab.icon}
                    panelId={props.panelId}
                    onClick={value => {
                      analyticsService.logEvent('tab.click', 'MetricsTabs', {
                        tab: tab.value,
                        previous: JSON.stringify(obs.view),
                      })

                      metricsService.setTab(value)
                    }}
                    selected={obs.view.tab === tab.value || (index === 0 && !obs.view.tab)}
                  />
                )
              })}
            </TabNav>
          )
        }}
      </Observer>
      <MetricsTabPanel id={props.panelId}>{props.children}</MetricsTabPanel>
    </div>
  )
}

export interface MetricsTabButtonProps {
  displayValue?: string
  href?: string
  icon: Icon
  onClick: (value: string) => void
  panelId?: string
  selected: boolean
  value: string
}
export const MetricsTabButton = (props: MetricsTabButtonProps) => {
  const TabIcon = iconHelper(props.icon)
  return (
    <TabNav.Link
      className="d-flex flex-nowrap flex-items-center"
      id={props.value}
      href={props.href}
      aria-controls={props.panelId ?? 'metrics-tab-panel'}
      selected={props.selected}
      onClick={event => {
        props.onClick(props.value)
        event.preventDefault()
        event.defaultPrevented = true
      }}
      role="tab"
      sx={{
        cursor: props.selected ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        color: props.selected ? undefined : 'fg.muted',
        ':hover': props.selected
          ? undefined
          : {
              color: 'fg.default',
            },
      }}
    >
      <TabIcon className="mr-2" />
      {props.displayValue ?? props.value}
    </TabNav.Link>
  )
}

export interface MetricsTabPanelProps {
  id?: string
  children: React.ReactNode
}
export const MetricsTabPanel = (props: MetricsTabPanelProps) => {
  return (
    <Box id={props.id ?? 'metrics-tab-panel'} role="tabpanel" sx={{pt: 3}}>
      {props.children}
    </Box>
  )
}

const iconHelper = (icon: Icon): React.FC<IconProps & {children?: React.ReactNode}> => {
  return icon
}
