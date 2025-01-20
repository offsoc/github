import {renderHook, waitFor} from '@testing-library/react'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {createQueryWrapper} from '@github-ui/pull-request-page-data-tooling/create-query-wrapper'
import {useUpdateTitleMutation} from '../use-update-title-mutation'
import {getHeaderPageData} from '../../test-utils/mock-data'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import type {HeaderPageData} from '../../page-data/payloads/header'

test('it makes a request to the expected endpoint', async () => {
  const {
    pullRequest: {number, title},
  } = getHeaderPageData()

  const headerUrl = `${BASE_PAGE_DATA_URL}/page_data/${PageData.header}`
  const headerQueryKey = ['header', headerUrl]
  queryClient.setQueryData(headerQueryKey, {pullRequest: {title}})

  const newTitle = `${title}-updated`
  const updateTitleArgs = {id: number, title: newTitle}
  const mockedResponse = {
    ok: true,
    json: async () => ({
      pullRequest: {title: newTitle},
    }),
  }

  mockFetch.mockRouteOnce(/update_title/, updateTitleArgs, mockedResponse)

  const wrapper = createQueryWrapper()
  const {result} = renderHook(() => useUpdateTitleMutation(), {wrapper})
  result.current.mutate(updateTitleArgs)

  await waitFor(() => {
    expect(result.current.isSuccess).toEqual(true)
  })

  const headerData = queryClient.getQueryData<HeaderPageData>(headerQueryKey)!
  expect(headerData.pullRequest.title).toEqual(newTitle)
  expectMockFetchCalledTimes(/update_title/, 1)
})
