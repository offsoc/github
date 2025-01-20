import {type FilesPageInfo, useFilesPageInfo} from '../../contexts/FilesPageInfoContext'
import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {mockFetch} from '@github-ui/mock-fetch'
import {act, renderHook, waitFor} from '@testing-library/react'

import {resetTreeListMemoizeFetch, useTreeList} from '../use-tree-list'

jest.mock('@github-ui/current-repository')
const mockedUseCurrentRepository = jest.mocked(useCurrentRepository)

jest.mock('../../contexts/FilesPageInfoContext')
const mockedUseFilesPageInfo = jest.mocked(useFilesPageInfo)

beforeEach(() => {
  mockedUseCurrentRepository.mockReturnValue({ownerLogin: 'owner', name: 'repo'} as Repository)
  mockedUseFilesPageInfo.mockReturnValue({refInfo: {name: 'main', currentOid: '2dead2be'}} as FilesPageInfo)
  resetTreeListMemoizeFetch()
})

describe('useTreeList', () => {
  test('starts loading on first call', async () => {
    const {result} = renderHook(() => useTreeList('2dead2be', true))
    expect(result.current).toEqual({list: [], directories: [], loading: true})

    await act(() =>
      mockFetch.resolvePendingRequest('/owner/repo/tree-list/2dead2be?include_directories=true', {
        paths: ['a', 'b', 'c'],
        directories: ['d'],
      }),
    )

    expect(result.current).toEqual({list: ['a', 'b', 'c', 'd'], directories: ['d'], error: false})
  })

  test('memoize using hooks in multiple places', async () => {
    renderHook(() => useTreeList('mock-oid', true))
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(1))

    // Create a new instance of the hook with separate state, but they must share the cached result.
    renderHook(() => useTreeList('mock-oid', true))
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(1))
  })
})
