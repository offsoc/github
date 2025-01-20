import {mockFetch} from '@github-ui/mock-fetch'
import {act, renderHook} from '@testing-library/react'

import {useContributors} from '../use-contributors'

const twoContributors = {users: [{name: 'a'}, {name: 'b'}]}
const threeContributors = {users: [{name: 'a'}, {name: 'b'}, {name: 'c'}]}

describe('useContributorsDetails', () => {
  test('starts loading on first call', async () => {
    const {result} = renderHook(() => useContributors('owner', 'repo', 'main', 'test.txt'))
    const {contributors, loading, error} = result.current
    expect(contributors).toBeUndefined()
    expect(loading).toBe(true)
    expect(error).toBeUndefined()
  })

  test('completes loading', async () => {
    const {result} = renderHook(() => useContributors('owner', 'repo', 'main', 'test.txt'))
    const {loading} = result.current
    expect(loading).toBe(true)

    await act(() => mockFetch.resolvePendingRequest('/owner/repo/file-contributors/main/test.txt', twoContributors))

    const {contributors, loading: updatedLoading, error} = result.current
    expect(contributors!.users).toHaveLength(2)
    expect(updatedLoading).toBeUndefined()
    expect(error).toBeUndefined()
  })

  test('ignores first fetch response if called twice', async () => {
    const {result, rerender} = renderHook((args: [string, string, string, string]) => useContributors(...args), {
      initialProps: ['owner', 'repo', 'main', 'test.txt'],
    })
    const {loading} = result.current
    expect(loading).toBe(true)

    // We navigate from "test.txt" to "second.txt". Then rerender so the hook gets it
    rerender(['owner', 'repo', 'main', 'second.txt'])

    await act(() => mockFetch.resolvePendingRequest('/owner/repo/file-contributors/main/second.txt', threeContributors))

    const {contributors} = result.current
    expect(contributors!.users).toHaveLength(3)

    // The original request will be ignored even if it comes out of order.
    await act(() => mockFetch.resolvePendingRequest('/owner/repo/file-contributors/main/test.txt', twoContributors))

    const {contributors: lateContributors} = result.current
    expect(lateContributors!.users).toHaveLength(3)
  })
})
