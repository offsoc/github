import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import type {ItemIdentifier} from '../types/pull-request'

type UrlParams = {
  owner: string
  repo: string
  number: string
}

export function useRouteInfo(): ItemIdentifier | undefined {
  const {owner, repo, number} = useParams<UrlParams>()
  const itemIdentifier = useMemo(() => {
    let parsedNumber = number ? parseInt(number, 10) : undefined
    if (parsedNumber && parsedNumber < 1) {
      parsedNumber = undefined
    }
    return owner && repo && parsedNumber ? {owner, repo, number: parsedNumber} : undefined
  }, [number, owner, repo])

  return itemIdentifier
}
