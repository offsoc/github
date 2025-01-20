import styles from '../marketplace.module.css'

import {Heading, UnderlineNav} from '@primer/react'
import MarketplaceItem from '../components/MarketplaceItem'
import type {IndexPayload} from '../types'
import {useState} from 'react'
import ResultList from '../components/ResultList'
import {useFilterContext} from '../contexts/FilterContext'
import ModelItem from '../models/routes/index/components/ModelItem'

type Props = {
  payload: IndexPayload
}
export function IndexAndSearchContent({payload}: Props) {
  const {featured, recommended, recentlyAdded, isSearching, featuredModels} = useFilterContext()
  const [currentList, setCurrentList] = useState<'recommended' | 'recentlyAdded'>('recommended')

  return (
    <>
      {isSearching ? (
        <ResultList categories={payload.categories} />
      ) : (
        <>
          <Heading as="h2" className="f2">
            Models for your every use case
          </Heading>
          <span className="fgColor-muted">
            Try, test, and deploy from a wide range of model types, sizes, and specializations.
          </span>
          <div className={`mt-4 ${styles['marketplace-featured-grid']}`}>
            {featuredModels.map(model => (
              <ModelItem key={model.id} model={model} isFeatured={true} />
            ))}
          </div>
          <Heading as="h2" className="mt-4 f2">
            Discover apps with Copilot extensions
          </Heading>
          <span className="fgColor-muted">Your favorite tools now work with GitHub Copilot.</span>
          <div className={`mt-4 ${styles['marketplace-featured-grid']}`}>
            {featured.map(listing => (
              <MarketplaceItem key={`${listing.type}-${listing.id}`} listing={listing} isFeatured={true} />
            ))}
          </div>

          <UnderlineNav
            aria-label="View recommended or recent marketplace listings"
            sx={{mt: 4, pl: 0, '& button': {padding: '0.375rem 0.5rem !important'}}}
          >
            <UnderlineNav.Item
              as="button"
              aria-current={currentList === 'recommended' ? 'page' : undefined}
              onSelect={event => {
                event?.preventDefault()
                setCurrentList('recommended')
              }}
            >
              Recommended
            </UnderlineNav.Item>
            <UnderlineNav.Item
              as="button"
              aria-current={currentList === 'recentlyAdded' ? 'page' : undefined}
              onSelect={event => {
                event?.preventDefault()
                setCurrentList('recentlyAdded')
              }}
            >
              Recently added
            </UnderlineNav.Item>
          </UnderlineNav>
          {currentList === 'recommended' && (
            <div className={`mt-4 ${styles['marketplace-list-grid']}`}>
              {recommended.map(listing => (
                <MarketplaceItem key={`${listing.type}-${listing.id}`} listing={listing} isFeatured={false} />
              ))}
            </div>
          )}
          {currentList === 'recentlyAdded' && (
            <div className={`mt-4 ${styles['marketplace-list-grid']}`}>
              {recentlyAdded.map(listing => (
                <MarketplaceItem key={`${listing.type}-${listing.id}`} listing={listing} isFeatured={false} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
