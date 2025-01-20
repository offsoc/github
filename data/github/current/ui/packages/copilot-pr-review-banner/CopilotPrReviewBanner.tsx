import {useCallback, useState} from 'react'
import {useLoadReviewCompletion} from './use-load-review-completion'
import {Box, Label} from '@primer/react'
import {CopilotBadge} from './CopilotBadge'
import {BannerContainer, type BannerContainerProps} from './BannerContainer'
import {FeedbackLink} from './FeedbackLink'
import {DismissBannerButton} from './DismissBannerButton'
import {RelayEnvironmentProvider, type Environment} from 'react-relay'
import {TreeComparisonProvider, type TreeComparisonProviderProps, useTreeComparison} from './TreeComparisonContext'
import {PullRequestLoader, type PullRequestLoaderProps} from './PullRequestLoader'
import {WebsocketLoader, type WebsocketLoaderProps} from './WebsocketLoader'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {type AnalyticsProviderProps, AnalyticsProvider} from './AnalyticsContext'
import {type CopilotChatServiceProviderProps, CopilotChatServiceProvider} from './CopilotChatServiceContext'
import {ReviewCompletionDataProvider} from './ReviewCompletionDataContext'
import {ReviewThreadProvider} from './ReviewThreadContext'
import {type ThreadNameProviderProps, ThreadNameProvider} from './ThreadNameContext'
import {BannerMessage} from './BannerMessage'

const defaultEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()

interface InnerProps extends Pick<BannerContainerProps, 'location'> {}

export const InnerComponent = ({location}: InnerProps) => {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isReviewRequested, setIsReviewRequested] = useState(false)
  const {treeComparison} = useTreeComparison()
  const {isLoading, isError} = useLoadReviewCompletion({isDismissed, isReviewRequested})
  const handleDismiss = useCallback(() => setIsDismissed(true), [setIsDismissed])
  const handleRequestReview = useCallback(() => setIsReviewRequested(true), [setIsReviewRequested])

  // No commit shas + repository IDs or pull request ID was given, or the given pull request ID was for a pull
  // request that we don't want to show a Copilot pre-review for
  if (treeComparison === undefined) return null

  return (
    <BannerContainer location={location} isLoading={isLoading} isError={isError} isDismissed={isDismissed}>
      <CopilotBadge isLoading={isLoading} isError={isError} />
      <Box sx={{display: 'flex', alignItems: 'center', fontSize: 0, paddingLeft: 1}}>
        <BannerMessage
          isReviewRequested={isReviewRequested}
          isError={isError}
          isLoading={isLoading}
          handleDismiss={handleDismiss}
          handleRequestReview={handleRequestReview}
        />
      </Box>
      <Box sx={{display: 'flex', flexGrow: 1, justifyContent: 'flex-end'}}>
        <Box sx={{mt: 1}}>
          <Label variant="secondary" sx={{mr: 2}}>
            Alpha
          </Label>
          <FeedbackLink />
        </Box>
        <DismissBannerButton isError={isError} iconButton onDismiss={handleDismiss} />
      </Box>
    </BannerContainer>
  )
}

interface ProviderStackProps
  extends TreeComparisonProviderProps,
    AnalyticsProviderProps,
    WebsocketLoaderProps,
    CopilotChatServiceProviderProps,
    ThreadNameProviderProps {
  pullRequestId?: PullRequestLoaderProps['pullRequestId'] | null | undefined
  environment: Environment
}

export const ProviderStack = ({
  analyticsPath,
  children,
  environment,
  pullRequestId,
  signedWebsocketChannel,
  apiURL,
  ssoOrganizations,
  chatService,
  threadName,
  ...treeComparisonProviderProps
}: ProviderStackProps) => (
  <RelayEnvironmentProvider environment={environment}>
    <AnalyticsProvider analyticsPath={analyticsPath}>
      <CopilotChatServiceProvider ssoOrganizations={ssoOrganizations} apiURL={apiURL} chatService={chatService}>
        <ReviewCompletionDataProvider>
          <ThreadNameProvider threadName={threadName}>
            <TreeComparisonProvider {...treeComparisonProviderProps}>
              <ReviewThreadProvider>
                <WebsocketLoader signedWebsocketChannel={signedWebsocketChannel}>
                  {typeof pullRequestId === 'string' && pullRequestId.length > 0 ? (
                    <PullRequestLoader pullRequestId={pullRequestId}>{children}</PullRequestLoader>
                  ) : (
                    children
                  )}
                </WebsocketLoader>
              </ReviewThreadProvider>
            </TreeComparisonProvider>
          </ThreadNameProvider>
        </ReviewCompletionDataProvider>
      </CopilotChatServiceProvider>
    </AnalyticsProvider>
  </RelayEnvironmentProvider>
)

export interface CopilotPrReviewBannerProps
  extends InnerProps,
    Omit<TreeComparisonProviderProps, 'children'>,
    Omit<ProviderStackProps, 'environment'> {
  environment?: Environment
}

export function CopilotPrReviewBanner({environment, location, ...providerStackProps}: CopilotPrReviewBannerProps) {
  if (!isFeatureEnabled('copilot_reviews')) return null
  return (
    <ProviderStack {...providerStackProps} environment={environment ?? defaultEnvironment}>
      <InnerComponent location={location} />
    </ProviderStack>
  )
}
