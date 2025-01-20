import {renderHook, waitFor} from '@testing-library/react'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {useChangeBaseBranchMutation} from '../use-change-base-branch-mutation'
import {createQueryWrapper} from '@github-ui/pull-request-page-data-tooling/create-query-wrapper'

jest.mock('@github-ui/fetch-utils', () => {
  return {
    fetchPoll: () => {
      return {
        json: async () => ({
          orchestration: {state: 'succeeded'},
        }),
      }
    },
  }
})

test('it makes a request to the expected endpoint', async () => {
  const newBaseBranch = 'foo'
  const newBaseBranchBinary = btoa(encodeURIComponent(newBaseBranch))
  const mockOrchestrationUrl = '/mock/orchestration'
  const mockResponse = {
    ok: true,
    json: async () => ({
      orchestration: {url: mockOrchestrationUrl},
    }),
  }
  mockFetch.mockRouteOnce(/change_base/, {new_base_binary: newBaseBranchBinary}, mockResponse)

  const wrapper = createQueryWrapper()
  const {result} = renderHook(() => useChangeBaseBranchMutation(), {wrapper})
  result.current.mutate({newBaseBranch})

  await waitFor(() => {
    expect(result.current.isSuccess).toEqual(true)
  })
  expectMockFetchCalledTimes(/change_base/, 1)
})
