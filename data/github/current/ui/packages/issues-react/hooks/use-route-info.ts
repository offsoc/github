import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

type UrlParams = {
  owner: string
  repo: string
  number: string
  viewId: string
  type: string
}

export const useRouteInfo = () => {
  const {owner, repo, number, viewId} = useParams<UrlParams>()
  const itemIdentifier = useMemo(() => {
    let parsedNumber = number ? parseInt(number, 10) : undefined
    if (parsedNumber && parsedNumber < 1) {
      parsedNumber = undefined
    }
    return owner && repo && parsedNumber ? ({owner, repo, number: parsedNumber} as ItemIdentifier) : undefined
  }, [number, owner, repo])

  return {itemIdentifier, viewId}
}
