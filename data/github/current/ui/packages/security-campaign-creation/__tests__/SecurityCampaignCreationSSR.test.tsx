/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSecurityCampaignCreationProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders security-campaign-creation partial with SSR', async () => {
  const props = getSecurityCampaignCreationProps()

  const view = await serverRenderReact({
    name: 'security-campaign-creation',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch('Create campaign')
})
