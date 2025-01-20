import type React from 'react'
import {BasePathProvider} from './contexts/BasePathContext'
import type {AppPayload, RoutePayload} from './types'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {ReadOnlyProvider} from './contexts/ReadOnlyContext'
import {OrganizationProvider} from './contexts/OrganizationContext'
import {BaseAvatarUrlProvider} from './contexts/BaseAvatarUrlContext'
import {GroupTreeProvider} from './contexts/GroupTreeContext'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {MaxDepthProvider} from './contexts/MaxDepthContext'

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const {basePath, baseAvatarUrl, maxDepth, organization, readOnly} = useAppPayload<AppPayload>()
  const {groups} = useRoutePayload<RoutePayload>()
  return (
    <ReadOnlyProvider readOnly={readOnly}>
      <BasePathProvider basePath={basePath}>
        <MaxDepthProvider maxDepth={maxDepth}>
          <BaseAvatarUrlProvider baseAvatarUrl={baseAvatarUrl}>
            <OrganizationProvider organization={organization}>
              <GroupTreeProvider groups={groups}>{props.children}</GroupTreeProvider>
            </OrganizationProvider>
          </BaseAvatarUrlProvider>
        </MaxDepthProvider>
      </BasePathProvider>
    </ReadOnlyProvider>
  )
}
