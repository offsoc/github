import {ErrorMessage} from './ErrorMessage'
import {LoadingMessage} from './LoadingMessage'
import {ReadyMessage} from './ReadyMessage'
import {RequestReviewMessage} from './RequestReviewMessage'

export interface BannerContentProps {
  isReviewRequested: boolean
  isError: boolean
  isLoading: boolean
  handleDismiss: () => void
  handleRequestReview: () => void
}

export const BannerMessage = ({
  isLoading,
  isError,
  isReviewRequested,
  handleDismiss,
  handleRequestReview,
}: BannerContentProps) => {
  if (!isReviewRequested) return <RequestReviewMessage onRequestReview={handleRequestReview} />
  if (isError) return <ErrorMessage onDismiss={handleDismiss} />
  if (!isLoading) return <ReadyMessage onDismiss={handleDismiss} />
  return <LoadingMessage />
}
