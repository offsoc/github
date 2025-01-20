import styles from '../marketplace.module.css'

import {Box, Label, Link, Pagination} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/experimental'
import {useCallback, useMemo} from 'react'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import Filters from './Filters'
import MarketplaceItem from './MarketplaceItem'
import type {Category} from '../types'
import {useFilterContext} from '../contexts/FilterContext'

type Props = {
  categories: {
    apps: Category[]
    actions: Category[]
  }
}

export default function ResultList({categories}: Props) {
  const {searchResults} = useFilterContext()
  const {page, setPage, query, copilotApp, category, type} = useFilterContext()

  const onPageChange = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>, p: number) => {
      e.preventDefault()
      setPage(p)
    },
    [setPage],
  )

  const categoryNameMapping = useMemo(() => {
    const mapping = new Map<string, Category>()
    for (const cat of [...categories.apps, ...categories.actions]) {
      mapping.set(cat.slug, cat)
    }
    return mapping
  }, [categories.actions, categories.apps])

  const headingText = useMemo(() => {
    if (query) {
      return `Search results for “${query}”`
    } else if (type === 'models') {
      return 'Models'
    } else if (copilotApp) {
      return 'Copilot Extensions'
    } else if (category) {
      const categoryParam = category
      const cat = categoryParam ? categoryNameMapping.get(categoryParam) : undefined
      const listingType = type === 'actions' ? 'actions' : 'apps'
      return cat ? `${cat.name} ${listingType}` : 'Apps'
    } else if (type === 'actions') {
      return 'Actions'
    } else if (type === 'apps') {
      return 'Apps'
    }
    return 'Search results'
  }, [category, categoryNameMapping, copilotApp, query, type])

  const detailText = useMemo(() => {
    if (query) {
      return `${searchResults.total} ${searchResults.total === 1 ? 'result' : 'results'}`
    } else if (type === 'models') {
      return 'Try, test, and deploy from a wide range of model types, sizes, and specializations'
    } else if (copilotApp) {
      return 'Extend Copilot capabilities using third party tools, services, and data'
    } else if (category) {
      const categoryParam = category
      const cat = categoryParam ? categoryNameMapping.get(categoryParam) : undefined
      return cat ? <SafeHTMLBox html={cat.description_html as SafeHTMLString} /> : ''
    } else if (type === 'actions') {
      return 'Automate your workflow from idea to production'
    } else if (type === 'apps') {
      return 'Build on your workflow with apps that integrate with GitHub'
    }
  }, [category, categoryNameMapping, copilotApp, query, searchResults.total, type])

  return (
    <>
      <div className="d-flex flex-column flex-sm-row flex-justify-between flex-wrap gap-2">
        <div>
          <h2 className="f2 lh-condensed" data-testid="heading-text">
            {headingText}
          </h2>
          {detailText && (
            <span className="fgColor-muted" data-testid="detail-text">
              {detailText}
            </span>
          )}
        </div>
        {copilotApp && (
          <div className="d-flex flex-items-center gap-2">
            <Label variant="success">Beta</Label>
            <Link href="https://github.com/orgs/community/discussions/125067">Give feedback</Link>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Filters />
      </div>

      {searchResults.results.length > 0 ? (
        <>
          <div
            className={`mt-4 ${
              searchResults.results.length === 1 ? styles['marketplace-list-grid-one'] : styles['marketplace-list-grid']
            }`}
            data-testid="search-results"
          >
            {searchResults.results.map(listing => (
              <MarketplaceItem key={`${listing.type}-${listing.id}`} listing={listing} isFeatured={false} />
            ))}
          </div>
          {searchResults.totalPages > 1 && (
            <Pagination
              pageCount={searchResults.totalPages}
              currentPage={page}
              onPageChange={onPageChange}
              showPages={{
                narrow: false,
              }}
            />
          )}
        </>
      ) : (
        <Box sx={{mt: 4}}>
          <Blankslate border>
            <Blankslate.Visual>
              <SearchIcon size="medium" />
            </Blankslate.Visual>
            <Blankslate.Heading>No results</Blankslate.Heading>
            <Blankslate.Description>Try searching by different keywords.</Blankslate.Description>
          </Blankslate>
        </Box>
      )}
    </>
  )
}
