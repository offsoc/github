import type {PullRequestsProcessingIndicatorProps} from '../PullRequestsProcessingIndicator'

export function getPullRequestsProcessingIndicatorProps(): PullRequestsProcessingIndicatorProps {
  return {
    processingIndicatorUrl: '/monalisa/smile/pull/1/processing_info',
    repositoryId: 13,
    pullRequestId: 89,
  }
}
