import {useEffect, useState} from 'react'

export const useDelayedLoading = (loading: boolean, delay = 400) => {
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (!loading) {
      setIsLoading(false)
    }

    if (loading) {
      const timeoutId = setTimeout(() => setIsLoading(true), delay)
      return () => clearTimeout(timeoutId)
    }
  }, [loading, delay])

  return isLoading
}
