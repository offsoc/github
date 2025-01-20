import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const post_dismissUserNotice = (responseResolver: MswResponseResolver<GetRequestType, {success: boolean}>) => {
  return createRequestHandler('post', 'memex-dismiss-notice-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}
