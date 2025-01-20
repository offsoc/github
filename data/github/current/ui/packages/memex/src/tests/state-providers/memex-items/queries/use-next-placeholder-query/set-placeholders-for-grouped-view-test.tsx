import {createGroupedItemsId} from '../../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type GroupedWithSecondaryGroupsPageParamsQueryData,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PageParamsQueryData,
  type PaginatedMemexItemsQueryVariables,
} from '../../../../../client/state-providers/memex-items/queries/types'
import {setPlaceholdersForGroupedView} from '../../../../../client/state-providers/memex-items/queries/use-next-placeholder-query/set-placeholders-for-grouped-view'
import {
  getQueryDataForMemexGroupsPage,
  getQueryDataForMemexSecondaryGroupsPage,
  setQueryDataForMemexGroupsPage,
  setQueryDataForMemexSecondaryGroupsPage,
} from '../../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {getQueryDataForGroupedItemsPage} from '../../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {setPageParamsQueryDataForVariables} from '../../../../../client/state-providers/memex-items/query-client-api/page-params'
import {seedJSONIsland} from '../../../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../../factories/memex-items/issue-factory'
import {createMemexItemModel} from '../../../../mocks/models/memex-item-model'
import {createTestQueryClient} from '../../../../test-app-wrapper'
import {setGroupedItemsForPage} from '../../query-client-api/helpers'

describe('setPlaceholdersForGroupedView', () => {
  it('sets up grouped placeholder queries', () => {
    seedJSONIsland('memex-columns-data', buildSystemColumns())
    const issues = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {
      verticalGroupedByColumnId: 'Status',
      q: 'is:issue',
    }
    const sourcePageParamQueryData = {
      pageParams: [pageParamForInitialPage, {after: 'cursor'}],
      groupedItems: {group1: [pageParamForInitialPage], group2: [pageParamForInitialPage]},
    }
    const setPageParams = (newQueryData: PageParamsQueryData) => {
      setPageParamsQueryDataForVariables(queryClient, variables, newQueryData)
    }

    // Set up some grouped source data in the query cache
    setGroupedItemsForPage(queryClient, variables, {groupId: 'group1'}, pageParamForInitialPage, [issues[0]])
    setGroupedItemsForPage(queryClient, variables, {groupId: 'group2'}, pageParamForInitialPage, [issues[1]])
    const groups = [
      {groupId: 'group1', groupValue: 'Group 1'},
      {groupId: 'group2', groupValue: 'Group 2'},
    ]
    setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, {
      groups: [groups[0]],
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
    })
    setQueryDataForMemexGroupsPage(
      queryClient,
      variables,
      {after: 'cursor'},
      {
        groups: [groups[1]],
        pageInfo: {hasNextPage: false, hasPreviousPage: true},
      },
    )
    setPageParams(sourcePageParamQueryData)

    // Call the method
    setPlaceholdersForGroupedView(queryClient, variables, variables, sourcePageParamQueryData, setPageParams)

    // Check the results
    const groupsPlaceholderQueryData = getQueryDataForMemexGroupsPage(
      queryClient,
      variables,
      pageParamForNextPlaceholder,
    )
    const groupedItems1 = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      {groupId: 'group1'},
      pageParamForNextPlaceholder,
    )
    const groupedItems2 = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      {groupId: 'group2'},
      pageParamForNextPlaceholder,
    )
    expect(groupsPlaceholderQueryData?.groups).toMatchObject(groups)
    expect(groupedItems1?.nodes).toMatchObject([issues[0]])
    expect(groupedItems2?.nodes).toMatchObject([issues[1]])
  })
  it('sets up placeholder queries for secondary groups when relevant', () => {
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    seedJSONIsland('memex-columns-data', buildSystemColumns())
    const item = createMemexItemModel(issueFactory.build())
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {
      verticalGroupedByColumnId: 'Status',
      horizontalGroupedByColumnId: 'Assignees',
      q: 'is:issue',
    }
    const groupedItemsPageType = {groupId: 'status1', secondaryGroupId: 'assignee1'}
    const groupedItemsId = createGroupedItemsId(groupedItemsPageType)
    const sourcePageParamQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
      pageParams: [pageParamForInitialPage],
      groupedItems: {[groupedItemsId]: [pageParamForInitialPage]},
      secondaryGroups: [pageParamForInitialPage, {after: 'cursor'}],
      groupedItemBatches: [],
    }
    const setPageParams = (newQueryData: PageParamsQueryData) => {
      setPageParamsQueryDataForVariables(queryClient, variables, newQueryData)
    }

    // Set up some grouped source data in the query cache
    setGroupedItemsForPage(queryClient, variables, groupedItemsPageType, pageParamForInitialPage, [item])
    const groups = [{groupId: 'status1', groupValue: 'Status 1'}]
    const secondaryGroups = [
      {groupId: 'assignee1', groupValue: 'Assignee 1'},
      {groupId: 'assignee2', groupValue: 'Assignee 2'},
    ]
    setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, {
      groups,
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
    })
    setQueryDataForMemexSecondaryGroupsPage(queryClient, variables, pageParamForInitialPage, {
      groups: [secondaryGroups[0]],
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
    })
    setQueryDataForMemexSecondaryGroupsPage(
      queryClient,
      variables,
      {after: 'cursor'},
      {
        groups: [secondaryGroups[1]],
        pageInfo: {hasNextPage: false, hasPreviousPage: true},
      },
    )
    setPageParams(sourcePageParamQueryData)

    // Call the method
    setPlaceholdersForGroupedView(queryClient, variables, variables, sourcePageParamQueryData, setPageParams)

    // Check the results
    const groupsPlaceholderQueryData = getQueryDataForMemexGroupsPage(
      queryClient,
      variables,
      pageParamForNextPlaceholder,
    )
    const groupedItems = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      groupedItemsPageType,
      pageParamForNextPlaceholder,
    )
    const secondaryGroupsPlaceholderQueryData = getQueryDataForMemexSecondaryGroupsPage(
      queryClient,
      variables,
      pageParamForNextPlaceholder,
    )
    expect(groupsPlaceholderQueryData?.groups).toMatchObject(groups)
    expect(secondaryGroupsPlaceholderQueryData?.groups).toMatchObject(secondaryGroups)
    expect(groupedItems?.nodes).toMatchObject([item])
  })
})
