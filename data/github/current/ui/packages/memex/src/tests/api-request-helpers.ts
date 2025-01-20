import {type DefaultBodyType, http, type JsonBodyType, type StrictResponse} from 'msw'

import type {ApiMetadataJSONIsland} from '../client/services/types'
import {mockApiMetadataJsonIsland} from '../mocks/data/api-metadata'
import {respondWithError, respondWithJsonSuccess} from '../mocks/msw-responders'
import {mswServer} from './msw-server'

type ApiDataKey = keyof ApiMetadataJSONIsland

function respondAndMock<T extends DefaultBodyType>(
  apiData: ApiDataKey,
  requestMethod: 'get' | 'delete' | 'post' | 'put' | 'patch',
  callback: () => StrictResponse<T> | Promise<StrictResponse<T>>,
) {
  const metadata = mockApiMetadataJsonIsland[apiData]
  if (!('url' in metadata)) {
    throw new Error('Incorrect API metadata key provided')
  }

  const mockCalled = jest.fn()

  mswServer.use(
    http[requestMethod](metadata.url, () => {
      mockCalled()
      return callback()
    }),
  )
  return mockCalled
}
/**
 * Overrides the handler for a given api URL with a successful JSON response and returns a mock function
 * that is called when the specified request handler has been executed
 *
 * @param apiDataKey key for ApiMetadataJSONIsland to be used for the URL of the request
 * @param requestMethod method for the request
 * @param response response body to be returned in the JSON success response
 * @returns mock function that is called when the request has been executed
 */
export function respondWithJsonSuccessAndMock<T extends JsonBodyType>(
  apiDataKey: ApiDataKey,
  requestMethod: 'get' | 'delete' | 'post' | 'put' | 'patch',
  response: T,
) {
  return respondAndMock(apiDataKey, requestMethod, () => respondWithJsonSuccess(response))
}

/**
 * Overrides the handler for a given api URL with an error response and returns a mock function
 * that is called when the specified request handler has been executed
 *
 * @param apiDataKey key for ApiMetadataJSONIsland to be used for the URL of the request
 * @param requestMethod method for the request
 * @param error error message to be returned in the error response
 * @returns mock function that is called when the request has been executed
 */
export function respondWithErrorAndMock(
  apiDataKey: ApiDataKey,
  requestMethod: 'get' | 'delete' | 'post' | 'put' | 'patch',
  error: string,
) {
  return respondAndMock(apiDataKey, requestMethod, () => respondWithError(error))
}
