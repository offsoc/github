import {registerReactPartial} from '@github-ui/react-core/register-partial'
import {PullRequestsProcessingIndicatorWithDataFetching} from './PullRequestsProcessingIndicator'

registerReactPartial('pull-requests-processing-indicator', {
  Component: PullRequestsProcessingIndicatorWithDataFetching,
})
