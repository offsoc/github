// eslint-disable-next-line unused-imports/no-unused-imports
import type Mocha from 'mocha'
export {assert, fixture, html, waitUntil, aTimeout, nextFrame, elementUpdated} from '@open-wc/testing'
export {spread} from '@open-wc/lit-helpers'

export const suite = describe
export const setup = beforeEach
export const suiteSetup = before
export const suiteTeardown = after
export const teardown = afterEach
export const test = it
