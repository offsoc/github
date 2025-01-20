import {useEffect, useState} from 'react'

import {useViews} from './use-views'

export const LoadingStates = {
  loaded: 'loaded',
  missing: 'missing',
  loading: 'loading',
} as const
export type LoadingStates = ObjectValues<typeof LoadingStates>

export function useViewLoadingState() {
  const [isLoading, setIsLoading] = useState(false)
  const {missingRequiredColumnData} = useViews()

  useEffect(() => {
    if (!missingRequiredColumnData) return
    let mounted = true
    const timeout = window.setTimeout(() => {
      if (mounted) {
        setIsLoading(true)
      }
    }, 300)

    return () => {
      mounted = false
      window.clearTimeout(timeout)
    }
  }, [missingRequiredColumnData])

  useEffect(() => {
    if (!missingRequiredColumnData && isLoading) {
      setIsLoading(false)
    }
  }, [isLoading, missingRequiredColumnData])

  if (isLoading && missingRequiredColumnData) return {loadingState: LoadingStates.loading} as const
  if (missingRequiredColumnData) return {loadingState: LoadingStates.missing} as const
  return {loadingState: LoadingStates.loaded} as const
}
