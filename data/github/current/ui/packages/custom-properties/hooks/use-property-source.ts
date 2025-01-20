import type {SourceType} from '@github-ui/custom-properties-types'
import {useLocation, useParams} from 'react-router-dom'

interface PropertySource {
  pathPrefix: PropertyPathPrefix
  settingsLevel: SourceType
  sourceName: string
}

type PropertyPathPrefix = 'enterprises' | 'organizations'

export function usePropertySource(): PropertySource {
  const {pathname} = useLocation()

  const pathPrefix = (() => {
    if (pathname.startsWith('/enterprises')) {
      return 'enterprises'
    } else if (pathname.startsWith('/organizations')) {
      return 'organizations'
    } else {
      throw Error('Current path must start with /enterprises or /organizations')
    }
  })()

  const settingsLevel = pathPrefix === 'enterprises' ? 'business' : 'org'

  const params = useParams()

  const sourceName = (() => {
    switch (pathPrefix) {
      case 'enterprises':
        if (params.business) {
          return params.business
        }
        throw Error('Could not parse business from route')
      case 'organizations':
        if (params.org) {
          return params.org
        }
        throw Error('Could not parse organization from route')
    }
  })()

  return {pathPrefix, settingsLevel, sourceName}
}
