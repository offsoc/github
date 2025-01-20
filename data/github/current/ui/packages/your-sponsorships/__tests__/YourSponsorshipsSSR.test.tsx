/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getYourSponsorshipsProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders your-sponsorships partial with SSR', async () => {
  const props = getYourSponsorshipsProps()

  const view = await serverRenderReact({
    name: 'your-sponsorships',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(props.sponsorLogin)
})
