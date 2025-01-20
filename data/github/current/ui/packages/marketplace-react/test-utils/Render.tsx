import {render} from '@github-ui/react-core/test-utils'
import {FilterProvider} from '../contexts/FilterContext'
import {getIndexRoutePayload} from './mock-data'
import {ThemeProvider} from '@primer/react'
import type {IndexPayload} from '../types'

export const renderWithFilterContext = (component: React.ReactNode, mockOverrides: Partial<IndexPayload> = {}) => {
  const routePayload = getIndexRoutePayload(mockOverrides)
  render(
    <FilterProvider>
      <ThemeProvider>{component}</ThemeProvider>
    </FilterProvider>,
    {routePayload},
  )
}
