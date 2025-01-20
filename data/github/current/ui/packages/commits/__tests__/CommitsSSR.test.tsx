/** @jest-environment node */
// Register with react-core before attempting to render
import '../ssr-standalone-entry'

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {type CommitsAppPayload, useCommitsAppPayload} from '../hooks/use-commits-app-payload'
import {generateCommitGroups} from '../shared/test-helpers'
import {getCommitsRoutePayload} from '../test-utils/mock-data'

jest.mock('../hooks/use-commits-app-payload')
const mockedUseCurrentAppPayload = jest.mocked(useCommitsAppPayload)

beforeEach(() => {
  mockedUseCurrentAppPayload.mockReturnValue({
    helpUrl: 'help.biz',
    findFileWorkerPath: 'path here',
    findInFileWorkerPath: 'another path',
    findInDiffWorkerPath: 'and a path',
    githubDevUrl: 'githubdev.com',
  } as CommitsAppPayload)
})
//it seems like the test doesn't actually detect that window isn't accessed in this context
test('Renders Commits with SSR', async () => {
  const routePayload = getCommitsRoutePayload()
  routePayload.commitGroups = generateCommitGroups(2, 2)

  const view = await serverRenderReact({
    name: 'commits',
    path: 'monalisa/smile/commits',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.filters.currentBlobPath)
})
