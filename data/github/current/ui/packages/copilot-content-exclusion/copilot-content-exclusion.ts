import React from 'react'

import {TransitionType} from '@github-ui/react-core/app-routing-types'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {registerReactPartial} from '@github-ui/react-core/register-partial'

import {App} from './App'
import {OrgSettings} from './routes/OrgSettings'
import {RepoSettings} from './routes/RepoSettings'

registerReactAppFactory('copilot-content-exclusion', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/organizations/:org/settings/copilot/content_exclusion',
      Component: OrgSettings,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
    jsonRoute({
      path: '/:owner/:name/settings/copilot/content_exclusion',
      Component: RepoSettings,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
  ],
}))

registerReactPartial('copilot-content-exclusion', {
  Component: React.lazy(() => import('./partials/ContentExclusionForm')),
})
