import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useCallback, useEffect, useState} from 'react'

export const useHash = () => {
  const [hash, setHash] = useState(() => ssrSafeLocation.hash)

  const hashChangeHandler = useCallback(() => {
    setHash(ssrSafeLocation.hash)
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', hashChangeHandler)
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler)
    }
  }, [hashChangeHandler])

  const updateHash = useCallback(
    (newHash: string) => {
      if (newHash !== hash) ssrSafeLocation.hash = newHash
    },
    [hash],
  )

  return [hash, updateHash]
}
