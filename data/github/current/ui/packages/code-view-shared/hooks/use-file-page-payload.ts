import type {FilePagePayload} from '@github-ui/code-view-types'
import {extractPathFromPathname} from '@github-ui/paths'
import {useNavigationError} from '@github-ui/react-core/use-navigation-error'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useRef} from 'react'

import {makeErrorPayload} from '../utilities/make-payload'

export function useFilePagePayload(initialPayload?: FilePagePayload): FilePagePayload {
  const routePayload = useRoutePayload<FilePagePayload>()
  let payload = initialPayload || routePayload
  // we assume that the first payload is always good
  const lastGoodPayload = useRef(payload)
  const error = useNavigationError()

  if (!payload) {
    const newPath = extractPathFromPathname(
      location.pathname,
      lastGoodPayload.current.refInfo.name,
      lastGoodPayload.current.path,
    )
    payload = makeErrorPayload(lastGoodPayload.current, error, newPath)
  } else {
    lastGoodPayload.current = payload
  }
  return payload
}
