import {PlayIcon, type Icon, PackageIcon, CodeSquareIcon} from '@primer/octicons-react'
import {Box, Heading, Label, NavList, Octicon} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'

export interface InsightsSidenavProps {
  selectedKey?: 'dependency_insights' | 'actions_usage_metrics' | 'actions_performance_metrics' | 'api'
  /* the show- properties are only needed when something has to be hidden at times (i.e. FF) */
  showDependencies?: boolean
  urls: {[key: string]: string}
  showActionsUsageMetrics?: boolean
  showActionsPerformanceMetrics?: boolean
  showApi?: boolean
}

export const InsightsSidenav = (props: InsightsSidenavProps) => {
  const navItems: InsightsSideNavItem[] = []

  const actionsUsageMetricsKey = `actions_usage_metrics`
  props.showActionsUsageMetrics &&
    navItems.push({
      display: 'Actions Usage Metrics',
      key: actionsUsageMetricsKey,
      href: props.urls[actionsUsageMetricsKey] || '#',
      selected: props.selectedKey === actionsUsageMetricsKey,
      icon: PlayIcon,
    })

  const actionsPerformanceMetricsKey = `actions_performance_metrics`
  props.showActionsPerformanceMetrics &&
    navItems.push({
      display: 'Actions Performance Metrics',
      key: actionsPerformanceMetricsKey,
      href: props.urls[actionsPerformanceMetricsKey] || '#',
      selected: props.selectedKey === actionsPerformanceMetricsKey,
      icon: PlayIcon,
      beta: true,
    })

  const dependencyKey = 'dependency_insights'
  props.showDependencies &&
    navItems.push({
      display: 'Dependencies',
      key: dependencyKey,
      href: props.urls[dependencyKey] || '#',
      selected: props.selectedKey === dependencyKey,
      icon: PackageIcon,
    })

  const apiKey = 'api'
  props.showApi &&
    navItems.push({
      display: 'API',
      key: apiKey,
      href: props.urls[apiKey] || '#',
      selected: props.selectedKey === apiKey,
      icon: CodeSquareIcon,
    })

  return (
    <Box sx={{p: 4}} {...testIdProps('InsightsSidenav')}>
      <Heading as="h1" sx={{fontSize: '24px', px: 3, pb: 2}}>
        Insights
      </Heading>
      <NavList aria-label={'Insights navigation'}>
        {navItems.map(item => {
          return (
            <NavList.Item key={item.key} href={item.href} aria-current={item.selected}>
              <NavList.LeadingVisual>
                <Octicon icon={item.icon} size={16} />
              </NavList.LeadingVisual>
              {item.display}
              {item.beta && (
                <NavList.TrailingVisual>
                  <Label variant="success">Beta</Label>
                </NavList.TrailingVisual>
              )}
            </NavList.Item>
          )
        })}
      </NavList>
    </Box>
  )
}

export const InsightsSidenavPanel = (props: InsightsSidenavProps) => {
  return (
    <Box className="border-lg-right" sx={{width: ['100%', '100%', '100%', 336]}}>
      <InsightsSidenav {...props} />
    </Box>
  )
}

interface InsightsSideNavItem {
  key: string
  href: string
  display: string
  selected?: boolean
  icon: Icon
  beta?: boolean
}
