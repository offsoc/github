import type {PostStatsRequest, PostStatsResponse} from '../../client/api/stats/contracts'
import {post_postStats} from '../msw-responders/stats'
import {BaseController} from './base-controller'

export class StatsController extends BaseController {
  async postStats(request: PostStatsRequest): Promise<PostStatsResponse> {
    this.db.stats.add(request.payload)
    return {success: true}
  }

  public override handlers = [
    post_postStats(async body => {
      return this.postStats(body)
    }),
  ]
}
