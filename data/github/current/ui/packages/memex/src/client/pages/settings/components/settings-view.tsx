import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Box, PageLayout} from '@primer/react'
import {Outlet} from 'react-router-dom'

import {SettingsErrorFallback} from './settings-error-fallback'
import {ReorderableSettingsSideNav} from './settings-side-nav'

export const SettingsView = () => {
  return (
    <PageLayout containerWidth="full" sx={{height: '100%', padding: 0, m: 0, [`& > ${Box}`]: {minHeight: '100%'}}}>
      <PageLayout.Pane
        position="start"
        sx={{
          padding: [3, null, null, 4],
          borderRight: '1px solid',
          borderColor: 'border.subtle',
        }}
      >
        <ReorderableSettingsSideNav />
      </PageLayout.Pane>
      <PageLayout.Content
        width="large"
        sx={{
          padding: [3, null, null, 4],
        }}
      >
        <ErrorBoundary fallback={<SettingsErrorFallback />}>
          <Outlet />
        </ErrorBoundary>
      </PageLayout.Content>
    </PageLayout>
  )
}
