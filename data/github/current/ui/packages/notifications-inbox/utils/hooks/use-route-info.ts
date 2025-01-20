import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

type PRItemIdentifier = {
  number: number
  repo: string
  owner: string
  type: 'PullRequest'
  filePath?: string
}

type UrlParams = {
  owner: string
  repo: string
  number: string
  viewId: string
  type: string
  notificationId: string
}

export const useRouteInfo = () => {
  const {owner, repo, number, viewId, notificationId} = useParams<UrlParams>()
  const filePath = useParams()['*']
  const itemIdentifier = useMemo(() => {
    let parsedNumber = number ? parseInt(number, 10) : undefined
    if (parsedNumber && parsedNumber < 1) {
      parsedNumber = undefined
    }
    return owner && repo && parsedNumber
      ? ({owner, repo, number: parsedNumber, filePath} as ItemIdentifier | PRItemIdentifier)
      : undefined
  }, [filePath, number, owner, repo])

  return {itemIdentifier, viewId, notificationId}
}
