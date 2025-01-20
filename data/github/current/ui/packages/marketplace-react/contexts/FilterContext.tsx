import {createContext, useContext, useEffect, useMemo, useState, useCallback, useRef} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useSearchParams} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {IndexPayload, Listing, Model, SearchResults} from '../types'
import {categoryOptions, modelFamilyOptions, taskOptions} from '../utilities/model-filter-options'

interface FilterContextType {
  featured: Listing[]
  recommended: Listing[]
  recentlyAdded: Listing[]
  searchResults: SearchResults
  loading: boolean
  query: string
  onQueryChange: (query: string) => void
  page: number
  setPage: (page: number) => void
  filter: string
  setFilter: (filter: string) => void
  creators: string
  setCreators: (creators: string) => void
  sort: string
  setSort: (sort: string) => void
  category: string | null
  setCategory: (category: string | null) => void
  task: string | null
  setTask: (task: string | null) => void
  modelFamily: string | null
  setModelFamily: (modelFamily: string | null) => void
  type: string | null
  copilotApp: string | null
  isSearching: boolean
  featuredModels: Model[]
}
const filterOptions = {
  all: 'All',
  free_trial: 'Free trial',
}
export const FilterContext = createContext<FilterContextType>({
  featured: [],
  recommended: [],
  recentlyAdded: [],
  searchResults: {results: [], total: 0, totalPages: 0},
  loading: false,
  query: '',
  onQueryChange: () => undefined,
  page: 1,
  setPage: () => undefined,
  filter: filterOptions.all,
  setFilter: () => undefined,
  creators: 'All creators',
  setCreators: () => undefined,
  sort: 'popularity-desc',
  setSort: () => undefined,
  category: null,
  setCategory: () => undefined,
  task: null,
  setTask: () => undefined,
  modelFamily: null,
  setModelFamily: () => undefined,
  type: null,
  copilotApp: null,
  isSearching: false,
  featuredModels: [],
})
export function useFilterContext() {
  return useContext(FilterContext)
}
export function FilterProvider({children}: {children: React.ReactNode}) {
  const payload = useRoutePayload<IndexPayload>()
  const firstUpdate = useRef(true)
  const [featured, setFeatured] = useState<Listing[]>(payload.featured)
  const [recommended, setRecommended] = useState<Listing[]>(payload.recommended)
  const [recentlyAdded, setRecentlyAdded] = useState<Listing[]>(payload.recentlyAdded)
  const [searchResults, setSearchResults] = useState<SearchResults>(payload.searchResults)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const queryWithoutSort = useMemo(() => {
    const queryString = searchParams.get('query')
    if (!queryString) {
      return ''
    }
    return queryString.replace(/sort:([^ ]*)/, '').trim()
  }, [searchParams])
  const [query, setQuery] = useState(queryWithoutSort || '')

  const defaultPage = useMemo(() => {
    if (searchParams.has('page')) {
      const page = Number(searchParams.get('page'))
      return page
    } else {
      return 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [page, setPage] = useState(defaultPage)

  const defaultFilter = useMemo(() => {
    if (searchParams.has('filter')) {
      const filter = searchParams.get('filter')
      if (filter === 'free_trial') {
        return filterOptions.free_trial
      }
    }
    return filterOptions.all
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [filter, setFilter] = useState(defaultFilter)

  const defaultCreators = useMemo(() => {
    if (searchParams.has('verification')) {
      const verification = searchParams.get('verification')
      if (verification === 'verified') {
        return 'Verified creators'
      }
    }
    return 'All creators'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [creators, setCreators] = useState(defaultCreators)

  const defaultSort = useMemo(() => {
    const queryFromParams = searchParams.get('query')
    let sortValue
    if (queryFromParams) {
      const match = queryFromParams.match(/sort:([^ ]*)/)
      sortValue = match ? match[1] : undefined
    }

    switch (sortValue) {
      case 'created-desc':
        return 'created-desc'
      case 'match-desc':
        return 'match-desc'
      default:
        return 'popularity-desc'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [sort, setSort] = useState(defaultSort)

  // We should ensure that users can't put arbitrary strings in the URL and have them displayed in the search
  // dropdowns. Since category is shared between listing types, we can only validate it against the allowlist
  // if type === model.
  const defaultCategory = useMemo(() => {
    if (searchParams.has('type')) {
      if (searchParams.get('type') !== 'models') {
        return searchParams.get('category')
      }
    }
    if (categoryOptions.includes(searchParams.get('category') || '')) {
      return searchParams.get('category')
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [category, setCategory] = useState<string | null>(defaultCategory)

  const defaultTask = useMemo(() => {
    const taskFromParams = searchParams.get('task') || ''
    if (taskOptions.map(t => t.toLowerCase()).includes(taskFromParams.toLowerCase())) {
      return taskFromParams
    }
    return 'All'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [task, setTask] = useState<string | null>(defaultTask)

  const defaultModelFamily = useMemo(() => {
    const modelFamilyFromParams = searchParams.get('model_family') || ''
    if (modelFamilyOptions.includes(modelFamilyFromParams)) {
      return modelFamilyFromParams
    }
    return 'All providers'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [modelFamily, setModelFamily] = useState<string | null>(defaultModelFamily)

  const [type, setType] = useState<string | null>(searchParams.get('type'))
  const [copilotApp, setCopilotApp] = useState<string | null>(searchParams.get('copilot_app'))

  const onQueryChange = useCallback((qry: string) => {
    // When setting a new query, we reset all filters and sort
    setPage(1)
    setFilter(filterOptions.all)
    setCreators('All creators')
    setModelFamily('All providers')
    setTask('All')
    setSort('popularity-desc')
    setCategory(null)
    setType(null)
    setCopilotApp(null)
    setQuery(qry)
  }, [])

  const shouldDisplaySearchResults = useMemo(() => {
    return !!(query || category || type || copilotApp)
  }, [category, copilotApp, query, type])
  const [isSearching, setIsSearching] = useState(shouldDisplaySearchResults)

  const fetchSearchResults = useCallback(
    async (path: string) => {
      setLoading(true)
      const response = await verifiedFetchJSON(path)
      const data = await response.json()
      if (shouldDisplaySearchResults) {
        // This will be just search results
        setSearchResults(data)
      } else {
        // This will be the full index payload
        setFeatured(data.featured)
        setRecommended(data.recommended)
        setRecentlyAdded(data.recentlyAdded)
        setSearchResults(data.searchResults)
      }
      setIsSearching(shouldDisplaySearchResults)
      setLoading(false)
    },
    [shouldDisplaySearchResults],
  )

  useEffect(() => {
    if (firstUpdate.current) {
      // The app is initially rendered with a payload so we don't want to run this on the first page load
      firstUpdate.current = false
      return
    }

    const newParams = new URLSearchParams()
    if (query || sort !== 'popularity-desc') {
      if (sort === 'popularity-desc') {
        newParams.set('query', query)
      } else {
        newParams.set('query', `${query} sort:${sort}`.trim())
      }
    }
    if (filter === filterOptions.free_trial) newParams.set('filter', 'free_trial')
    if (creators === 'Verified creators') newParams.set('verification', 'verified_creator')
    if (page !== 1) newParams.set('page', page.toString())
    if (category) newParams.set('category', category)
    if (modelFamily && modelFamily !== 'All providers') newParams.set('model_family', modelFamily)
    if (task && task !== 'All') newParams.set('task', task)
    if (type) newParams.set('type', type)
    if (copilotApp) newParams.set('copilot_app', copilotApp)

    const path = newParams.toString() ? `/marketplace?${newParams.toString()}` : '/marketplace'
    window.history.replaceState({}, '', path)
    fetchSearchResults(path)
  }, [fetchSearchResults, query, filter, creators, sort, page, category, type, modelFamily, task, copilotApp])

  const value = useMemo<FilterContextType>(() => {
    return {
      featured,
      recommended,
      recentlyAdded,
      searchResults,
      loading,
      query,
      onQueryChange,
      page,
      setPage,
      filter,
      setFilter,
      creators,
      setCreators,
      sort,
      setSort,
      category,
      setCategory,
      task,
      setTask,
      modelFamily,
      setModelFamily,
      type,
      copilotApp,
      isSearching,
      featuredModels: payload.featuredModels,
    }
  }, [
    featured,
    recommended,
    recentlyAdded,
    searchResults,
    loading,
    query,
    onQueryChange,
    page,
    setPage,
    filter,
    setFilter,
    creators,
    setCreators,
    sort,
    setSort,
    category,
    setCategory,
    task,
    setTask,
    modelFamily,
    setModelFamily,
    type,
    copilotApp,
    isSearching,
    payload.featuredModels,
  ])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}
