import {
  delete_destroyNotificationSubscription,
  post_createNotificationSubscription,
} from '../msw-responders/notifications-subscriptions'
import {BaseController} from './base-controller'

export class NotificationsSubscriptionsController extends BaseController {
  get() {
    return this.db.notificationsSubscriptions.get()
  }

  async create(): Promise<void> {
    this.server.sleep()

    this.db.notificationsSubscriptions.create()
  }

  async destroy(): Promise<void> {
    this.server.sleep()

    this.db.notificationsSubscriptions.destroy()
  }

  public override handlers = [
    post_createNotificationSubscription(async () => {
      return this.create()
    }),
    delete_destroyNotificationSubscription(async () => {
      await this.destroy()
    }),
  ]
}
