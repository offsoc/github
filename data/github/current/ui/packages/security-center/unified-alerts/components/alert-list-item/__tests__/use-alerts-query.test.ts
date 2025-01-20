import {mockFetch} from '@github-ui/mock-fetch'
import {renderHook, waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {getProviderWrappers} from '../../../test-utils/test-helpers'
import {type AlertsResult, useAlertsQuery} from '../use-alerts-query'

describe('useAlertsQuery', () => {
  const BASE_ROUTE = new RegExp('/orgs/github/security/alerts/alerts')

  it('fetches data', async () => {
    const mockResponse: AlertsResult = {
      alerts: [
        {
          featureType: 'dependabot_alerts',
          // common fields
          repositoryId: 123,
          repositoryName: 'very-long-repo-name',
          repositoryHref: '/github/very-long-repo-name',
          repositoryTypeIcon: 'lock',
          alertNumber: 123,
          alertHref: '/github/very-long-repo-name/security/dependabot/123',
          // tool-specific fields
          alertTitle: 'Improper Input Validation in PyYAML',
          alertSeverity: 'critical',
          alertDependencyScope: 'runtime',
          alertPackageName: 'ansi-regex',
          alertEcosystem: 'npm',
          alertLocation: 'package-lock.json',
          alertResolved: false,
          alertResolution: undefined,
          alertUpdatedAt: '2024-04-01 12:34',
        },
        {
          featureType: 'code_scanning',
          // common fields
          repositoryId: 234,
          repositoryName: 'very-long-repo-name',
          repositoryHref: '/github/very-long-repo-name',
          // repositoryVisibility: 'private',
          repositoryTypeIcon: 'lock',
          alertNumber: 234,
          alertHref: '/github/very-long-repo-name/security/code-scanning/234',
          // tool-specific fields
          alertTitle: 'Resolving XML external entity in user-controlled data',
          alertTool: 'CodeQL',
          alertSeverity: 'critical',
          // alertRuleSeverity: string,
          // alertClassifications?: string[],
          alertLocation: 'tests/../stress/CqsStressTester.java:42',
          alertResolved: false,
          alertResolution: undefined,
          alertUpdatedAt: '2024-04-01 12:34',
        },
        {
          featureType: 'secret_scanning',
          // common fields
          repositoryId: 345,
          repositoryName: 'starckle-sqlexample',
          repositoryHref: '/github/starckle-sqlexample',
          // repositoryVisibility: 'private',
          repositoryTypeIcon: 'lock',
          alertNumber: 345,
          alertHref: '/github/starckle-sqlexample/security/secret-scanning/345',
          // tool-specific fields
          alertTitle: 'Google API Key',
          alertSeverity: 'critical',
          alertRawSecret: 'Aizakdbksklsfj1235F2f',
          alertActive: true,
          alertIsCustomPattern: false,
          alertLocation: 'initial_dir/../test_dotfile/name.ext:123',
          alertResolved: false,
          alertResolution: undefined,
          alertUpdatedAt: '2024-04-01 12:34',
        },
      ],
      previous: undefined,
      next: 'abc123',
    }
    const mock = mockFetch.mockRoute(BASE_ROUTE, mockResponse, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(
      () => useAlertsQuery({groupKey: 'repo', groupValue: 'repo:foo', query: 'hello world', cursor: '50'}),
      {wrapper: getProviderWrappers},
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      '/orgs/github/security/alerts/alerts?query=hello+world+repo%3Afoo&cursor=50&pageSize=10',
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })

  it('omits empty query parameters', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE, {}, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() => useAlertsQuery({groupKey: 'none'}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith('/orgs/github/security/alerts/alerts?pageSize=25', expect.anything())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('uses smaller page size for grouped lists', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE, {}, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() => useAlertsQuery({groupKey: 'repo', groupValue: 'repo:foo'}), {
      wrapper: getProviderWrappers,
    })

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      '/orgs/github/security/alerts/alerts?query=repo%3Afoo&pageSize=10',
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns error state if request fails', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE, undefined, {status: 500})

    const {result} = renderHook(() => useAlertsQuery({groupKey: 'none'}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
