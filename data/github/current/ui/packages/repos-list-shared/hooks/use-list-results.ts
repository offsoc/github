import type {SafeHTMLString} from '@github-ui/safe-html'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {useSearchParams} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useSafeTimeout} from '@primer/react'
import {useRef, useState} from 'react'

export interface ListResults<TRepo> {
  repositories: TRepo[]
  repositoryCount: number
  pageCount: number
}

export type PrimaryLanguage = {name: string; color: string}
export type LastUpdated = {hasBeenPushedTo: boolean; timestamp: string}

type VisibilityLabel = 'Private' | 'Public' | 'Internal'
export interface RepositoryItem {
  type: VisibilityLabel | `${VisibilityLabel} archive` | `${VisibilityLabel} template` | 'Public mirror'
  name: string
  owner: string
  isFork: boolean
  description: SafeHTMLString
  allTopics: string[]
  primaryLanguage: PrimaryLanguage | null
  pullRequestCount: number | null
  issueCount: number | null
  starsCount: number
  forksCount: number
  license: string | null
  lastUpdated: LastUpdated
  participation?: number[]
}

interface HookType<TRepo> {
  results: ListResults<TRepo>
  currentPage: number
  isFetching: boolean
  fetchResults(params: {q: string; page: number; searchOnSubmitEnabled?: boolean}): void
}

export function useListResults<TRepo>(
  initialResults: ListResults<TRepo>,
  fetchUrl: string,
  initialPage: number | undefined,
): HookType<TRepo> {
  const [results, setResults] = useState(initialResults)
  const [currentPage, setCurrentPage] = useState(initialPage || 1)
  const [isFetching, setFetching] = useState(false)
  const latestUrlRef = useRef('')
  const [pageParams] = useSearchParams()
  const {safeSetTimeout} = useSafeTimeout()

  async function sleep(ms: number) {
    return new Promise(resolve => safeSetTimeout(resolve, ms))
  }

  function beginFetch() {
    setFetching(true)
    document.dispatchEvent(new Event(SOFT_NAV_STATE.PROGRESS_BAR.START))
  }

  function completeFetch() {
    setFetching(false)
    document.dispatchEvent(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
  }

  async function fetchResults({
    q,
    page,
    searchOnSubmitEnabled,
  }: {
    q: string
    page: number
    searchOnSubmitEnabled?: boolean
  }) {
    try {
      const fetchParams = new URLSearchParams({q, page: page.toString()})
      const url = `${fetchUrl}?${fetchParams}`
      latestUrlRef.current = url

      if (!searchOnSubmitEnabled) {
        await sleep(400)
      }
      beginFetch()
      if (latestUrlRef.current !== url) return

      const response = await verifiedFetchJSON(url)
      if (latestUrlRef.current !== url) return
      if (!response.ok) return

      const newResults = (await response.json()) as ListResults<TRepo>
      setResults(newResults)
      setCurrentPage(page)
      completeFetch()

      if (q) {
        pageParams.set('q', q)
      } else {
        pageParams.delete('q')
      }
      if (page > 1) {
        pageParams.set('page', page.toString())
      } else {
        pageParams.delete('page')
      }
      history.replaceState(undefined, '', `?${pageParams}`)
    } catch (e) {
      // Handle network errors silently, keep previous results
      completeFetch()
    }
  }

  return {results, currentPage, isFetching, fetchResults}
}
