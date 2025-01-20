import type {FilterProvider} from '@github-ui/filter'
import {render} from '@github-ui/react-core/test-utils'
import {act, renderHook, screen, waitFor} from '@testing-library/react'
import {useParams} from 'react-router-dom'

import {EnterprisePaths, OrgPaths} from '../common/contexts/Paths'
import type {CustomProperty} from '../common/filter-providers/types'
import {EnablementTrendsReport, useFilterProviders} from '../routes/EnablementTrendsReport'
import {getEnablementTrendsReportRoutePayload} from '../test-utils/mock-data'
import {PathsProvider} from '../test-utils/PathsProvider'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

describe('EnablementTrendsReport', () => {
  describe('at organization scope', () => {
    it('renders the view', () => {
      jest.mocked(useParams).mockImplementation(() => ({org: 'my-org'}))
      const routePayload = getEnablementTrendsReportRoutePayload()

      render(<EnablementTrendsReport />, {routePayload})

      expect(screen.getByRole('heading')).toHaveTextContent('Enablement trends')
    })

    describe('useFilterProviders', () => {
      it('should include expected filter providers', async () => {
        const paths = new OrgPaths('my-biz')
        let providers: FilterProvider[] | null = null

        renderHook(
          () =>
            act(() => {
              providers = useFilterProviders(paths, [])
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual(['archived', 'visibility', 'repo', 'team', 'topic']),
        )
      })

      it('should include providers for repository custom properties', async () => {
        const paths = new OrgPaths('my-org')
        const customProperties: CustomProperty[] = [
          {name: 'foo', type: 'string'},
          {name: 'bar', type: 'single_select'},
          {name: 'baz', type: 'multi_select'},
          {name: 'qux', type: 'true_false'},
        ]
        let providers: FilterProvider[] | null = null

        renderHook(
          () =>
            act(() => {
              providers = useFilterProviders(paths, customProperties)
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual([
            'archived',
            'visibility',
            'repo',
            'team',
            'topic',
            'props.foo',
            'props.bar',
            'props.baz',
            'props.qux',
          ]),
        )
      })
    })
  })

  describe('at enterprise scope', () => {
    it('renders the view', () => {
      jest.mocked(useParams).mockImplementation(() => ({business: 'my-biz'}))
      const routePayload = getEnablementTrendsReportRoutePayload()

      render(<EnablementTrendsReport />, {routePayload})

      expect(screen.getByRole('heading')).toHaveTextContent('Enablement trends')
    })

    describe('useFilterProviders', () => {
      it('should include expected filter providers', async () => {
        const paths = new EnterprisePaths('my-biz')
        let providers: FilterProvider[] | null = null

        renderHook(
          () =>
            act(() => {
              providers = useFilterProviders(paths, [])
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual([
            'archived',
            'visibility',
            'repo',
            'team',
            'topic',
            'owner',
          ]),
        )
      })

      it('should include owner-type filter if feature enabled', async () => {
        const paths = new EnterprisePaths('my-biz')
        let providers: FilterProvider[] | null = null

        renderHook(
          () =>
            act(() => {
              providers = useFilterProviders(paths, [], true)
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual([
            'archived',
            'visibility',
            'repo',
            'team',
            'topic',
            'owner',
            'owner-type',
          ]),
        )
      })
    })
  })
})
