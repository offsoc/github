import {pageTypeForUngroupedItems} from '../../../../../client/state-providers/memex-items/queries/query-keys'
import {
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
} from '../../../../../client/state-providers/memex-items/queries/types'
import {getUpdatedItemsPageParams} from '../../../../../client/state-providers/memex-items/queries/use-next-placeholder-query/get-updated-items-page-params'
import {
  getQueryDataForGroupedItemsPage,
  getQueryDataForMemexItemsPage,
} from '../../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {issueFactory} from '../../../../factories/memex-items/issue-factory'
import {createMemexItemModel} from '../../../../mocks/models/memex-item-model'
import {createTestQueryClient} from '../../../../test-app-wrapper'
import {setGroupedItemsForPage, setMemexItemsForPage} from '../../query-client-api/helpers'

const mockPageInfo = (hasNextPage = false) => ({
  hasNextPage,
  hasPreviousPage: false,
  startCursor: 'startCursor',
  endCursor: 'endCursor',
})

const mockItemsData = (hasNextPage = false) => ({
  nodes: [issueFactory.build()],
  pageInfo: mockPageInfo(hasNextPage),
})

describe('getUpdatedItemsPageParams', () => {
  const queryClient = createTestQueryClient()
  const variables = {q: 'is:issue'}
  const groupedItemsPageType = {groupId: 'group1'}
  it('seeds an initial page param if none is present', () => {
    const newPageParams = getUpdatedItemsPageParams(
      queryClient,
      variables,
      undefined,
      groupedItemsPageType,
      mockItemsData(),
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage])
  })
  it('does nothing if initial param is present and next_placeholder param is not present', () => {
    const pageParams = [pageParamForInitialPage, {after: 'someCursor'}]
    const newPageParams = getUpdatedItemsPageParams(
      queryClient,
      variables,
      pageParams,
      groupedItemsPageType,
      mockItemsData(),
    )
    expect(newPageParams).toEqual(pageParams)
  })
  it('includes the next page param if placeholder data length exceeds received data length', () => {
    const placeholderItems = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
    setGroupedItemsForPage(queryClient, variables, groupedItemsPageType, pageParamForNextPlaceholder, placeholderItems)
    const itemsDataWithNextPage = mockItemsData(true)
    expect(placeholderItems.length).toBeGreaterThan(itemsDataWithNextPage.nodes.length)
    const newPageParams = getUpdatedItemsPageParams(
      queryClient,
      variables,
      [pageParamForInitialPage, pageParamForNextPlaceholder],
      groupedItemsPageType,
      itemsDataWithNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage, {after: 'endCursor'}, pageParamForNextPlaceholder])
    const newPlaceholderQuery = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      groupedItemsPageType,
      pageParamForNextPlaceholder,
    )
    expect(newPlaceholderQuery?.nodes).toMatchObject([placeholderItems[1]])
  })
  it('removes the next_placeholder page param and query if received data replaces all placeholder data', () => {
    const placeholderItems = [issueFactory.build()].map(i => createMemexItemModel(i))
    setGroupedItemsForPage(queryClient, variables, groupedItemsPageType, pageParamForNextPlaceholder, placeholderItems)
    const itemsDataWithNextPage = mockItemsData(true)
    expect(placeholderItems.length).toEqual(itemsDataWithNextPage.nodes.length)
    const newPageParams = getUpdatedItemsPageParams(
      queryClient,
      variables,
      [pageParamForNextPlaceholder],
      groupedItemsPageType,
      itemsDataWithNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage])
    const newPlaceholderQuery = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      groupedItemsPageType,
      pageParamForNextPlaceholder,
    )
    expect(newPlaceholderQuery).toBeUndefined()
  })
  it('removes the next_placeholder page param and query if there are no more pages on server', () => {
    const placeholderItems = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
    setGroupedItemsForPage(queryClient, variables, groupedItemsPageType, pageParamForNextPlaceholder, placeholderItems)
    const itemsDataWithoutNextPage = mockItemsData(false)
    expect(placeholderItems.length).toBeGreaterThan(itemsDataWithoutNextPage.nodes.length)
    const newPageParams = getUpdatedItemsPageParams(
      queryClient,
      variables,
      [pageParamForNextPlaceholder],
      groupedItemsPageType,
      itemsDataWithoutNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage])
    const newPlaceholderQuery = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      groupedItemsPageType,
      pageParamForNextPlaceholder,
    )
    expect(newPlaceholderQuery).toBeUndefined()
  })
  it('resolves page params for pageTypeForUngroupedItems too', () => {
    const placeholderItems = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
    setMemexItemsForPage(queryClient, variables, pageParamForNextPlaceholder, placeholderItems)
    const itemsDataWithNextPage = mockItemsData(true)
    expect(placeholderItems.length).toBeGreaterThan(itemsDataWithNextPage.nodes.length)
    const newPageParams = getUpdatedItemsPageParams(
      queryClient,
      variables,
      [pageParamForInitialPage, pageParamForNextPlaceholder],
      pageTypeForUngroupedItems,
      itemsDataWithNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage, {after: 'endCursor'}, pageParamForNextPlaceholder])
    const newPlaceholderQuery = getQueryDataForMemexItemsPage(queryClient, variables, pageParamForNextPlaceholder)
    expect(newPlaceholderQuery?.nodes).toMatchObject([placeholderItems[1]])
  })
})
