/** @jest-environment node */
// Register with react-core before attempting to render
import '../../ssr-entry'

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getRepoCustomPropertiesPagePayload} from '../../test-utils/mock-data'

test('Renders Repo Custom Properties Page with SSR', async () => {
  const payload = getRepoCustomPropertiesPagePayload()
  const view = await serverRenderReact({
    name: 'custom-properties',
    path: '/github/github/custom-properties',
    data: {payload},
  })

  expect(view).toContain('Custom properties')
  const definition = payload.definitions[0]!.propertyName
  expect(view).toContain(definition)
  expect(view).toContain(payload.values[definition]!)
})
