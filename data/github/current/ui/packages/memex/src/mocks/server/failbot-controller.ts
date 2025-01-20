import {http, HttpResponse} from 'msw'

import {BaseController} from './base-controller'

const errorsUrl = new URL(`/_private/browser/errors`, window.location.origin)

export class FailbotController extends BaseController {
  public errorsUrl = errorsUrl.toString()
  create(error: PlatformReportBrowserErrorInput) {
    this.db.failbot.create(error)
  }

  public override handlers = [
    http.post<never, PlatformReportBrowserErrorInput>(this.errorsUrl, async ({request}) => {
      const body = await request.json()
      this.create(body)
      return new HttpResponse(null, {status: 200})
    }),
  ]
}
