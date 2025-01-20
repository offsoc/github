export class NotificationsSubscriptionsCollection {
  private viewerIsSubscribed: boolean

  constructor(viewerIsSubscribed: boolean = false) {
    this.viewerIsSubscribed = viewerIsSubscribed
  }

  public get() {
    return this.viewerIsSubscribed
  }

  public create() {
    this.viewerIsSubscribed = true
    return this.viewerIsSubscribed
  }

  public destroy() {
    this.viewerIsSubscribed = false
    return this.viewerIsSubscribed
  }
}
