import {memo, useEffect, useRef} from 'react'
import {type Location, useLocation} from 'react-router-dom'

import {PathChange} from '../api/stats/contracts'
import {usePostStats} from '../hooks/common/use-post-stats'
import {findRouteBestMatchByPath} from '../routes'

export const TrackPathChanges = memo(function TrackPathChanges() {
  const {postStats} = usePostStats()
  const location = useLocation()
  const previousPathnameRef = useRef<Location['pathname'] | null>(null)
  const currentPathname = location.pathname

  useEffect(() => {
    const previousPathname = previousPathnameRef.current
    // Ignoring queryString-only changes, since they're not part of the routes
    if (currentPathname !== previousPathname) {
      const currentMatch = findRouteBestMatchByPath(currentPathname)

      const statChangePayload = {
        currentPath: currentPathname,
        previousPath: previousPathname,
        // Disable "github/unescaped-html-literal" because this is not HTML and has nothing to do with HTML
        // eslint-disable-next-line github/unescaped-html-literal
        currentBestMatchRoute: currentMatch ? currentMatch.path : '<unknown_route>',
      }

      postStats({
        name: PathChange,
        context: JSON.stringify(statChangePayload),
      })
    }

    previousPathnameRef.current = currentPathname
  }, [currentPathname, postStats])

  return null
})
