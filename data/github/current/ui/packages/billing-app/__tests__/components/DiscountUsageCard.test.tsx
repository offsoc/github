import {render} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {screen, waitFor} from '@testing-library/react'

import {DiscountUsageCard} from '../../components/usage'

import {MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_LFS} from '../../test-utils/mock-data'
import {MOCK_DISCOUNTS, MOCK_DISCOUNTS_WITH_FREE_PUBLIC_REPO} from '../../test-utils/mock-discount-data'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

describe('DiscountUsageCard', () => {
  const month = new Date().getUTCMonth() + 1
  const year = new Date().getUTCFullYear()
  const discountRoute = `/enterprises/github-inc/billing/discounts?month=${month}&year=${year}`

  test('Renders the discount usage card for one product', async () => {
    mockFetch.mockRouteOnce(discountRoute, {discounts: MOCK_DISCOUNTS})

    render(<DiscountUsageCard enabledProducts={[MOCK_PRODUCT_ACTIONS]} isOrganization={false} />)

    await waitFor(() => expect(screen.getByTestId('total-discount')).toHaveTextContent('$396.00'))
  })
  test('Renders the discount usage card for two products', async () => {
    mockFetch.mockRouteOnce(discountRoute, {discounts: MOCK_DISCOUNTS})

    render(<DiscountUsageCard enabledProducts={[MOCK_PRODUCT_ACTIONS, MOCK_PRODUCT_LFS]} isOrganization={false} />)

    await waitFor(() => expect(screen.getByTestId('total-discount')).toHaveTextContent('$426.00'))
  })

  test('Renders the free for public repo discount when there is one', async () => {
    mockFetch.mockRouteOnce(discountRoute, {
      discounts: MOCK_DISCOUNTS_WITH_FREE_PUBLIC_REPO,
    })

    render(<DiscountUsageCard enabledProducts={[MOCK_PRODUCT_ACTIONS]} isOrganization={false} />)

    await waitFor(() => expect(screen.getByTestId('total-discount')).toHaveTextContent('$60.00'))
  })
})
