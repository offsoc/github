import {createRequestHandler, type MswResponseResolver} from '.'

export const post_createNotificationSubscription = (responseResolver: MswResponseResolver<undefined, void>) => {
  return createRequestHandler('post', 'memex-notification-subscription-create-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}

export const delete_destroyNotificationSubscription = (responseResolver: MswResponseResolver<undefined, void>) => {
  return createRequestHandler('delete', 'memex-notification-subscription-destroy-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}
