/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getEnterpriseTeamsTableViewProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders enterprise-teams-table-view partial with SSR', async () => {
  const props = getEnterpriseTeamsTableViewProps()

  const view = await serverRenderReact({
    name: 'enterprise-teams-table-view',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.business_slug)
})
