/* eslint-disable import/first */
/* eslint eslint-comments/no-use: off */

/**
 * MSW relies on some node apis that jsdom/jest don't
 * provide correctly, so we're polyfilling them here.
 */

import {clearImmediate} from 'node:timers'
import {TextDecoder, TextEncoder} from 'node:util'
// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.TextDecoder = TextDecoder
globalThis.TextEncoder = TextEncoder

/**
 * We purposely import this _afer_ setting the TextEncoder and TextDecoder
 * otherwise they won't be accessible from internal undici modules
 */
import {fetch, FormData, Headers, Request, Response, setGlobalOrigin} from 'undici'

/**
 * Setting the global origin for requests so that relative urls work in our jest tests
 */
setGlobalOrigin(window.location.origin)
// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.fetch = fetch
// // @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.Blob = Blob
globalThis.File = File
// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.Headers = Headers
// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.FormData = FormData
// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.Request = Request
// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.Response = Response

globalThis.clearImmediate = clearImmediate

// @ts-expect-error sometimes the polyfill types don't match the dom ones perfectly
globalThis.performance.markResourceTiming = () => void 0
