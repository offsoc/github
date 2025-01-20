import {CopilotErrorIcon, CopilotIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'
import {useCallback, useState} from 'react'
import {useCopilotCodeReviewService} from './copilot-code-review-service'
import styles from './CopilotCodeReviewButton.module.css'
import type {PullRequestPathParams} from './types'

const useRequestReview = (params: PullRequestPathParams) => {
  const service = useCopilotCodeReviewService()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const requestReview = useCallback(async () => {
    setLoading(true)
    try {
      await service.createCodeReview(params.owner, params.repository, params.number)
    } catch (err) {
      setError(err as Error)
      setLoading(false)
    }
  }, [service, params])

  return {requestReview, loading, error}
}

export const CopilotCodeReviewButton: React.FC<PullRequestPathParams> = props => {
  const {requestReview, loading, error} = useRequestReview(props)

  if (error !== undefined) {
    return <CopilotCodeReviewButtonError />
  }

  return (
    <Button
      block
      size="small"
      leadingVisual={CopilotIcon}
      className={styles.copilotCodeReviewButton}
      onClick={requestReview}
      disabled={loading}
    >
      {loading ? 'Copilot is reviewing' : 'Ask Copilot to review'}
    </Button>
  )
}

export const CopilotCodeReviewButtonError: React.FC = () => (
  <Button block disabled size="small" leadingVisual={CopilotErrorIcon} className={styles.copilotCodeReviewButton}>
    Copilot failed to load
  </Button>
)
