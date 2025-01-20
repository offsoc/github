import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {UsageFilters} from '../../../components/usage'

import {GROUP_BY_PRODUCT_TYPE} from '../../../constants'

import {DEFAULT_FILTERS, GITHUB_INC_CUSTOMER, GROUP_SELECTIONS, PERIOD_SELECTIONS} from '../../../test-utils/mock-data'

import type {Filters} from '../../../types/usage'
import {UsagePeriod} from '../../../enums'

function TestComponent({
  filters = DEFAULT_FILTERS,
  setFiltersMock = jest.fn(),
}: {
  filters?: Filters
  setFiltersMock?: jest.Mock
}) {
  const environment = createMockEnvironment()

  return (
    <RelayEnvironmentProvider environment={environment}>
      <UsageFilters
        groupSelections={GROUP_SELECTIONS}
        periodSelections={PERIOD_SELECTIONS}
        filters={filters}
        setFilters={setFiltersMock}
        customer={GITHUB_INC_CUSTOMER}
        showSearch={true}
        useUsageChartDataEndpoint={false}
      />
    </RelayEnvironmentProvider>
  )
}

describe('UsageFilters', () => {
  test('Renders a usage period dropdown', async () => {
    render(<TestComponent />)

    fireEvent.click(screen.getByText('Time Frame: Current month'))
    const menuItems = screen.getAllByRole('menuitemradio')
    expect(menuItems).toHaveLength(PERIOD_SELECTIONS.length)
    expect(menuItems.find(m => m.getAttribute('aria-checked') === 'true')).toHaveTextContent('Current month')
  })

  test('Calls setFilters when period value is changed', () => {
    const setFiltersMock = jest.fn()
    render(<TestComponent setFiltersMock={setFiltersMock} />)

    // open the period dropdown and click on the Today option
    fireEvent.click(screen.getByText('Time Frame: Current month'))
    fireEvent.click(screen.getByText('Today'))
    expect(setFiltersMock).toHaveBeenCalledTimes(1)
    expect(setFiltersMock).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      period: {
        displayText: 'Today',
        type: UsagePeriod.TODAY,
      },
    })
  })

  test('Calls setFilters when group value is changed', () => {
    const setFiltersMock = jest.fn()
    render(<TestComponent setFiltersMock={setFiltersMock} />)

    // open the group dropdown and click on the Product option
    fireEvent.click(screen.getByText('Group: None'))
    fireEvent.click(screen.getByText('Product'))
    expect(setFiltersMock).toHaveBeenCalledTimes(1)
    expect(setFiltersMock).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      group: {
        displayText: 'Product',
        type: GROUP_BY_PRODUCT_TYPE,
      },
    })
  })

  test('Calls setFilters when searchQuery value is changed', () => {
    const setFiltersMock = jest.fn()
    jest.useFakeTimers()
    render(<TestComponent setFiltersMock={setFiltersMock} />)

    // Type out the search query
    fireEvent.change(screen.getByTestId('search-usage'), {target: {value: 'product:actions'}})
    jest.runAllTimers()
    expect(setFiltersMock).toHaveBeenCalledTimes(1)
    expect(setFiltersMock).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      searchQuery: 'product:actions',
    })
  })

  describe('Group selection options', () => {
    test('removes product grouping when search query includes product', () => {
      const filters = {...DEFAULT_FILTERS, searchQuery: 'product:actions'}
      render(<TestComponent filters={filters} />)

      fireEvent.click(screen.getByText('Group: None'))
      const productButton = screen.queryByText('Product')
      expect(productButton).toBeNull()
    })

    test('removes product grouping when search query includes sku', () => {
      const filters = {...DEFAULT_FILTERS, searchQuery: 'sku:actions'}
      render(<TestComponent filters={filters} />)

      fireEvent.click(screen.getByText('Group: None'))
      const productButton = screen.queryByText('Product')
      expect(productButton).toBeNull()
    })

    test('removes sku grouping when search query includes sku', () => {
      const filters = {...DEFAULT_FILTERS, searchQuery: 'sku:actions_linux'}
      render(<TestComponent filters={filters} />)

      fireEvent.click(screen.getByText('Group: None'))
      const skuButton = screen.queryByText('SKU')
      expect(skuButton).toBeNull()
    })

    test('removes org grouping when search query includes org', () => {
      const filters = {...DEFAULT_FILTERS, searchQuery: 'org:github'}
      render(<TestComponent filters={filters} />)

      fireEvent.click(screen.getByText('Group: None'))
      const skuButton = screen.queryByText('Organization')
      expect(skuButton).toBeNull()
    })

    test('removes org grouping when search query includes repo', () => {
      const filters = {...DEFAULT_FILTERS, searchQuery: 'repo:github/private-server'}
      render(<TestComponent filters={filters} />)

      fireEvent.click(screen.getByText('Group: None'))
      const skuButton = screen.queryByText('Organization')
      expect(skuButton).toBeNull()
    })

    test('removes repo grouping when search query includes repo', () => {
      const filters = {...DEFAULT_FILTERS, searchQuery: 'repo:github/private-server'}
      render(<TestComponent filters={filters} />)

      fireEvent.click(screen.getByText('Group: None'))
      const skuButton = screen.queryByText('Repository')
      expect(skuButton).toBeNull()
    })
  })
})
