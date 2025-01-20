/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSponsorsNewslettersProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders sponsors-newsletters partial with SSR', async () => {
  const props = getSponsorsNewslettersProps()

  const view = await serverRenderReact({
    name: 'sponsors-newsletters',
    data: {props},
  })

  expect(view).toContain('All sponsors (4 sponsors)')
})
