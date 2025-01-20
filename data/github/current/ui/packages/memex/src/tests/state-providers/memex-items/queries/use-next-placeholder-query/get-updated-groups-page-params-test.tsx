import {
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
} from '../../../../../client/state-providers/memex-items/queries/query-keys'
import {
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PaginatedMemexItemsQueryVariables,
} from '../../../../../client/state-providers/memex-items/queries/types'
import {getUpdatedGroupsPageParams} from '../../../../../client/state-providers/memex-items/queries/use-next-placeholder-query/get-updated-groups-page-params'
import {
  getQueryDataForMemexGroupsPage,
  getQueryDataForMemexSecondaryGroupsPage,
  setQueryDataForMemexGroupsPage,
  setQueryDataForMemexSecondaryGroupsPage,
} from '../../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {createTestQueryClient} from '../../../../test-app-wrapper'

const mockPageInfo = (hasNextPage = false) => ({
  hasNextPage,
  hasPreviousPage: false,
  startCursor: 'startCursor',
  endCursor: 'endCursor',
})

const buildGroup = (id: number) => ({groupId: `group${id}`, groupValue: `Group ${id}`})

const mockGroupsResponse = (hasNextPage = false) => ({
  nodes: [{...buildGroup(1), totalCount: {value: 5, isApproximate: false}}],
  pageInfo: mockPageInfo(hasNextPage),
})

const mockGroupsQueryData = (hasNextPage = false, groupsCount = 1) => {
  const groups = Array.from({length: groupsCount}).map((_, index) => buildGroup(index))
  return {groups, pageInfo: mockPageInfo(hasNextPage)}
}

describe('getUpdatedGroupsPageParams', () => {
  const queryClient = createTestQueryClient()
  const variables: PaginatedMemexItemsQueryVariables = {
    verticalGroupedByColumnId: 'Status',
    q: 'is:issue',
  }
  it('does nothing if next_placeholder param is not present', () => {
    const pageParams = [pageParamForInitialPage, {after: 'someCursor'}]
    const newPageParams = getUpdatedGroupsPageParams(
      queryClient,
      variables,
      pageParams,
      pageTypeForGroups,
      mockGroupsResponse(),
    )
    expect(newPageParams).toEqual(pageParams)
  })
  it('includes the next page param if placeholder data length exceeds received data length', () => {
    const placeholderGroups = mockGroupsQueryData(false, 2)
    setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder, placeholderGroups)
    const groupsDataWithNextPage = mockGroupsResponse(true)
    expect(placeholderGroups.groups.length).toBeGreaterThan(groupsDataWithNextPage.nodes.length)
    const newPageParams = getUpdatedGroupsPageParams(
      queryClient,
      variables,
      [pageParamForInitialPage, pageParamForNextPlaceholder],
      pageTypeForGroups,
      groupsDataWithNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage, {after: 'endCursor'}, pageParamForNextPlaceholder])
    const newPlaceholderQuery = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder)
    expect(newPlaceholderQuery?.groups).toMatchObject([placeholderGroups.groups[1]])
  })
  it('removes the next_placeholder page param and query if received data replaces all placeholder data', () => {
    const placeholderGroups = mockGroupsQueryData()
    setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder, placeholderGroups)
    const groupsDataWithNextPage = mockGroupsResponse(true)
    expect(placeholderGroups.groups.length).toEqual(groupsDataWithNextPage.nodes.length)
    const newPageParams = getUpdatedGroupsPageParams(
      queryClient,
      variables,
      [pageParamForNextPlaceholder],
      pageTypeForGroups,
      groupsDataWithNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage])
    const newPlaceholderQuery = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder)
    expect(newPlaceholderQuery).toBeUndefined()
  })
  it('removes the next_placeholder page param and query if there are no more pages on server', () => {
    const placeholderGroups = mockGroupsQueryData(false, 2)
    setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder, placeholderGroups)
    const groupsDataWithNextPage = mockGroupsResponse(false)
    expect(placeholderGroups.groups.length).toBeGreaterThan(groupsDataWithNextPage.nodes.length)
    const newPageParams = getUpdatedGroupsPageParams(
      queryClient,
      variables,
      [pageParamForInitialPage, pageParamForNextPlaceholder],
      pageTypeForGroups,
      groupsDataWithNextPage,
    )
    expect(newPageParams).toMatchObject([pageParamForInitialPage])
    const newPlaceholderQuery = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder)
    expect(newPlaceholderQuery).toBeUndefined()
  })
  describe('for secondary groups', () => {
    it('seeds an initial page param if none is present', () => {
      const swimlaneVariables = {...variables, horizontalByColumnId: 'Assignees'}
      const newPageParams = getUpdatedGroupsPageParams(
        queryClient,
        swimlaneVariables,
        undefined, // no current page params
        pageTypeForSecondaryGroups,
        mockGroupsResponse(),
      )
      expect(newPageParams).toMatchObject([pageParamForInitialPage])
    })
    it('resolves page params for secondaryGroups pageType', () => {
      const placeholderSecondaryGroups = mockGroupsQueryData(false, 2)
      setQueryDataForMemexSecondaryGroupsPage(
        queryClient,
        variables,
        pageParamForNextPlaceholder,
        placeholderSecondaryGroups,
      )
      const groupsDataWithNextPage = mockGroupsResponse(true)
      expect(placeholderSecondaryGroups.groups.length).toBeGreaterThan(groupsDataWithNextPage.nodes.length)
      const newPageParams = getUpdatedGroupsPageParams(
        queryClient,
        variables,
        [pageParamForInitialPage, pageParamForNextPlaceholder],
        pageTypeForSecondaryGroups,
        groupsDataWithNextPage,
      )
      expect(newPageParams).toMatchObject([pageParamForInitialPage, {after: 'endCursor'}, pageParamForNextPlaceholder])
      const newPlaceholderQuery = getQueryDataForMemexSecondaryGroupsPage(
        queryClient,
        variables,
        pageParamForNextPlaceholder,
      )
      expect(newPlaceholderQuery?.groups).toMatchObject([placeholderSecondaryGroups.groups[1]])
    })
  })
})
