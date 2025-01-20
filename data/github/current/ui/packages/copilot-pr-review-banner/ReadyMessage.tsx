import {useCallback, useEffect} from 'react'
import {CopilotChatIntents} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {publishOpenCopilotChat} from '@github-ui/copilot-chat/utils/copilot-chat-events'
import {Button, Text} from '@primer/react'
import {useTreeComparison} from './TreeComparisonContext'
import {useAnalytics} from './AnalyticsContext'
import {useReviewCompletionData} from './ReviewCompletionDataContext'
import {useReviewThread} from './ReviewThreadContext'
import {reviewUserMessage} from '@github-ui/copilot-chat/utils/constants'
import {DismissBannerButton} from './DismissBannerButton'

interface ReadyMessageProps {
  onDismiss: () => void
}

export const ReadyMessage = ({onDismiss}: ReadyMessageProps) => {
  const {completionData} = useReviewCompletionData()
  return completionData?.hasDiffHunks ? <HasReviewMessage /> : <NoChangesMessage onDismiss={onDismiss} />
}

const HasReviewMessage = () => {
  const {makeAnalyticsRequest, loadingMessageShownTime} = useAnalytics()
  const {treeComparison: reference} = useTreeComparison()
  const roundTripBannerLoadTimeMs =
    loadingMessageShownTime === undefined ? undefined : Math.round(performance.now() - loadingMessageShownTime)
  const {completionData} = useReviewCompletionData()
  const {reviewThread} = useReviewThread()

  const handleShowInChat = useCallback(() => {
    if (reference === undefined || completionData?.message === undefined || reviewThread === undefined) return

    publishOpenCopilotChat({
      content: reviewUserMessage,
      intent: CopilotChatIntents.reviewPr,
      references: [reference],
      completion: completionData.message,
      thread: reviewThread,
    })

    const formData = new FormData()
    if (roundTripBannerLoadTimeMs !== undefined) {
      formData.append('round_trip_time_ms', String(roundTripBannerLoadTimeMs))
    }
    makeAnalyticsRequest('POST', formData)
  }, [makeAnalyticsRequest, reference, reviewThread, completionData, roundTripBannerLoadTimeMs])

  useEffect(() => {
    handleShowInChat()
  }, [handleShowInChat])

  return (
    <>
      <Text sx={{color: 'fg.muted'}}>
        <Text sx={{color: 'fg.default', fontWeight: 500}}>Copilot</Text> has found some possible improvements
      </Text>
      <Button variant="invisible" size="small" sx={{marginLeft: 1}} onClick={handleShowInChat}>
        Show in Chat
      </Button>
    </>
  )
}

const NoChangesMessage = ({onDismiss}: ReadyMessageProps) => (
  <>
    <Text sx={{color: 'fg.default'}}>
      <Text sx={{fontWeight: 500}}>Copilot</Text> found no suggestions for this pull request
    </Text>
    <DismissBannerButton iconButton={false} onDismiss={onDismiss} isError={false} />
  </>
)
