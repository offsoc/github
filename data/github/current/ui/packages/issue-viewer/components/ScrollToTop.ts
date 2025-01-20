// eslint-disable-next-line filenames/match-regex
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {useEffect} from 'react'

type Props = {
  startY?: number
}

export function ScrollToTop({startY}: Props) {
  const pathname = ssrSafeWindow?.location

  useEffect(() => {
    if (startY === undefined) {
      window.scrollTo(0, 0)
    } else {
      if (window.scrollY > startY) {
        window.scrollTo(0, startY)
      }
    }
  }, [pathname, startY])

  return null
}
