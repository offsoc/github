/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getMainRoutePayload} from '../test-utils/mock-data'
import {Constants} from '../constants/constants'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders HostedComputeImsAdminStafftools with SSR', async () => {
  const routePayload = getMainRoutePayload()
  const view = await serverRenderReact({
    name: 'hosted-compute-ims-stafftools',
    path: '/stafftools/hosted_compute_ims_admin',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(Constants.stafftoolPageTitle)
})
