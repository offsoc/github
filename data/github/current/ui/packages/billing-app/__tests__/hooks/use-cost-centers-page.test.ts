import {mockFetch} from '@github-ui/mock-fetch'
import {renderHook, waitFor} from '@testing-library/react'

import useCostCentersPage from '../../hooks/cost_centers/use-cost-centers-page'

import {getCostCentersRoutePayload} from '../../test-utils/mock-data/payloads/cost-centers'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({business: 'github-inc'}),
}))

describe('useCostCentersPage', () => {
  beforeEach(() => {
    mockFetch.mockRouteOnce('/enterprises/github-inc/billing/cost_centers', {
      payload: getCostCentersRoutePayload(),
    })
  })

  it('Returns costcenters data when the response status code is 200', async () => {
    const {result} = renderHook(() => useCostCentersPage())

    await waitFor(() => expect(result.current.costCenters.length).toEqual(1))
  })
})
