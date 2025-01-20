import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import {PageLayout} from '@primer/react'
import MarketplaceHeader from '../components/MarketplaceHeader'
import MarketplaceNavigation from '../components/MarketplaceNavigation'
import type {IndexPayload} from '../types'
import {FilterProvider} from '../contexts/FilterContext'
import {IndexAndSearchContent} from '../components/IndexAndSearchContent'

export function Index() {
  const payload = useRoutePayload<IndexPayload>()

  return (
    <FilterProvider>
      <MarketplaceHeader />
      <PageLayout>
        <PageLayout.Pane position="start">
          <MarketplaceNavigation categories={payload.categories} />
        </PageLayout.Pane>
        <PageLayout.Content as="div">
          <IndexAndSearchContent payload={payload} />
        </PageLayout.Content>
      </PageLayout>
    </FilterProvider>
  )
}
