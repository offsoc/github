import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {FilesPageInfoProvider} from '@github-ui/code-view-shared/contexts/FilesPageInfoContext'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {CurrentUserProvider} from '@github-ui/current-user'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {FileTreeControlProvider} from '@github-ui/repos-file-tree-view'
import {ScreenSize, ScreenSizeProvider} from '@github-ui/screen-size'
import {ThemeProvider} from '@primer/react'
import React from 'react'

import {CopilotContextProvider} from './contexts/CopilotContext'
import {FilesContextProvider} from './contexts/FilesContext'
import type {CopilotTaskBasePayload} from './utilities/copilot-task-types'

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const payload = useRoutePayload<CopilotTaskBasePayload>()
  const {copilotAccessAllowed, refInfo, path} = payload
  const [repo] = React.useState(payload?.repo)
  const [user] = React.useState(payload?.currentUser)
  return (
    <ThemeProvider>
      <ScreenSizeProvider initialValue={ScreenSize.xxxlarge}>
        <AnalyticsProvider appName="copilot-task" category="" metadata={{}}>
          <CurrentUserProvider user={user}>
            <FilesPageInfoProvider
              refInfo={refInfo}
              path={path}
              action="blob"
              copilotAccessAllowed={copilotAccessAllowed ?? false}
            >
              <CurrentRepositoryProvider repository={repo}>
                <FileTreeControlProvider>
                  <CopilotContextProvider>
                    <FilesContextProvider>{props.children}</FilesContextProvider>
                  </CopilotContextProvider>
                </FileTreeControlProvider>
              </CurrentRepositoryProvider>
            </FilesPageInfoProvider>
          </CurrentUserProvider>
        </AnalyticsProvider>
      </ScreenSizeProvider>
    </ThemeProvider>
  )
}
