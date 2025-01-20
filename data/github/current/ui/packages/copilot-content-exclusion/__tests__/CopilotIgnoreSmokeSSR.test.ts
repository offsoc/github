/** @jest-environment node */

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {
  makeContentExclusionOrgSettingsRoutePayload,
  makeContentExclusionRepoSettingsRoutePayload,
} from '../test-utils/mock-data'

import '../ssr-entry'

test('Renders CopilotContentExclusion#org with SSR', async () => {
  const routePayload = makeContentExclusionOrgSettingsRoutePayload()

  const view = await serverRenderReact({
    name: 'copilot-content-exclusion',
    path: '/organizations/:org/settings/copilot/content_exclusion',
    data: {
      payload: routePayload,
    },
  })
  expect(view).not.toBeFalsy()
})

test('Renders CopilotContentExclusion#repo with SSR', async () => {
  const routePayload = makeContentExclusionRepoSettingsRoutePayload()

  const view = await serverRenderReact({
    name: 'copilot-content-exclusion',
    path: '/monalisa/smile/settings/copilot/content_exclusion',
    data: {payload: routePayload},
  })

  expect(view).not.toBeFalsy()
})
