import type {PageView, PageViewUpdateRequest, PageViewUpdateResponse} from '../../../client/api/view/contracts'
import {put_updateView} from '../../../mocks/msw-responders/views'
import {stubApiMethod, stubApiMethodWithError} from './stub-api-method'

export function stubUpdateView(view: PageView) {
  return stubApiMethod<PageViewUpdateRequest, PageViewUpdateResponse>(put_updateView, {
    view,
  })
}

export function stubUpdateViewWithError(error: Error) {
  return stubApiMethodWithError<PageViewUpdateRequest, PageViewUpdateResponse>(put_updateView, error)
}
