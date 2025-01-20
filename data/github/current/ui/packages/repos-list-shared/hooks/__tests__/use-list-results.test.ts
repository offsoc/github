import {mockFetch} from '@github-ui/mock-fetch'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {act, renderHook, waitFor} from '@testing-library/react'

import {type ListResults, type RepositoryItem, useListResults} from '../use-list-results'

const sampleResults: ListResults<RepositoryItem> = {
  repositories: [...'ABCDE'].map(letter => ({name: `repo-${letter}`}) as RepositoryItem),
  repositoryCount: 20,
  pageCount: 4,
}

const sampleUrl = '/sample/endpoint'

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams()]
    }),
  }
})

describe('useListResults', () => {
  beforeAll(() => jest.useFakeTimers())

  it('return repos from initial payload', async () => {
    const {result: output} = renderHook(() => useListResults(sampleResults, sampleUrl, 1), {wrapper: Wrapper})
    const {results, currentPage, isFetching, fetchResults} = output.current
    expect(results.repositories).toHaveLength(5)
    expect(results.repositoryCount).toBe(20)
    expect(results.pageCount).toBe(4)
    expect(currentPage).toEqual(1)
    expect(isFetching).toEqual(false)
    expect(typeof fetchResults).toBe('function')
  })

  it('updates repos when fetch is called to change page', async () => {
    const endpointMock = mockFetch.mockRouteOnce(`${sampleUrl}?q=&page=4`, {
      repositories: [...'XYZ'].map(letter => ({name: `repo-${letter}`}) as RepositoryItem),
      repositoryCount: 20,
      pageCount: 4,
    })

    const {result: output} = renderHook(() => useListResults(sampleResults, sampleUrl, 1), {wrapper: Wrapper})

    output.current.fetchResults({q: '', page: 4})
    jest.runAllTimers()
    await waitFor(() => expect(endpointMock).toHaveBeenCalledTimes(1))

    const {results, currentPage} = output.current
    expect(results.repositories).toHaveLength(3)
    expect(results.repositoryCount).toBe(20)
    expect(results.pageCount).toBe(4)
    expect(currentPage).toEqual(4)
  })

  it('updates repos when fetch is called to change query', async () => {
    const {result: output} = renderHook(() => useListResults(sampleResults, sampleUrl, 4), {wrapper: Wrapper})
    expect(output.current.isFetching).toEqual(false)

    output.current.fetchResults({q: 'Y', page: 1})

    jest.runAllTimers()
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(1))
    expect(output.current.isFetching).toEqual(true)

    await resolveOneRepo('Y')

    expect(output.current.results.repositoryCount).toEqual(1)
    expect(output.current.isFetching).toEqual(false)
  })

  it('silently handles fetch errors', async () => {
    const {result: output} = renderHook(() => useListResults(sampleResults, sampleUrl, 33), {wrapper: Wrapper})

    output.current.fetchResults({q: 'fail', page: 99})
    jest.runAllTimers()
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(1))

    await act(() => mockFetch.rejectPendingRequest(`${sampleUrl}?q=fail&page=99`, 'Network down'))

    const {results, currentPage, isFetching} = output.current
    expect(results.pageCount).toBe(4)
    expect(currentPage).toEqual(33)
    expect(isFetching).toEqual(false)
  })

  it('cancels previous keystrokes while typing', async () => {
    const {result: output} = renderHook(() => useListResults(sampleResults, sampleUrl, 1), {wrapper: Wrapper})
    const {fetchResults} = output.current

    fetchResults({q: 'A', page: 1})
    fetchResults({q: 'B', page: 1})
    fetchResults({q: 'C', page: 1})
    jest.runAllTimers()
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(1))

    await resolveOneRepo('C')
    expect(output.current.results.repositoryCount).toBe(1)
  })

  it('cancels previous fetch when fetching again', async () => {
    const {result: output} = renderHook(() => useListResults(sampleResults, sampleUrl, 1), {wrapper: Wrapper})
    const {fetchResults} = output.current

    fetchResults({q: 'A', page: 1})
    jest.runAllTimers()
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(1))

    fetchResults({q: 'B', page: 1})
    jest.runAllTimers()
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(2))

    fetchResults({q: 'C', page: 1})
    jest.runAllTimers()
    await waitFor(() => expect(mockFetch.fetch).toHaveBeenCalledTimes(3))

    await resolveOneRepo('A')
    // Ignore because it's not latest
    expect(output.current.results.repositoryCount).toBe(20)

    await resolveOneRepo('B')
    // Ignore because it's not latest
    expect(output.current.results.repositoryCount).toBe(20)

    await resolveOneRepo('C')
    expect(output.current.results.repositoryCount).toBe(1)
  })
})

async function resolveOneRepo(name: string) {
  await act(() =>
    mockFetch.resolvePendingRequest(`${sampleUrl}?q=${name}&page=1`, {
      repositories: [{name: `repo-${name}`} as RepositoryItem],
      repositoryCount: 1,
      pageCount: 1,
    }),
  )
}
