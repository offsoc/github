import {useState, useEffect} from 'react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import type {RunnersResponse} from '../types'

export interface ApiResponse {
  runnersResponse: RunnersResponse
  isLoading: boolean
  error: boolean
}

export function useRunners(endpoint: string): ApiResponse {
  const [runnersResponse, setRunnersResponse] = useState<RunnersResponse>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const response = await verifiedFetchJSON(endpoint)
      if (response.ok) {
        const data = await response.json()
        setRunnersResponse(data)
        setIsLoading(false)
      } else {
        setError(true)
      }
    }

    fetchData()
  }, [endpoint])

  return {
    runnersResponse,
    isLoading,
    error,
  }
}
