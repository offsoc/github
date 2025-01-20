import {announce} from '@github-ui/aria-live'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useSearchParams} from '@github-ui/use-navigate'
import Layout from '../components/Layout'
import BranchesTable from '../components/BranchesTable'
import type {Branch, BranchPageType} from '../types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useEffect, useMemo} from 'react'
import useDeferredMetadata from '../hooks/use-deferred-metadata'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'

export interface ListPayload {
  current_page: number
  per_page: number
  has_more: boolean
  branches: Branch[]
}

export function Yours() {
  return <List type="yours" />
}

export function Active() {
  return <List type="active" />
}

export function Stale() {
  return <List type="stale" />
}

export function All() {
  return <List type="all" />
}

export function List({type}: {type: Exclude<BranchPageType, 'overview'>}) {
  const payload = useRoutePayload<ListPayload>()
  const repo = useCurrentRepository()
  const [searchParams] = useSearchParams()

  const {screenSize} = useScreenSize()
  const isLarge = screenSize >= ScreenSize.xxxlarge

  const branches = useMemo(() => {
    return payload.branches.map(branch => branch.name)
  }, [payload.branches])

  const deferredMetadata = useDeferredMetadata(repo, branches)

  useEffect(() => {
    if (searchParams.get('query')) {
      if (branches.length === 0) {
        announce(`No results found`)
      } else {
        announce(`${branches.length} result${branches.length > 1 ? 's' : ''} found`)
      }
    }
  }, [branches, searchParams])

  return (
    <Layout selectedPage={type}>
      <BranchesTable branches={payload.branches} deferredMetadata={deferredMetadata} isLarge={isLarge} />
    </Layout>
  )
}
