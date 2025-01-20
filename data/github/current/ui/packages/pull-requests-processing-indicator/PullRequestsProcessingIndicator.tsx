import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {Box, Button, Spinner, Text} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {useCallback, useEffect, useState} from 'react'
import {useAnalytics} from '@github-ui/use-analytics'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import useIsMounted from '@github-ui/use-is-mounted'
import {LinkExternalIcon} from '@primer/octicons-react'
export interface PullRequestsProcessingIndicatorProps {
  processingIndicatorUrl: string
  repositoryId: number
  pullRequestId: number
}

function differenceInSeconds(laterDate: Date, earlierDate: Date) {
  return Math.round(laterDate.getTime() - earlierDate.getTime()) / 1000
}

interface ProcessingState {
  stale: boolean
  latest_unsynced_push_to_head_ref_at: string | null // date
}

const initialProcessingState = {stale: false, latest_unsynced_push_to_head_ref_at: null}

/**
 * Renders a spinner with information if the pull request is stale and the last
 * push was more than 20 seconds ago. Handles its own data fetching from an
 * internal JSON endpoint.
 *
 * This is a React partial rendered by the Rails description partial
 * (app/views/pull_requests/_description.html.erb). Because that Rails partial
 * refreshes on live updates, we don't need to connect this component explicitly
 * to Alive because the HTML fragment will be returned and this component will
 * be re-mounted. It'll fetch the data again from the processing_indicator
 * endpoint and render the spinner if the conditions are met.
 */
export function PullRequestsProcessingIndicatorWithDataFetching({
  processingIndicatorUrl,
  repositoryId,
  pullRequestId,
}: PullRequestsProcessingIndicatorProps) {
  const [processingState, setProcessingState] = useState<ProcessingState>(initialProcessingState)
  const isMounted = useIsMounted()

  const fetchProcessingInfo = useCallback(async () => {
    try {
      const response = await verifiedFetchJSON(processingIndicatorUrl)
      if (response.ok) {
        const state = await response.json()
        if (isMounted()) {
          setProcessingState(state)
        }
      }
    } catch (error) {
      if (isMounted()) {
        setProcessingState(initialProcessingState)
      }
    }
  }, [isMounted, processingIndicatorUrl])

  useEffect(() => {
    fetchProcessingInfo()
    // Only run the fetch once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {stale, latest_unsynced_push_to_head_ref_at} = processingState

  return (
    <Box sx={{mt: -2}}>
      <AnalyticsProvider appName="pull-requests-processing-indicator" category="render" metadata={{}}>
        <PullRequestsProcessingIndicator
          pullRequestId={pullRequestId}
          repositoryId={repositoryId}
          stale={stale}
          latest_unsynced_push_to_head_ref_at={latest_unsynced_push_to_head_ref_at}
        />
      </AnalyticsProvider>
    </Box>
  )
}

/**
 * Renders a spinner with information if the pull request is stale and the last push was more than 20 seconds ago
 * Presentational component that can be wrapped inside of a Relay component
 */
export function PullRequestsProcessingIndicator({
  pullRequestId,
  repositoryId,
  stale,
  latest_unsynced_push_to_head_ref_at,
}: ProcessingState & Pick<PullRequestsProcessingIndicatorProps, 'repositoryId' | 'pullRequestId'>) {
  const {sendAnalyticsEvent} = useAnalytics()

  if (!stale || !latest_unsynced_push_to_head_ref_at) return null
  const now = new Date()
  const lastPushDate = new Date(latest_unsynced_push_to_head_ref_at)
  const secondsSinceLastPush = differenceInSeconds(now, lastPushDate)
  const oneDayinSeconds = 24 * 60 * 60

  if (secondsSinceLastPush < 20 || secondsSinceLastPush >= oneDayinSeconds) return null

  sendAnalyticsEvent('pull_requests.processing_indicator', '', {
    repositoryId,
    pullRequestId,
    secondsSinceLastPush,
  })

  return (
    <Tooltip text="Recent push is still being processed, and will show up in a bit" direction="s">
      <Button
        as="a"
        href="https://gh.io/pr-sync-in-progress"
        variant="invisible"
        sx={{color: 'fg.muted'}}
        trailingVisual={LinkExternalIcon}
      >
        <Box sx={{display: 'flex', alignItems: 'center', fontWeight: 400}}>
          <Spinner size="small" sx={{color: 'fg.muted'}} />
          <Text sx={{color: 'fg.muted', fontSize: 0, ml: 2}}>Processing updates</Text>
        </Box>
      </Button>
    </Tooltip>
  )
}
