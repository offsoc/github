import {type DefaultBodyType, http, HttpResponse, type JsonBodyType, type PathParams, type StrictRequest} from 'msw'

import type {ApiMetadataJSONIsland} from '../../client/services/types'
import {mockApiMetadataJsonIsland} from '../data/api-metadata'

export function respondWithNoContent() {
  return new HttpResponse(null, {status: 204})
}

export function respondWithJsonSuccess<T extends JsonBodyType>(json: T, status = 200) {
  if (status > 300) {
    throw new Error('Status code must be < 300')
  }
  return HttpResponse.json(json, {status})
}

export function respondWithError(
  errors: string | Array<string> | {code: string; errors: string | Array<string>},
  status = 500,
) {
  if (status < 400) {
    throw new Error('Status code must be >= 400')
  }
  return HttpResponse.json(createErrorResponseBody(errors), {status})
}

function createErrorResponseBody(errors: string | Array<string> | {code: string; errors: string | Array<string>}) {
  if (typeof errors === 'string' || Array.isArray(errors)) {
    return {
      errors,
    }
  }

  return errors
}

export type GetRequestType = DefaultBodyType

export type MswResponseResolver<TRequest extends DefaultBodyType, TResponse> = (
  requestBody: TRequest,
  req: StrictRequest<TRequest>,
) => Promise<TResponse>

export function createRequestHandler<TRequest extends DefaultBodyType, TResponse>(
  requestMethod: 'get' | 'delete' | 'post' | 'put' | 'patch',
  apiKey: keyof ApiMetadataJSONIsland,
  responseResolver: MswResponseResolver<TRequest, TResponse>,
  {ignoreJsonBody = false, extraUrlParts = ''} = {},
) {
  return http[requestMethod]<PathParams, TRequest>(
    mockApiMetadataJsonIsland[apiKey].url + extraUrlParts,
    async ({request}) => {
      const jsonBody = requestMethod === 'get' || ignoreJsonBody ? undefined : await request.json()
      try {
        const resolvedResponse = await responseResolver(jsonBody as TRequest, request)
        if (resolvedResponse === undefined) {
          return respondWithNoContent()
        } else {
          return respondWithJsonSuccess(resolvedResponse)
        }
      } catch (e) {
        return respondWithError((e as Error).message)
      }
    },
  )
}

export function createRequestHandlerWithError(
  requestMethod: 'get' | 'delete' | 'post' | 'put' | 'patch',
  apiKey: keyof ApiMetadataJSONIsland,
  errorBody: string | {code: string; errors: string | Array<string>},
  statusCode?: number,
) {
  return http[requestMethod](mockApiMetadataJsonIsland[apiKey].url, () => {
    return respondWithError(errorBody, statusCode)
  })
}
