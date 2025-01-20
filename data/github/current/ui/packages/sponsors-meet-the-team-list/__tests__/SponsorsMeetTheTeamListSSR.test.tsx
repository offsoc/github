/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSponsorsMeetTheTeamListProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders sponsors-meet-the-team-list partial with SSR', async () => {
  const props = getSponsorsMeetTheTeamListProps()

  const view = await serverRenderReact({
    name: 'sponsors-meet-the-team-list',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  const {featuredItems} = props
  const item = featuredItems[0]
  expect(view).toMatch(item!.title)
})
