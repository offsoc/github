/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getDefaultSetupRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders DefaultSetup with SSR', async () => {
  const routePayload = getDefaultSetupRoutePayload()
  const view = await serverRenderReact({
    name: 'repository-code-scanning-settings',
    path: '/monalisa/my-repo/settings/code-scanning/default-setup',
    data: {payload: routePayload},
  })

  expect(view).toMatch(
    `<form novalidate="" action="${routePayload.formUrl}" method="${routePayload.formMethod}" data-testid="default-setup-form">`,
  )
})
