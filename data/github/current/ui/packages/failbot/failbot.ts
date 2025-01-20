// Report uncaught JS errors to Sentry
//   https://sentry.io/github/github-js

import {getOrCreateClientId} from '@github/hydro-analytics-client'
import {isSupported} from '@github/browser-support'
import {parse} from 'stacktrace-parser'
import {requestUri} from '@github-ui/analytics-overrides'
import {bundler} from '@github-ui/runtime-environment'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {getSoftNavReferrer} from '@github-ui/soft-nav/utils'

let extensionErrors = false
let errorsReported = 0
const loadTime = Date.now()
// network error messages are not consistent across browsers, this is a list of known messages for chrome and firefox
export const EXPECTED_NETWORK_ERROR_MESSAGES = new Set([
  'Failed to fetch',
  'NetworkError when attempting to fetch resource.',
])

type ErrorContext = {
  message?: string
}

// Check if an arbitrary object is an error, or at least an object that satisfies the interface of an error,
// with the necessary information to be able to report it to Sentry.
function isError(error: unknown): error is Error {
  // Check if it's a definite instance of an error
  if (error instanceof Error) return true
  // Otherwise, check that it at least satisfies the interface of an error
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof error.name === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

/** Tries to serialize an arbitrary error value that is not an Error object, and returns a default message otherwise */
function serializeNonError(error: unknown): string {
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unserializable'
  }
}

function isExpectedError(error: Error): boolean {
  // We use AbortController to control events and some workflows. When we call `abort()` on it, it will raise an
  // `AbortError` which doesn't represent a real error, so we don't want to report it.
  if (error.name === 'AbortError') return true
  // Failed to fetch errors are usually related to the user's network connection. They also do not represent
  // real errors related to our code, so we will also ignore them.
  if (error.name === 'TypeError' && EXPECTED_NETWORK_ERROR_MESSAGES.has(error.message)) return true
  // For memex we use an ApiError class to represent errors returned from the API
  // Additional details in the format of ApiErrorOpts are affixed to the name as a stringified JSON object
  // so we just need to ensure the error name starts with ApiError
  // see ui/packages/memex/src/client/platform/api-error.ts for more details.
  if (error.name.startsWith('ApiError') && EXPECTED_NETWORK_ERROR_MESSAGES.has(error.message)) return true

  return false
}

// @deprecated Re-throw the caught exception instead.
export function reportError(error: unknown, context: ErrorContext = {}) {
  if (isFeatureEnabled('FAILBOT_HANDLE_NON_ERRORS')) {
    if (!isError(error)) {
      if (isIgnoredNonError(error)) return

      // Create an error instance so that we can get the stacktrace of how this was reported
      const errorForStackTrace = new Error()
      const serializedErrorValue = serializeNonError(error)
      // Construct a custom error object so we can keep track of anywhere that we report an error that isn't an Error object
      const newError: PlatformJavascriptError = {
        type: 'UnknownError',
        value: `Unable to report error, due to a thrown non-Error type: ${typeof error}, with value ${serializedErrorValue}`,
        stacktrace: stacktrace(errorForStackTrace),
        catalogService: undefined,
      }
      report(errorContext(newError, context))
      return
    }
    if (!isExpectedError(error)) {
      report(errorContext(formatError(error), context))
    }
  } else {
    // Without feature flag, we will cast the `error` variable which was implicitly the old
    // behavior of the non-feature flagged code.
    if (!isExpectedError(error as Error)) {
      report(errorContext(formatError(error as Error), context))
    }
  }
}

// Report context info to Sentry.
async function report(context: PlatformReportBrowserErrorInput) {
  if (!reportable()) return

  const url = document.head?.querySelector<HTMLMetaElement>('meta[name="browser-errors-url"]')?.content
  if (!url) return

  if (isExtensionError(context.error.stacktrace)) {
    extensionErrors = true
    return
  }

  errorsReported++

  try {
    await fetch(url, {method: 'post', body: JSON.stringify(context)})
  } catch {
    // Error reporting failed so do nothing.
  }
}

function formatError(error: Error): PlatformJavascriptError {
  return {
    type: error.name,
    value: error.message,
    stacktrace: stacktrace(error),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catalogService: (error as any)['catalogService'],
  }
}

function errorContext(error: PlatformJavascriptError, context: ErrorContext = {}): PlatformReportBrowserErrorInput {
  return Object.assign(
    {
      error,
      sanitizedUrl: requestUri() || window.location.href,
      readyState: document.readyState,
      referrer: getSoftNavReferrer(),
      timeSinceLoad: Math.round(Date.now() - loadTime),
      user: pageUser() || undefined,
      bundler,
      ui: Boolean(document.querySelector('meta[name="ui"]')),
    },
    context,
  )
}

export function stacktrace(error: Error): PlatformStackframe[] {
  return parse(error.stack || '').map(frame => ({
    filename: frame.file || '',
    function: String(frame.methodName),
    lineno: (frame.lineNumber || 0).toString(),
    colno: (frame.column || 0).toString(),
  }))
}

const extensions = /(chrome|moz|safari)-extension:\/\//

// Does this stack trace contain frames from browser extensions?
function isExtensionError(stack: PlatformStackframe[]): boolean {
  return stack.some(frame => extensions.test(frame.filename) || extensions.test(frame.function))
}

export function pageUser() {
  const login = document.head?.querySelector<HTMLMetaElement>('meta[name="user-login"]')?.content
  if (login) return login

  const clientId = getOrCreateClientId()
  return `anonymous-${clientId}`
}

let unloaded = false
ssrSafeWindow?.addEventListener('pageshow', () => (unloaded = false))
ssrSafeWindow?.addEventListener('pagehide', () => (unloaded = true))

function reportable() {
  return !unloaded && !extensionErrors && errorsReported < 10 && isSupported()
}

if (typeof BroadcastChannel === 'function') {
  const sharedWorkerErrorChannel = new BroadcastChannel('shared-worker-error')
  sharedWorkerErrorChannel.addEventListener('message', event => {
    // SharedWorker will emit a formatted error
    reportError(event.data.error)
  })
}

const ignoredErrorMessages = [
  'Object Not Found Matching Id', // from Microsoft Outlook SafeLink crawler
  'Not implemented on this platform', // LastPass Safari extension
  `provider because it's not your default extension`, // MetaMask extension
]

/**
 * We see a fair number of "errors" which are not actually Error objects. This function will return true if the
 * error is one of these known non-Error types and has content which we know can safely be ignored.
 * Most of these errors come from specific browsers or extensions which we can't control, so we just ignore them.
 * @param error An error that is not an Error object
 * @returns boolean
 */
function isIgnoredNonError(error: unknown) {
  if (!error || typeof error === 'boolean' || typeof error === 'number') {
    // Rejected with a type that is not useful to report. Just ignore it.
    return true
  } else if (typeof error === 'string') {
    // rejected with a string. See if it's a known error that we can ignore
    if (ignoredErrorMessages.some(message => error.includes(message))) {
      return true
    }
  } else if (
    typeof error === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).message === 'string' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).code === 'number'
  ) {
    // We see an object like {"message":"Not connected","code":4900} from some extension, likely MetaMask. Ignore these
    return true
  }

  return false
}
