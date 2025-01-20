import type {PostStatsRequest, PostStatsResponse} from '../../client/api/stats/contracts'
import {createRequestHandler, type MswResponseResolver} from '.'

export const post_postStats = (responseResolver: MswResponseResolver<PostStatsRequest, PostStatsResponse>) => {
  return createRequestHandler('post', 'stats-post-api-data', responseResolver)
}
