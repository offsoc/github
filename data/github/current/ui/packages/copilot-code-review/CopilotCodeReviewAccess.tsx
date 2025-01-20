import {useCallback, useEffect, useState, type PropsWithChildren} from 'react'
import type {PullRequestPathParams} from './types'
import {useCopilotCodeReviewService} from './copilot-code-review-service'

type CopilotCodeReviewAccessParams = Omit<PullRequestPathParams, 'number'>

const useCheckAccess = (params: CopilotCodeReviewAccessParams) => {
  const service = useCopilotCodeReviewService()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const checkAccess = useCallback(
    async (owner: string, repository: string) => {
      setLoading(true)
      setError(undefined)

      try {
        const {copilot_enabled} = await service.checkCodeReviewAccess(owner, repository)
        setHasAccess(copilot_enabled)
      } catch (err) {
        setError(err as Error)
        setHasAccess(false)
      }

      setLoading(false)
    },
    [service],
  )

  useEffect(() => {
    checkAccess(params.owner, params.repository)
  }, [service, checkAccess, params.owner, params.repository])

  return {hasAccess, loading, error}
}

export const CopilotCodeReviewAccess: React.FC<PropsWithChildren<CopilotCodeReviewAccessParams>> = ({
  children,
  ...params
}) => {
  const {hasAccess} = useCheckAccess(params)
  return !hasAccess ? null : <>{children}</>
}
