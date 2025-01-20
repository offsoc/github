import {type Variables, type GraphQLResponse, stableCopy, type GraphQLResponseWithoutData} from 'relay-runtime'
import type {Sink} from 'relay-runtime/lib/network/RelayObservable'
import {getInsightsUrl, reportTraceData} from '@github-ui/internal-api-insights'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'

type Json = string | number | boolean | null | {[property: string]: Json} | Json[]

type JsonRoot = {[property: string]: Json}

export type GraphQLError = {type: string; message: string; path: Array<string | number>}
type GraphQLSuccessfulResult = {
  data: JsonRoot
  timestamp?: number
  extensions?: Record<string, Record<string, JsonRoot>>
}
type GraphQLErrorResult = {
  errors: GraphQLError[]
  data?: JsonRoot
  timestamp?: number
  extensions: Record<string, string>
}

type ErrorTypeCallbacks = Record<string, () => void>
export type ErrorCallbacks = Record<number, ErrorTypeCallbacks>

// "SERVICE_UNAVAILABLE" are availability issues. It is allowed as we expect the app code to handle it
const ALLOWED_ERRORS = ['SAML', 'SERVICE_UNAVAILABLE']
// For some errors, we want to allow them in certain contexts and let the app handle them
const CONDITIONAL_ALLOWED_ERRORS: Record<string, string[]> = {
  FORBIDDEN: ['SAML error'],
  AUTHENTICATION: ['Couldn’t authenticate you'],
}

export const IssuesShowRegex = new RegExp(/^\/[\w-_]*\/[\w-_]*\/issues\/\d*$/)

export type GraphQLResult = GraphQLSuccessfulResult | GraphQLErrorResult
export type GraphQLSubscriptionResult = {subscriptionId: string | null; response: GraphQLResponse}

function validateNoErrors(
  decoded: GraphQLResult,
  requestId: string,
  persistedQueryId: string,
  observer?: Sink<GraphQLResponse>,
): GraphQLSuccessfulResult {
  removeAllowedErrors(requestId, decoded)
  if ('errors' in decoded && decoded.errors.length) {
    const formatted = decoded.errors
      .map(error => `GraphQL error: ${error.type}: ${error.message} (path: ${error.path})`)
      .join(', ')
    const error = new ValidationError(
      `${formatted} (Persisted query id: ${persistedQueryId})`,
      {cause: decoded.errors},
      decoded.extensions?.query_owning_catalog_service,
    )
    if (observer) {
      reportError(error)
      observer.error(error)
    } else {
      throw error
    }
  }
  if (!('data' in decoded)) {
    const error = new Error(`Expected data property in response: ${JSON.stringify(decoded)}`)
    if (observer) {
      reportError(error)
      observer.error(error)
    } else {
      throw error
    }
  }
  return decoded as GraphQLSuccessfulResult
}

class ValidationError extends Error {
  catalogService: string | undefined
  constructor(message: string, options: ErrorOptions, catalogService?: string) {
    super(message, options)
    this.catalogService = catalogService
  }
}

async function assertNoHttpErrors(response: Response): Promise<void> {
  // 404 is handled by GraphQL
  if (response.status >= 400 && response.status !== 404) {
    const text = await response.text()
    throw new Error(`HTTP error (${response.status}): ${text}`)
  }
}

function removeAllowedErrors(requestId: string, decoded: GraphQLResult): GraphQLResult {
  if ('errors' in decoded) {
    decoded.errors
      .filter(
        error =>
          ALLOWED_ERRORS.includes(error.type) || !!CONDITIONAL_ALLOWED_ERRORS[error.type]?.includes(error.message),
      )
      .map(error => {
        // eslint-disable-next-line no-console
        console.error(
          `Failed to fetch data. Please use this request ID when contacting support: ${requestId} Error: ${error.type}: ${error.message} (path: ${error.path})`,
        )
      })

    decoded.errors = decoded.errors.filter(
      error => !ALLOWED_ERRORS.includes(error.type) && !CONDITIONAL_ALLOWED_ERRORS[error.type]?.includes(error.message),
    )
  }
  return decoded
}

// Fetch GraphQL from the server and return a decoded result.
export default async function fetchGraphQL(
  persistedQueryId: string,
  variables: Variables,
  method: 'GET' | 'POST' = 'GET',
  baseUrl?: string,
  enabledFeatures?: {[key: string]: boolean},
  errorCallbacks?: ErrorCallbacks,
  observer?: Sink<GraphQLResponse>,
): Promise<GraphQLResponse> {
  const result = await fetchGraphQLWithSubscription(
    persistedQueryId,
    variables,
    method,
    {
      isSubscription: false,
      scope: undefined,
    },
    baseUrl,
    enabledFeatures,
    errorCallbacks,
    observer,
  )
  return result.response
}

// Fetch GraphQL from the server and return a response promise along with an
// optional subscriptionId if the query is a subscription.
export async function fetchGraphQLWithSubscription(
  persistedQueryId: string,
  variables: Variables,
  method: 'GET' | 'POST' = 'POST',
  options: {
    isSubscription?: boolean
    subscriptionTopic?: string
    dispatchTime?: number
    scopeObject?: Record<string, unknown>
    scope?: string
  } = {},
  baseUrl?: string,
  enabledFeatures?: {[key: string]: boolean},
  errorCallbacks?: ErrorCallbacks,
  observer?: Sink<GraphQLResponse>,
): Promise<GraphQLSubscriptionResult> {
  const canonicalizedPayload = JSON.stringify(
    // stableCopy will alphabetize the keys in the variable payload.
    // Necessary to ensure a match against early-hinted/preloaded requests.
    stableCopy({
      query: persistedQueryId,
      variables,
      ...(options.scopeObject ? {scopeObject: options.scopeObject} : {}),
    }),
  )

  const {isSubscription, scope, subscriptionTopic, dispatchTime} = options

  const url = constructUrl(
    method,
    encodeURIComponent(canonicalizedPayload),
    isSubscription,
    subscriptionTopic,
    scope,
    dispatchTime,
    baseUrl,
  )
  let subscriptionId = null

  try {
    const {
      subscriptionId: currentSubscriptionId,
      requestId,
      json,
      status,
    } = await getGraphQLQuery(url, method, canonicalizedPayload, enabledFeatures)
    subscriptionId = currentSubscriptionId
    if (errorCallbacks && json.errors) {
      const callbacks = errorCallbacks[status]
      if (callbacks) {
        for (const error of json.errors) {
          const callback = callbacks[error.type]
          callback?.()
        }
      }
    }
    const cleaned = validateNoErrors(json as GraphQLResult, requestId, persistedQueryId, observer)
    if (cleaned) {
      reportTraceData(cleaned)
    }
    return {subscriptionId, response: cleaned}
  } catch (error) {
    if (observer) {
      reportError(error)
      observer.error(error as Error)
      const errorResponse = {
        errors: [{message: 'An error occurred while fetching data. Please try again later.'}],
        extensions: {},
      } as GraphQLResponseWithoutData
      return {subscriptionId, response: errorResponse}
    } else {
      throw error
    }
  }
}

function constructUrl(
  method: 'GET' | 'POST',
  content: string,
  isSubscription?: boolean,
  subscriptionTopic?: string,
  scope?: string,
  dispatchTime?: number,
  baseUrl = '/_graphql',
) {
  const queryParameters = []
  if (method === 'GET') {
    queryParameters.push(`body=${content}`)
  }
  if (isSubscription) {
    queryParameters.push('subscription=1')
  }
  if (scope) {
    queryParameters.push(`scope=${encodeURIComponent(scope)}`)
  }
  if (subscriptionTopic) {
    queryParameters.push(`subscriptionTopic=${encodeURIComponent(subscriptionTopic)}`)
  }
  if (dispatchTime) {
    queryParameters.push(`dispatchTime=${encodeURIComponent(dispatchTime)}`)
  }

  // grab and forward any feature flags from the URL
  if (ssrSafeWindow) {
    const url = new URL(ssrSafeWindow.location.href, ssrSafeWindow.location.origin)
    const features = url.searchParams.get('_features')
    if (features) {
      queryParameters.push(`_features=${features}`)
    }
  }

  return queryParameters.length > 0 ? `${baseUrl}?${queryParameters.join('&')}` : baseUrl
}

async function getGraphQLQuery(url: string, method: string, body?: string, enabledFeatures?: {[key: string]: boolean}) {
  const effectiveUrl = getInsightsUrl(url)
  return getGraphQLData(effectiveUrl, method, body, enabledFeatures)
}

async function getGraphQLData(url: string, method: string, body?: string, enabledFeatures?: {[key: string]: boolean}) {
  let httpResponse: Response

  const bodyInit = body ? {body} : undefined

  const headers: {[key: string]: string} = {}
  if (enabledFeatures?.issues_react_perf_test) {
    headers['X-LUC-Environment'] = 'issues'
  }

  headers['X-Requested-With'] = 'XMLHttpRequest'

  if (method === 'GET') {
    httpResponse = await fetch(url, {
      method,
      cache: 'no-cache',
      credentials: 'include',
      headers,
    })
  } else {
    httpResponse = await verifiedFetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      ...bodyInit,
    })
  }

  await assertNoHttpErrors(httpResponse)
  const json = await httpResponse.json()
  const subscriptionId = httpResponse.headers.get('X-Subscription-ID')
  const requestId = httpResponse.headers.get('X-Github-Request-Id') || ''
  const status = httpResponse.status

  return {subscriptionId, requestId, json, status}
}
