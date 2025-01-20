import {useState, useEffect} from 'react'
import {Spinner} from '@primer/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {SafeHTMLDiv} from '@github-ui/safe-html'
import type {SafeHTMLString} from '@github-ui/safe-html'
export interface SearchResultsProps {
  searchQuery: string
}

export function SearchResults({searchQuery}: SearchResultsProps) {
  interface SearchResult {
    redirectUrl?: string
    resultsFragment: string
  }

  const url = '/stafftools/search/search_results_async'

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Add a loading state

  useEffect(() => {
    const fetchSearchResult = async () => {
      setIsLoading(true) // Start loading
      try {
        const params = new URLSearchParams({query: searchQuery})
        const result = await verifiedFetchJSON(`${url}?${params}`, {method: 'GET'})
        if (!result.ok) throw new Error(`HTTP ${result.status}${result.statusText}`)
        const json = await result.json()
        setSearchResult(json)
        const event = new CustomEvent('search.results-loaded', {detail: {searchQuery}})
        window.dispatchEvent(event)
      } finally {
        setIsLoading(false) // Stop loading regardless of the outcome
      }
    }

    if (searchQuery) {
      fetchSearchResult()
    }
  }, [searchQuery])

  useEffect(() => {
    if (searchResult) {
      if (searchResult.redirectUrl) {
        // Redirect logic
        window.location.href = searchResult.redirectUrl
      }
    }
  }, [searchResult])

  // Render loading message while loading
  if (isLoading) {
    return (
      <div>
        <Spinner size="small" />
        <p className="color-fg-muted my-2 mb-0">Loading search results...</p>
      </div>
    )
  }

  // Render search results
  return <SafeHTMLDiv html={searchResult?.resultsFragment as SafeHTMLString} />
}
