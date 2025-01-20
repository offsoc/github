import {mockFetch} from '@github-ui/mock-fetch'
import {act, renderHook, waitFor} from '@testing-library/react'

import {latestCommitData} from '../sample-data'
import {resetMemoizeFetchJSON, useLatestCommit} from '../use-latest-commit'

beforeEach(() => {
  resetMemoizeFetchJSON()
})

describe('useLatestCommit', () => {
  test('starts loading on first call', async () => {
    const {result} = renderHook(() => useLatestCommit('owner', 'repo', 'main', 'test.txt'))
    const [latestCommit, loading, error] = result.current
    expect(latestCommit).toBeUndefined()
    expect(loading).toBe(true)
    expect(error).toBe(false)
  })

  test('completes loading', async () => {
    const {result} = renderHook(() => useLatestCommit('owner', 'repo', 'main', 'test.txt'))
    const [, loading] = result.current
    expect(loading).toBe(true)

    await act(() => mockFetch.resolvePendingRequest('/owner/repo/latest-commit/main/test.txt', latestCommitData))

    const [updatedLatestCommit, updatedLoading, error] = result.current
    expect(updatedLatestCommit).toEqual(latestCommitData)
    expect(updatedLoading).toBe(false)
    expect(error).toBe(false)
  })

  test('ignores first fetch response if called twice', async () => {
    const {result, rerender} = renderHook((args: [string, string, string, string]) => useLatestCommit(...args), {
      initialProps: ['owner', 'repo', 'main', 'test.txt'],
    })
    const [, loading] = result.current
    expect(loading).toBe(true)

    // We navigate from "test.txt" to "second.txt". Then rerender so the hook gets it
    rerender(['owner', 'repo', 'main', 'second.txt'])

    await act(() =>
      mockFetch.resolvePendingRequest('/owner/repo/latest-commit/main/second.txt', {
        ...latestCommitData,
        author: {displayName: 'John S', login: 'john_s', avatarUrl: '/default_url', path: undefined},
      }),
    )

    const [updatedLatestCommit] = result.current
    expect(updatedLatestCommit!.author!.login).toEqual('john_s')

    // The original request will be ignored even if it comes out of order.
    await act(() => mockFetch.resolvePendingRequest('/owner/repo/latest-commit/main/test.txt', latestCommitData))

    const [lateLatestCommit] = result.current
    expect(lateLatestCommit!.author!.login).toEqual('john_s')
  })

  test('memoize using hooks in multiple places', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderHook(() => useLatestCommit('owner', 'repo', 'main', 'test.txt'))
    })
    mockFetch.resolvePendingRequest('/owner/repo/latest-commit/main/test.txt', latestCommitData)

    // Create a new instance of the hook. Both hooks doesn't share their immediate state per se, but they DO share the cache.
    const mockAPI = mockFetch.mockRoute('/owner/repo/latest-commit/main/test.txt', latestCommitData)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderHook(() => useLatestCommit('owner', 'repo', 'main', 'test.txt'))
    })
    await waitFor(() => expect(mockAPI).toHaveBeenCalledTimes(0))
  })

  test('recovery from an error', async () => {
    const {result, rerender} = renderHook((args: [string, string, string, string]) => useLatestCommit(...args), {
      initialProps: ['owner', 'repo', 'main', 'test.txt'],
    })
    const [, loading, error] = result.current
    expect(loading).toBe(true)
    expect(error).toBe(false)

    await act(() =>
      mockFetch.resolvePendingRequest('/owner/repo/latest-commit/main/test.txt', {error: 'Error message'}, {ok: false}),
    )

    const [updatedLatestCommit, updatedLoading, updatedError] = result.current
    expect(updatedLatestCommit).toEqual(undefined)
    expect(updatedLoading).toBe(false)
    expect(updatedError).toBe(true)

    rerender(['owner', 'repo', 'main', 'second.txt'])

    const [, rerenderLoading, rerenderError] = result.current
    expect(rerenderLoading).toBe(true)
    expect(rerenderError).toBe(false)
  })
})
