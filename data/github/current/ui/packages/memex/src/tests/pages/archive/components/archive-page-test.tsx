import {render, screen} from '@testing-library/react'

import {useEnabledFeatures} from '../../../../client/hooks/use-enabled-features'
import {ArchivePage} from '../../../../client/pages/archive/components/archive-page'
import {
  mockUseGetFieldIdsFromFilter,
  mockUseLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../mocks/hooks/use-load-required-fields'
import {asMockHook} from '../../../mocks/stub-utilities'
import {createTestEnvironment, TestAppContainer} from '../../../test-app-wrapper'

jest.mock('../../../../client/hooks/use-enabled-features')

const getWrapper = () => {
  createTestEnvironment()
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <TestAppContainer>{children}</TestAppContainer>
  )
  return wrapper
}

describe('ArchivePage', () => {
  // Prevent open handle errors
  beforeAll(() => {
    mockUseGetFieldIdsFromFilter()
    mockUseLoadRequiredFieldsForViewsAndCurrentView()
  })

  it('renders the legacy archive view if both memex_paginated_archive and memex_table_without_limits are disabled', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      memex_paginated_archive: false,
      memex_table_without_limits: false,
    })
    const wrapper = getWrapper()
    render(<ArchivePage />, {wrapper})
    expect(screen.queryByTestId('paginated-archive-page')).toBeNull()
    expect(await screen.findByTestId('archive-page')).toBeInTheDocument()
  })

  it('renders the paginated archive view if memex_paginated_archive is enabled', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      memex_paginated_archive: true,
    })
    const wrapper = getWrapper()
    render(<ArchivePage />, {wrapper})
    expect(await screen.findByTestId('paginated-archive-page')).toBeInTheDocument()
    expect(screen.queryByTestId('archive-page')).toBeNull()
  })

  it('renders the paginated archive view if memex_table_without_limits is enabled', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({
      memex_table_without_limits: true,
    })
    const wrapper = getWrapper()
    render(<ArchivePage />, {wrapper})
    expect(await screen.findByTestId('paginated-archive-page')).toBeInTheDocument()
    expect(screen.queryByTestId('archive-page')).toBeNull()
  })
})
