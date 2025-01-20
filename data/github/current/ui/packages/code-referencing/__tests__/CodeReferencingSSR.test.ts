/** @jest-environment node */

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import type {CodeReferenceShowPayload} from '../types'

import '../ssr-entry'

test('Renders CodeReferencing with SSR', async () => {
  const view = await serverRenderReact({
    name: 'code-referencing',
    path: '/github-copilot/code_referencing',
    data: {
      payload: {
        total_matches: 123,
        total_results: 456,
        total_pages: 10,
        files: [],
        licenses: [],
      } satisfies CodeReferenceShowPayload,
    },
  })

  expect(view).not.toBeFalsy()
})
