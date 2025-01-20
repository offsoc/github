import type {FilterProvider} from '@github-ui/filter'
import {render} from '@github-ui/react-core/test-utils'
import {act, renderHook, screen, waitFor} from '@testing-library/react'
import {useParams} from 'react-router-dom'

import {getSecurityCenterCodeScanningMetricsProps} from '../code-scanning-report/test-utils/mock-data'
import {EnterprisePaths, OrgPaths} from '../common/contexts/Paths'
import type {CustomProperty} from '../common/filter-providers/types'
import {CodeScanningReport, useFilterProviders} from '../routes/CodeScanningReport'
import {PathsProvider} from '../test-utils/PathsProvider'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

describe('CodeScanningReport', () => {
  describe('at organization scope', () => {
    it('renders the view', () => {
      jest.mocked(useParams).mockImplementation(() => ({org: 'my-org'}))
      const routePayload = getSecurityCenterCodeScanningMetricsProps()

      render(<CodeScanningReport />, {routePayload})

      expect(screen.getByRole('heading')).toHaveTextContent('CodeQL pull request alerts')
    })

    describe('useFilterProviders', () => {
      it('should include expected filter providers', async () => {
        const paths = new OrgPaths('my-org')
        let providers: FilterProvider[] | null = null

        renderHook(
          () =>
            act(() => {
              providers = useFilterProviders(paths, true, [])
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual([
            'repo',
            'topic',
            'team',
            'visibility',
            'archived',
            'state',
            'codeql.rule',
            'codeql.autofix',
          ]),
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
              providers = useFilterProviders(paths, true, customProperties)
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual([
            'repo',
            'topic',
            'team',
            'visibility',
            'archived',
            'state',
            'codeql.rule',
            'codeql.autofix',
            'props.foo',
            'props.bar',
            'props.baz',
            'props.qux',
          ]),
        )
      })

      describe('when autofix feature is not available', () => {
        it('should include expected filter providers', async () => {
          const paths = new OrgPaths('my-org')
          let providers: FilterProvider[] | null = null

          renderHook(
            () =>
              act(() => {
                providers = useFilterProviders(paths, false, [])
              }),
            {wrapper: PathsProvider},
          )

          await waitFor(() =>
            expect(providers?.map(p => p.key)).toStrictEqual([
              'repo',
              'topic',
              'team',
              'visibility',
              'archived',
              'state',
              'codeql.rule',
            ]),
          )
        })
      })
    })
  })

  describe('at enterprise scope', () => {
    it('renders the view', () => {
      jest.mocked(useParams).mockImplementation(() => ({business: 'my-biz'}))
      const routePayload = getSecurityCenterCodeScanningMetricsProps()

      render(<CodeScanningReport />, {routePayload})

      expect(screen.getByRole('heading')).toHaveTextContent('CodeQL pull request alerts')
    })

    describe('useFilterProviders', () => {
      it('should include expected filter providers', async () => {
        const paths = new EnterprisePaths('my-biz')
        let providers: FilterProvider[] | null = null

        renderHook(
          () =>
            act(() => {
              providers = useFilterProviders(paths, true, [])
            }),
          {wrapper: PathsProvider},
        )

        await waitFor(() =>
          expect(providers?.map(p => p.key)).toStrictEqual([
            'repo',
            'topic',
            'team',
            'visibility',
            'archived',
            'state',
            'codeql.rule',
            'codeql.autofix',
            'owner',
          ]),
        )
      })

      describe('when autofix feature is not available', () => {
        it('should include expected filter providers', async () => {
          const paths = new EnterprisePaths('my-biz')
          let providers: FilterProvider[] | null = null

          renderHook(
            () =>
              act(() => {
                providers = useFilterProviders(paths, false, [])
              }),
            {wrapper: PathsProvider},
          )

          await waitFor(() =>
            expect(providers?.map(p => p.key)).toStrictEqual([
              'repo',
              'topic',
              'team',
              'visibility',
              'archived',
              'state',
              'codeql.rule',
              'owner',
            ]),
          )
        })
      })
    })
  })
})
