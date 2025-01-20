import {getRepositorySearchQuery} from '@github-ui/issue-viewer/Queries'

import {useCallback, useEffect, useRef, useState} from 'react'
import {fetchQuery, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'
import type {Subscription} from 'relay-runtime'
import type {RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {
  TopRepositoriesFragment,
  RepositoryFragment,
  TopRepositories,
  SearchRepositories,
} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerRepository$key} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {
  RepositoryPickerSearchRepositoriesQuery$data,
  RepositoryPickerSearchRepositoriesQuery,
} from '@github-ui/item-picker/RepositoryPickerSearchRepositoriesQuery.graphql'
import type {RepositoryPickerTopRepositories$key} from '@github-ui/item-picker/RepositoryPickerTopRepositories.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'

export interface RepoItem extends RepoData {
  shortDescriptionHTML: string
  id: string
}

const INITIAL_REPOSITORY_COUNT = 10

export function useRepositoryItems(filterText: string): {
  repositories: RepoItem[]
  loading: boolean
  totalCount: number
  loadMore: (after: string, afterFetch: () => void) => void
  endCursor: string | null
} {
  const [repositories, setRepositories] = useState<RepoItem[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [loading, setIsLoading] = useState<boolean>(true)

  const [topRepositoriesLoadedCache, setTopRepositoriesLoadedCache] = useState<RepoItem[] | undefined>(undefined)
  const [topRepositoryResults, setTopRepositoryResults] = useState<RepositoryPickerTopRepositories$key | undefined>()

  const searchedReposSubscription = useRef<Subscription | undefined>(undefined)
  const relayEnvironment = useRelayEnvironment()

  const topRepositoryFragment = useFragment<RepositoryPickerTopRepositories$key>(
    TopRepositoriesFragment,
    topRepositoryResults ?? null,
  )

  if (topRepositoryFragment && !topRepositoriesLoadedCache && !filterText) {
    const {topRepositories} = topRepositoryFragment

    const fetchedRepos = (topRepositories.edges || []).flatMap(a =>
      a?.node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, a.node)] : [],
    )
    setTopRepositoriesLoadedCache(fetchedRepos)
    setIsLoading(false)
    // We already set the cache so reset the top repos so we stop calling Relay
    setTopRepositoryResults(undefined)
  }

  const fetchTopRepos = useCallback(async () => {
    try {
      const topRepos = await fetchQuery<RepositoryPickerTopRepositoriesQuery>(relayEnvironment, TopRepositories, {
        topRepositoriesFirst: INITIAL_REPOSITORY_COUNT,
      }).toPromise()
      setTopRepositoryResults(topRepos?.viewer)
    } catch (_) {
      // If we have an error, just silently catch
      // We can't return because we want to use the useFragment hook
      // But we can check for null later
    }
  }, [relayEnvironment, setTopRepositoryResults])

  useEffect(() => {
    void fetchTopRepos()
  }, [fetchTopRepos])

  useEffect(() => {
    const fetchSearchedRepos = async (query: string) => {
      setIsLoading(true)
      const searchedRepos: RepositoryPickerSearchRepositoriesQuery$data = await new Promise((resolve, reject) => {
        fetchQuery<RepositoryPickerSearchRepositoriesQuery>(relayEnvironment, SearchRepositories, {
          searchQuery: getRepositorySearchQuery(query),
        }).subscribe({
          start: subscription => {
            searchedReposSubscription.current?.unsubscribe()
            searchedReposSubscription.current = subscription
          },
          next: data => {
            resolve(data)
          },
          error: (e: Error) => {
            reject(e)
          },
        })
      })

      const fetchedRepos = (searchedRepos.search.nodes || []).flatMap(node =>
        node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, node)] : [],
      )

      setRepositories(fetchedRepos)
      setEndCursor(searchedRepos.search.pageInfo.endCursor || null)
      setTotalCount(searchedRepos.search.repositoryCount)
      setIsLoading(false)
    }

    if (filterText) {
      void fetchSearchedRepos(filterText)
    } else if (topRepositoriesLoadedCache) {
      setRepositories(topRepositoriesLoadedCache)
    }
  }, [filterText, relayEnvironment, topRepositoriesLoadedCache])

  const loadMore = useCallback(
    async (after: string, afterFetch: () => void) => {
      const searchedRepos: RepositoryPickerSearchRepositoriesQuery$data = await new Promise((resolve, reject) => {
        fetchQuery<RepositoryPickerSearchRepositoriesQuery>(relayEnvironment, SearchRepositories, {
          searchQuery: getRepositorySearchQuery(filterText),
          after,
        }).subscribe({
          start: subscription => {
            searchedReposSubscription.current?.unsubscribe()
            searchedReposSubscription.current = subscription
          },
          next: data => {
            resolve(data)
          },
          error: (e: Error) => {
            reject(e)
          },
        })
      })

      const fetchedRepos = (searchedRepos.search.nodes || []).flatMap(node =>
        node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, node)] : [],
      )

      setRepositories(prevRepos => [...prevRepos, ...fetchedRepos])
      setEndCursor(searchedRepos.search.pageInfo.endCursor || null)

      afterFetch()
    },
    [filterText, relayEnvironment],
  )

  return {repositories, loading, totalCount, loadMore, endCursor}
}
