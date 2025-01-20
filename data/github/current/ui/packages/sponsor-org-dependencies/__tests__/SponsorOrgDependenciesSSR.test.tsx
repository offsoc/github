/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSponsorOrgDependenciesProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders sponsor-org-dependencies partial with SSR', async () => {
  const props = getSponsorOrgDependenciesProps()

  const view = await serverRenderReact({
    name: 'sponsor-org-dependencies',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('maintainer-1')
})
