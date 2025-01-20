import {mockFetch} from '@github-ui/mock-fetch'
import {renderHook, waitFor} from '@testing-library/react'

import {useDiscounts} from '../../hooks/discount'

import {MOCK_PRODUCT_ACTIONS} from '../../test-utils/mock-data'

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

const MOCK_DISCOUNTS = [
  {
    isFullyApplied: true,
    currentAmount: 50,
    targetAmount: 50,
    percentage: 0,
    uuid: '87040e3f-eed0-4c15-abe3-f595150d51db',
    targets: [
      {
        id: '1',
        type: 'EnterpriseDiscount',
      },
    ],
  },
]

const MOCK_DISCOUNT_TARGET_MAP = {
  enterprise: {
    'fixed-amount': {
      appliedAmount: 50,
      targetAmount: 50,
    },
  },
}

describe('useDiscounts', () => {
  it('Returns discount data when response status code is 200', async () => {
    mockFetch.mockRouteOnce('/enterprises/github-inc/billing/discounts?month=7&year=2023', {
      discounts: MOCK_DISCOUNTS,
    })
    jest.useFakeTimers().setSystemTime(new Date(2023, 6, 1))

    const {result} = renderHook(() => useDiscounts({enabledProducts: [MOCK_PRODUCT_ACTIONS]}))

    await waitFor(() => expect(result.current.discounts).toEqual(MOCK_DISCOUNTS))
    await waitFor(() => expect(result.current.discountTargetAmounts).toEqual(MOCK_DISCOUNT_TARGET_MAP))
  })

  it('Sets the state to empty array when the response status code is not 200', async () => {
    mockFetch.mockRouteOnce('/enterprises/github-inc/billing/discounts?month=7&year=2023', undefined, {
      ok: false,
      status: 500,
    })
    jest.useFakeTimers().setSystemTime(new Date(2023, 6, 1))

    const {result} = renderHook(() => useDiscounts({enabledProducts: [MOCK_PRODUCT_ACTIONS]}))

    await waitFor(() => expect(result.current.discounts).toEqual([]))
    await waitFor(() => expect(result.current.discountTargetAmounts).toEqual({}))
  })
})
