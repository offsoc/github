/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getEnterpriseTeamProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders enterprise-team partial with SSR', async () => {
  const props = getEnterpriseTeamProps()
  const view = await serverRenderReact({
    name: 'enterprise-team',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.business_slug)
})
