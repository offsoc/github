/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getOrgCreateProps, getUserCreateProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders sponsors-signup partial with SSR for user', async () => {
  const props = getUserCreateProps()

  const view = await serverRenderReact({
    name: 'sponsors-signup',
    data: {props},
  })

  expect(view).toMatch('Get Sponsored')
})

test('Renders sponsors-signup partial with SSR for org', async () => {
  const props = getOrgCreateProps()

  const view = await serverRenderReact({
    name: 'sponsors-signup',
    data: {props},
  })

  expect(view).toMatch('Get Sponsored')
})
