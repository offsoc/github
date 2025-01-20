/** @jest-environment node */
// Register with react-core before attempting to render
import '../ssr-entry'

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getSecurityOverviewExportButtonProps} from '../test-utils/mock-data'

test('Renders security-overview-export-button partial with SSR', async () => {
  const props = getSecurityOverviewExportButtonProps()
  const view = await serverRenderReact({
    name: 'security-overview-export-button',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(/Export CSV/)
})
