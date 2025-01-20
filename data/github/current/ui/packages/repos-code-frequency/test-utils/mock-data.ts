import type {IndexPayload} from '../routes/Index'

export function getIndexRoutePayload(): IndexPayload {
  return {
    graphDataPath: '/',
    isUsingContributionInsights: false,
    tooLargeUrl: '/',
  }
}
