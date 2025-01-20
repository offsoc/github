/** @jest-environment node */
// Register with react-core before attempting to render
import '../ssr-standalone-entry'

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {fileTreePayload, getCommitRoutePayload, payloadWithDiffs} from '../test-utils/commit-mock-data'
import type {CommitAppPayload} from '../types/commit-types'

jest.mock('@github-ui/react-core/use-app-payload')
const mockedUseAppPayload = jest.mocked(useAppPayload)

beforeEach(() => {
  mockedUseAppPayload.mockReturnValue({
    helpUrl: 'help.biz',
  } as CommitAppPayload)
})

test('Renders Commit with SSR - Commit Info', async () => {
  const routePayload = getCommitRoutePayload()

  const view = await serverRenderReact({
    name: 'commits',
    path: 'monalisa/smile/commit/052a205',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch('This is a commit message')
})

test('Renders Commit with SSR - File Tree', async () => {
  const view = await serverRenderReact({
    name: 'commits',
    path: 'monalisa/smile/commit/052a205',
    data: {payload: fileTreePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch('File tree')
  expect(view).toMatch('src')
  expect(view).toMatch('index.js')
})

test('Renders Commit with SSR - Diff', async () => {
  const view = await serverRenderReact({
    name: 'commits',
    path: 'monalisa/smile/commit/052a205',
    data: {payload: payloadWithDiffs},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch('src/index.js')
  expect(view).toMatch('src/components/Component.ts')
  expect(view).toMatch('src/components/Component.test.js')
})

test('Renders Commit with SSR - Unavailable', async () => {
  const routePayload = getCommitRoutePayload()

  const view = await serverRenderReact({
    name: 'commits',
    path: 'monalisa/smile/commit/052a205',
    data: {payload: {...routePayload, unavailableReason: 'timeout'}},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch('Sorry, this diff is taking too long to generate.')
})
