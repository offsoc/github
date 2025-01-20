import {post_dismissUserNotice} from '../msw-responders/user-notices'
import {BaseController} from './base-controller'

export class UserNoticesController extends BaseController {
  public override handlers = [
    post_dismissUserNotice(async () => {
      return Promise.resolve({success: true})
    }),
  ]
}
