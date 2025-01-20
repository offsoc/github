import {useClientValue} from '@github-ui/use-client-value'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useLocation, type Location} from 'react-router-dom'

export function useBrowserLocation(): Location {
  const [hash] = useClientValue<string>(() => ssrSafeLocation.hash, '', [ssrSafeLocation.hash])
  const location = useLocation()

  return {
    ...location,
    hash,
  }
}
