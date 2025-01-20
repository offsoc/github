import {renderHook, waitFor} from '@testing-library/react'

import useRoute from '../../hooks/use-route'

import {NEW_BUDGET_ROUTE} from '../../routes'

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

describe('useRoute', () => {
  it('returns a path with matching base path', async () => {
    const {result} = renderHook(() => useRoute(NEW_BUDGET_ROUTE))
    await waitFor(() => expect(result.current.path).toEqual('/enterprises/github-inc/billing/budgets/new'))
  })
})
