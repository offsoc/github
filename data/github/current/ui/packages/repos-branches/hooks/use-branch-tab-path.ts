import {useCallback} from 'react'
import {useCurrentRepository} from '@github-ui/current-repository'
import type {BranchPageType} from '../types'
import {BRANCH_PAGES} from '../constants'

export default function useBranchTabPath() {
  const repo = useCurrentRepository()
  return useCallback(
    (branchPageType: BranchPageType | string) => {
      const {href} = BRANCH_PAGES.find(page => page.type === branchPageType) || {}
      if (!href) {
        return undefined
      }
      return `/${repo.ownerLogin}/${repo.name}/${href}`
    },
    [repo.name, repo.ownerLogin],
  )
}
