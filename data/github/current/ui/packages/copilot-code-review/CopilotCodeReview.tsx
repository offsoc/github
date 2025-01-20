import type {CopilotChatOrg} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Suspense, useMemo} from 'react'
import {CopilotCodeReviewService, CopilotCodeReviewServiceProvider} from './copilot-code-review-service'
import {CopilotCodeReviewAccess} from './CopilotCodeReviewAccess'
import {CopilotCodeReviewButton, CopilotCodeReviewButtonError} from './CopilotCodeReviewButton'
import type {PullRequestPathParams} from './types'

interface CopilotCodeReviewProps extends PullRequestPathParams {
  apiURL: string
  ssoOrganizations: CopilotChatOrg[]
}

export const CopilotCodeReview: React.FC<CopilotCodeReviewProps> = ({apiURL, ssoOrganizations, ...props}) => {
  const service = useMemo(() => new CopilotCodeReviewService(apiURL, ssoOrganizations), [apiURL, ssoOrganizations])

  return (
    <ErrorBoundary fallback={<CopilotCodeReviewButtonError />}>
      <Suspense fallback={null}>
        <CopilotCodeReviewServiceProvider value={service}>
          <CopilotCodeReviewAccess {...props}>
            <CopilotCodeReviewButton {...props} />
          </CopilotCodeReviewAccess>
        </CopilotCodeReviewServiceProvider>
      </Suspense>
    </ErrorBoundary>
  )
}
