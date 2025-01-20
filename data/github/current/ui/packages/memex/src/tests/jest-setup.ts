import '@primer/react/lib-esm/utils/test-helpers'
import '@testing-library/jest-dom'
import 'jest-styled-components'
import './fetch-polyfills'

import {setImmediate} from 'node:timers'

import type {JSONRequestInit} from '@github-ui/verified-fetch'
import {randomUUID} from 'crypto'
// eslint-disable-next-line no-restricted-imports -- TODO: remove this once we have a better solution for the shared relay code
import React from 'react'

import {resetAliveConfigForTests} from '../client/helpers/alive'
import {setApiMetadataForTests} from '../client/helpers/api-metadata'
import {resetEnabledFeaturesForTests} from '../client/helpers/feature-flags'
import {resetInitialState} from '../client/helpers/initial-state'
import {mockApiMetadataJsonIsland} from '../mocks/data/api-metadata'
import {mswServer} from './msw-server'

jest.retryTimes(4, {logErrorsBeforeRetry: true})

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  window.crypto.randomUUID ||= () => randomUUID() as `${string}-${string}-${string}-${string}-${string}`
}

global.React = React

// Implement Request, Response and fetch for jsdom environments

// https://github.com/jsdom/jsdom/issues/1695
// This is a workaround needed for the `react-testing-library` to correctly render
// components that use the `scrollIntoView` method in an effect
Element.prototype.scrollIntoView = jest.fn()

// This is part of webkit only, but not part of the official standard.

// @ts-expect-error scrollIntoView is not part of the official standard
Element.prototype.scrollIntoViewIfNeeded = jest.fn()

// TODO: remove this once we have a better solution for the shared relay code
jest.mock('../client/components/issue-creator', () => ({
  IssueCreatorProvider: ({children}: any) => children,
  useStartIssueCreator: () => undefined,
}))

function verifiedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: HeadersInit = {
    ...init.headers,
    'GitHub-Verified-Fetch': 'true',
    'X-Requested-With': 'XMLHttpRequest',
  }

  return fetch(path, {...init, headers})
}

function verifiedFetchJSON(path: string, init?: JSONRequestInit): Promise<Response> {
  const initHeaders: HeadersInit = init?.headers ?? {}

  const headers: HeadersInit = {
    ...initHeaders,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const body = init?.body ? JSON.stringify(init.body) : undefined

  return verifiedFetch(path, {...init, body, headers})
}

jest.mock('@github-ui/verified-fetch', () => ({
  // This is a version of verified fetch that removes the cross-origin check so that we can use it in tests
  verifiedFetch,
  verifiedFetchJSON,
}))

beforeAll(() => {
  mswServer.listen({
    onUnhandledRequest: 'bypass',
  })
})

beforeEach(() => {
  resetInitialState()
  setApiMetadataForTests(mockApiMetadataJsonIsland)
  resetAliveConfigForTests()
  resetEnabledFeaturesForTests()
})

/**
 * Jest, by default maintains the dom for a test, so JSON Island data
 * from a previous test can pollute the next one, potentially causing
 * tests to pass/fail when they shouldn't.
 *
 * This clears the dom between tests, so that the JSON Island data
 * is seeded fresh on every test that uses it
 */
afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
  mswServer.resetHandlers()
})

afterAll(() => {
  mswServer.close()
})

window.setImmediate = setImmediate
