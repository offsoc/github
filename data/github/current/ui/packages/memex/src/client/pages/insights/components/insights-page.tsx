// NOTE:
// These imported components depend on web components being applied and will not
// work currently if rendered server-side.
//
import './chart-web-components/insights-query-element'

import {testIdProps} from '@github-ui/test-id-props'
import {Outlet} from 'react-router-dom'

import {BaseSettingsPage} from '../../../components/base-settings-page'
import {useBindMemexToDocument} from '../../../hooks/use-bind-memex-to-document'
import {InsightsConfigurationPaneProvider} from '../hooks/use-insights-configuration-pane'
import {InsightsLayout} from './insights-layout'

export function InsightsPage() {
  useBindMemexToDocument()

  return (
    <BaseSettingsPage {...testIdProps('insights-page')}>
      <InsightsConfigurationPaneProvider>
        <InsightsLayout>
          <Outlet />
        </InsightsLayout>
      </InsightsConfigurationPaneProvider>
    </BaseSettingsPage>
  )
}
