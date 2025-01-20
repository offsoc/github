import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useMemo, useRef, useState} from 'react'

import {apiCountMatchedRepositoryItems} from '../../../api/repository/api-count-matched-repository-items'
import type {CountMatchedRepositoryItemsRequest, SuggestedRepository} from '../../../api/repository/contracts'
import {getInitialState} from '../../../helpers/initial-state'
import {useApiRequest} from '../../../hooks/use-api-request'
import {useProjectNumber} from '../../../state-providers/memex/use-project-number'
import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {formatQuery, getContentTypes, SEARCH_DEBOUNCE_DELAY_MS} from '../helpers/search-constants'

export const useGetItemsAction = () => {
  const [repository, setRepository] = useState<SuggestedRepository | undefined>()
  const [count, setCount] = useState<number>(0)
  const [searchResultUrl, setSearchResultUrl] = useState<string>('')
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()

  const {localQuery, setLocalRepositoryId, setLocalQuery, setLocalContentTypes} = useAutomationGraph()
  const {projectNumber} = useProjectNumber()
  const {projectOwner} = getInitialState()

  const memexExclusionFilter = useMemo(() => {
    return `-project:${projectOwner?.login}/${projectNumber}`
  }, [projectNumber, projectOwner])

  const getMatchedRespositoryItemsCountRequest = useCallback(
    (request: CountMatchedRepositoryItemsRequest) => apiCountMatchedRepositoryItems(request),
    [],
  )

  const handleGetMatchedRespositoryItemsCountRequest = useApiRequest({
    request: getMatchedRespositoryItemsCountRequest,
  })

  const getMatchedItemsCount = useCallback(
    async (targetRepository: SuggestedRepository, searchQuery: string) => {
      if (targetRepository) {
        await handleGetMatchedRespositoryItemsCountRequest.perform({
          repositoryId: targetRepository.id,
          query: searchQuery,
          memexNumber: projectNumber,
        })

        const {data, status} = handleGetMatchedRespositoryItemsCountRequest.status.current
        if (status === 'succeeded' && data) {
          setCount(data.count)
        }
      }
    },
    [handleGetMatchedRespositoryItemsCountRequest, projectNumber],
  )

  const updateSearchResult = useCallback(
    (targetRepository: SuggestedRepository, searchQuery: string) => {
      // If both issues and prs are selected, remove the content type filter because otherwise
      // results cannot be correctly displayed.
      const formattedQuery = formatQuery(searchQuery)
      getMatchedItemsCount(targetRepository, formattedQuery)
      setSearchResultUrl(
        `${targetRepository.url}/issues?q=${encodeURIComponent(`${memexExclusionFilter} ${formattedQuery}`)}`,
      )
    },
    [getMatchedItemsCount, memexExclusionFilter],
  )

  const onSearchQueryChange = useCallback(
    (newQuery: string) => {
      setLocalQuery(newQuery)

      if (debouncedSearch.current) {
        debouncedSearch.current.cancel()
      }

      debouncedSearch.current = debounce(() => {
        if (repository) {
          updateSearchResult(repository, newQuery)
          setLocalContentTypes(getContentTypes(newQuery))
        }
      }, SEARCH_DEBOUNCE_DELAY_MS)

      debouncedSearch.current()
    },
    [setLocalQuery, repository, updateSearchResult, setLocalContentTypes],
  )

  const onRepositoryChange = useCallback(
    (selectedRepository: SuggestedRepository) => {
      updateSearchResult(selectedRepository, localQuery)
      setRepository(selectedRepository)
      setLocalRepositoryId(selectedRepository.id)
    },
    [localQuery, setLocalRepositoryId, updateSearchResult],
  )

  return {
    count,
    searchResultUrl,
    onSearchQueryChange,
    onRepositoryChange,
    repository,
  }
}
