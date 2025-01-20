import type {GetRequestType} from '../../../mocks/msw-responders'
import {post_dismissUserNotice} from '../../../mocks/msw-responders/user-notices'
import {stubApiMethod, stubApiMethodWithError} from './stub-api-method'

export function stubDismissUserNotice() {
  return stubApiMethod<GetRequestType, {success: boolean}>(post_dismissUserNotice, {success: true})
}

export function stubDismissUserNoticeWithError(error: Error) {
  return stubApiMethodWithError<GetRequestType, {success: boolean}>(post_dismissUserNotice, error)
}
