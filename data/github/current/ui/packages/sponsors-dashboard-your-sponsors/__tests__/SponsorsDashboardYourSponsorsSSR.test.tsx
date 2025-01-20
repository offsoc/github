/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSponsorsDashboardYourSponsorsProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders sponsors-dashboard-your-sponsors partial with SSR', async () => {
  const props = getSponsorsDashboardYourSponsorsProps()

  const view = await serverRenderReact({
    name: 'sponsors-dashboard-your-sponsors',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('All sponsors (4 sponsors)')
})
