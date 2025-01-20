import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {forwardRef} from 'react'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import type {EnabledFeatures} from '../../../client/api/enabled-features/contracts'
import type {DraftIssue} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {
  GetPaginatedItemsResponse,
  PaginatedGroupsAndSecondaryGroupsData,
} from '../../../client/api/memex-items/paginated-views'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import type {GetRequestType} from '../../../mocks/msw-responders'
import {get_getPaginatedItems} from '../../../mocks/msw-responders/memex-items'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {stubGetPaginatedItems} from '../../mocks/api/memex-items'
import {asMockHook} from '../../mocks/stub-utilities'
import {mswServer} from '../../msw-server'
import {
  buildGroupedItemsResponse,
  buildGroupedItemsResponseWithSecondaryGroups,
} from '../../state-providers/memex-items/query-client-api/helpers'
import {setupBoardView} from '../../test-app-wrapper'
import {buildCardsWithStatusValues} from './board-test-helper'

/**
 * Without mocking this hook we will issue an additional server call because the
 * data that we have for our items does not line up with the columns that are defined for the
 * test. This additional server call is async and will respond _after_ the test has completed,
 * causing noise in the test console when we try to `setState` outside of an `act` block.
 *
 * We could try to always make sure that our column values line up with our columns, to prevent
 * this call; however, since this behavior isn't really what we're focused on testing in
 * this test suite, we instead just mock out the hook entirely.
 */
jest.mock('../../../client/state-providers/columns/use-has-column-data')

/**
 * Without mocking this hook we will asynchronously make a call to fetch repositories after
 * rendering the omnibar. This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../client/state-providers/repositories/use-repositories')

/**
 * We don't really care about the filter suggestions that are shown when we focus the
 * filter input during these tests, so we'll just stub out the component. Without these,
 * we run into jest warnings for setting state outside after the test has been torn down.
 */
jest.mock('../../../client/components/filter-bar/filter-suggestions', () => ({
  ...jest.requireActual('../../../client/components/filter-bar/filter-suggestions'),
  FilterSuggestions: forwardRef(function MockFilterSuggestions() {
    return <></>
  }),
}))

jest.mock('../../../client/components/board/hooks/use-is-visible', () => ({
  ...jest.requireActual('../../../client/components/board/hooks/use-is-visible'),
  __esModule: true,
  default: () => ({
    isVisible: true,
  }),
}))

function mockResponseWithNoNextPage() {
  const {items} = buildCardsWithStatusValues({Todo: 2}, ItemType.Issue)
  return stubGetPaginatedItems({
    nodes: items,
    pageInfo: {
      startCursor: 'fake-start',
      endCursor: 'fake-end',
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: {
      value: items.length,
      isApproximate: false,
    },
  })
}

function groupForStatus(status: string, columns: Array<MemexColumn>) {
  const metadata = columns.find(c => c.name === 'Status')?.settings?.options?.find(o => o.name === status)
  return {
    groupId: `${status}Id`,
    groupValue: status,
    groupMetadata: metadata,
  }
}

function groupForAssignee(assignee_login: string) {
  return {
    groupId: `${assignee_login}Id`,
    groupValue: assignee_login,
    groupMetadata: {
      login: assignee_login,
      name: `${assignee_login} Name`,
      avatarUrl: '',
      id: 1,
      global_relay_id: '1',
      isSpammy: false,
    },
  }
}

function mockGroupedResponseWithNoNextPage(columns: Array<MemexColumn>) {
  const {items} = buildCardsWithStatusValues({Todo: 1, Done: 1}, ItemType.Issue)

  return stubGetPaginatedItems(
    buildGroupedItemsResponse({
      groups: [
        {
          ...groupForStatus('Todo', columns),
          items: [items[0]],
        },
        {
          ...groupForStatus('Done', columns),
          items: [items[1]],
        },
      ],
    }),
  )
}

describe(`board view infinite scroll`, () => {
  function setupVerticalGroupedBoardView(enablePagination = true, hasNextPage = false, hasNextPageOfGroups = false) {
    const {columns, items} = buildCardsWithStatusValues({Todo: 5})
    const {Board} = setupBoardView({columns, items})

    if (enablePagination) {
      const enabledFeatures: Array<EnabledFeatures> = ['memex_table_without_limits']
      seedJSONIsland('memex-enabled-features', enabledFeatures)
    }

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {
            ...groupForStatus('Todo', columns),
            items: items.slice(0, 5),
            pageInfoForItemsInGroup: {hasNextPage, hasPreviousPage: false, endCursor: '4'},
            totalCountOfItemsInGroup: {
              value: 8,
              isApproximate: false,
            },
          },
        ],
        pageInfoForGroups: {hasNextPage: hasNextPageOfGroups, hasPreviousPage: false},
      }),
    )
    return {Board, columns}
  }

  function renderBoard(enablePagination = true, hasNextPage = false, hasNextPageOfGroups = false) {
    const {Board, columns} = setupVerticalGroupedBoardView(enablePagination, hasNextPage, hasNextPageOfGroups)
    return {renderResult: render(<Board />), columns}
  }

  beforeAll(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
  })

  it('is omitted if memex_table_without_limits is disabled', () => {
    renderBoard(false) // disable FF
    expect(screen.queryByTestId('board-pagination-vertical')).not.toBeInTheDocument()
  })

  it('for groups is rendered, but without placeholder cards if no more items are available on the server', () => {
    renderBoard(true, false) // no additional pages
    expect(screen.getByTestId('board-pagination-TodoId')).toBeInTheDocument()
    expect(screen.queryByTestId('placeholder-card')).not.toBeInTheDocument()
  })

  it('for groups is rendered and shows placeholder while requesting the next page of items', async () => {
    renderBoard(true, true) // has additional pages
    expect(screen.getAllByTestId('placeholder-card')).toHaveLength(1)
    await waitFor(() => {
      // once the request is made and resolved, we expect no more placeholder rows to be shown
      expect(screen.queryByTestId('placeholder-card')).not.toBeInTheDocument()
    })
  })

  it('for pages of groups is rendered and shows placeholder while requesting the next page of groups', () => {
    renderBoard(true, false, true) // has additional pages of groups, but not items
    expect(screen.getAllByTestId('board-pagination-TodoId')).toHaveLength(1)
    expect(screen.getAllByTestId('board-pagination-vertical')).toHaveLength(1)
    expect(screen.getAllByTestId('placeholder-card')).toHaveLength(1)
    expect(screen.getAllByTestId('placeholder-column-header')).toHaveLength(1)
    // should show the number of items reported by the API, not the number of items on the page
    const boardColumns = screen.getAllByTestId('board-view-column')
    const column = boardColumns.find(columnElement => columnElement.getAttribute('data-board-column') === 'Todo')!
    expect(within(column).getByTestId('column-items-counter')).toHaveTextContent('8')
  })

  it('returns grouped data when filter is changed while grouped', async () => {
    const {columns} = renderBoard(true, false) // has no additional pages
    expect(screen.getByTestId('board-pagination-TodoId')).toBeInTheDocument()
    expect(screen.queryByTestId('placeholder-card')).not.toBeInTheDocument()

    // 5 items
    expect(screen.getAllByTestId('board-view-column-card')).toHaveLength(5)

    // The paginated-items endpoint will return 2 groups with 1 item each
    const mockRequest = mockGroupedResponseWithNoNextPage(columns)

    // Focus the filter bar
    await userEvent.click(screen.getByPlaceholderText('Filter by keyword or by field'))

    // Click an item in the table, this will change the filter to `is:` which is enough
    // to trigger a new request, which is mainly what we're trying to capture in this test.
    await userEvent.click(
      screen.getByLabelText(`Is, Filter, Filter only "issues", "pulls", "open", "closed", or "draft"`),
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.getAllByTestId('board-view-column-card')).toHaveLength(2)
    })
  })
})

describe(`board with swimlanes`, () => {
  function setupBoardViewWithSwimlanes(
    enablePagination = true,
    hasCellNextPage = false,
    hasSecondaryNextPage = false,
    hasPrimaryNextPage = false,
  ) {
    const title = systemColumnFactory.title().build()
    const status = systemColumnFactory.status({optionNames: ['Todo', 'Done', 'In Progress', 'Next']}).build()
    const assignees = systemColumnFactory.assignees().build()
    const columns = [title, status, assignees]

    const items: Array<DraftIssue> = []
    for (let i = 0; i < 10; i++) {
      const memexProjectColumnValues = [
        columnValueFactory.title(`Cell ${items.length + 1}`, ItemType.DraftIssue).build(),
      ]

      items.push(
        draftIssueFactory.build({
          memexProjectColumnValues,
        }),
      )
    }

    const views = [
      viewFactory
        .board()
        .withDefaultColumnsAsVisibleFields(columns)
        .build({
          verticalGroupBy: [status.databaseId],
          groupBy: [assignees.databaseId],
        }),
    ]
    const {Board} = setupBoardView({columns, items, views})

    if (enablePagination) {
      const enabledFeatures: Array<EnabledFeatures> = [
        'memex_table_without_limits',
        'memex_mwl_swimlanes',
        'memex_mwl_server_group_order',
      ]
      seedJSONIsland('memex-enabled-features', enabledFeatures)
    }

    const assignee1Group = groupForAssignee('assignee1')

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            ...groupForStatus('Todo', columns),
            nestedItems: [
              {
                secondaryGroupId: assignee1Group.groupId,
                items,
                pageInfo: {hasNextPage: hasCellNextPage, hasPreviousPage: false, endCursor: 'cursor1'},
              },
            ],
          },
        ],
        pageInfoForGroups: {hasNextPage: hasPrimaryNextPage, hasPreviousPage: false, endCursor: 'verticalCursor1'},
        secondaryGroups: [assignee1Group],
        pageInfoForSecondaryGroups: {
          hasNextPage: hasSecondaryNextPage,
          hasPreviousPage: false,
          endCursor: 'horizontalCursor1',
        },
      }),
    )
    return {Board, columns}
  }

  function renderBoard(
    enablePagination = true,
    hasCellNextPage = false,
    hasSecondaryNextPage = false,
    hasPrimaryNextPage = false,
  ) {
    const {Board, columns} = setupBoardViewWithSwimlanes(
      enablePagination,
      hasCellNextPage,
      hasSecondaryNextPage,
      hasPrimaryNextPage,
    )
    return {renderResult: render(<Board />), columns, Board}
  }

  beforeAll(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
  })

  describe('infinite scroll horizontal groups', () => {
    it('is omitted if memex_table_without_limits is disabled', () => {
      renderBoard(false) // disable FF
      expect(screen.queryByTestId('board-pagination-horizontal')).not.toBeInTheDocument()
    })

    it('is rendered for horizontal groups without placeholder if no additional data on the server', () => {
      renderBoard(true, false, false) // no additional pages
      expect(screen.getByTestId('board-pagination-horizontal')).toBeInTheDocument()
      expect(screen.queryByTestId('placeholder-horizontal-group-header')).not.toBeInTheDocument()
    })

    it('is rendered for horizontal groups with placeholder while requesting the next page of secondary groups', async () => {
      renderBoard(true, true, true) // has additional pages
      expect(screen.getByTestId('board-pagination-horizontal')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder-horizontal-group-header')).toBeInTheDocument()
      await waitFor(() => {
        // once the request is made and resolved, we expect no more placeholder to be shown
        expect(screen.queryByTestId('placeholder-horizontal-group-header')).not.toBeInTheDocument()
      })
    })
  })

  describe('infinite loading on click for grouped items cell', () => {
    it('is omitted if memex_table_without_limits is disabled', () => {
      renderBoard(false) // disable FF
      expect(screen.queryByTestId('board-pagination-TodoId-assignee1Id')).not.toBeInTheDocument()
    })

    it('does not render a button to load more pages if no additional data on the server', () => {
      renderBoard(true, false) // no additional pages
      expect(screen.getByTestId('board-pagination-TodoId-assignee1Id')).toBeInTheDocument()
      expect(screen.queryByText('Load more items')).not.toBeInTheDocument()
    })

    it('renders a button to load more pages if additional data on the server', () => {
      renderBoard(true, true) // has additional pages
      expect(screen.getByTestId('board-pagination-TodoId-assignee1Id')).toBeInTheDocument()
      expect(screen.getByText('Load more items')).toBeInTheDocument()
    })

    it('fetches next page when the load more items button is clicked', async () => {
      renderBoard(true, true) // has additional pages

      // Initially 10 items
      expect(screen.getAllByTestId('board-view-column-card')).toHaveLength(10)

      const mockRequest = mockResponseWithNoNextPage()
      expect(screen.getByTestId('board-pagination-TodoId-assignee1Id')).toBeInTheDocument()
      await userEvent.click(screen.getByText('Load more items'))

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      // once the request is made and resolved, we expect no more placeholder cards to be shown
      expect(screen.queryByTestId('placeholder-card')).not.toBeInTheDocument()
      expect(screen.queryByText('Load more items')).not.toBeInTheDocument()
      // 2 more cards after fetching more for cell
      expect(screen.getAllByTestId('board-view-column-card')).toHaveLength(12)
    })
  })

  describe('infinite scroll grouped items cell batches', () => {
    it('is omitted if memex_table_without_limits is disabled', () => {
      renderBoard(false) // disable FF
      expect(screen.queryByTestId('board-pagination-DoneId-assignee2Id')).not.toBeInTheDocument()
    })

    it('shows placeholder while loading batch of grouped items from the server', async () => {
      const {columns, Board} = renderBoard(true, true, true, true) // has additional primary and secondary groups pages
      const doneGroup = groupForStatus('Done', columns)
      const assignee2Group = groupForAssignee('assignee2')
      const mockPrimaryNextPage = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [{...doneGroup, nestedItems: []}],
        secondaryGroups: [groupForAssignee('assignee1')],
        pageInfoForGroups: {hasNextPage: false, hasPreviousPage: true, endCursor: 'verticalCursor2'},
        pageInfoForSecondaryGroups: {hasNextPage: true, hasPreviousPage: false, endCursor: 'horizontalCursor1'},
      })
      const mockSecondaryNextPage = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [{...groupForStatus('Todo', columns), nestedItems: []}],
        secondaryGroups: [assignee2Group],
        pageInfoForGroups: {hasNextPage: true, hasPreviousPage: false, endCursor: 'verticalCursor1'},
        pageInfoForSecondaryGroups: {hasNextPage: false, hasPreviousPage: true, endCursor: 'horizontalCursor2'},
      })
      const mockForDoneAssignee2Batch = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [{...doneGroup, nestedItems: []}],
        secondaryGroups: [assignee2Group],
        pageInfoForGroups: {hasNextPage: false, hasPreviousPage: true, endCursor: 'verticalCursor2'},
        pageInfoForSecondaryGroups: {hasNextPage: false, hasPreviousPage: true, endCursor: 'horizontalCursor2'},
      })

      const mockRequest = jest.fn<GetPaginatedItemsResponse, [GetRequestType]>()
      const responses: Record<string, GetPaginatedItemsResponse> = {
        'verticalCursor1;': mockPrimaryNextPage,
        ';horizontalCursor1': mockSecondaryNextPage,
        'verticalCursor1;horizontalCursor1': mockForDoneAssignee2Batch,
      }
      const responseKeys: Array<string> = []
      const handler = get_getPaginatedItems((body, req) => {
        mockRequest(body)
        const after = new URL(req.url).searchParams.get('after') || undefined
        const secondaryAfter = new URL(req.url).searchParams.get('secondaryAfter') || undefined
        const responseKey = `${after ?? ''};${secondaryAfter ?? ''}`
        responseKeys.push(responseKey)
        const response = responses[responseKey] as PaginatedGroupsAndSecondaryGroupsData
        return Promise.resolve(response)
      })
      mswServer.use(handler)

      render(<Board />)

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(2)
      })

      // Batched groupedItems pagination is only supported within the refactor
      expect(screen.getByTestId('board-pagination-DoneId-assignee2Id')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder-card')).toBeInTheDocument()

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(3)
      })
      expect(responseKeys[2]).toEqual('verticalCursor1;horizontalCursor1')
    })
  })
})

describe(`board with server-side group order`, () => {
  function setupVerticalGroupedBoardView(enableServerSort = true, hasNextPage = false, hasNextPageOfGroups = false) {
    const {columns, items} = buildCardsWithStatusValues({Todo: 5, Done: 5})
    const {Board} = setupBoardView({columns, items})

    const enabledFeatures: Array<EnabledFeatures> = ['memex_table_without_limits']
    if (enableServerSort) {
      enabledFeatures.push('memex_mwl_server_group_order')
    }
    seedJSONIsland('memex-enabled-features', enabledFeatures)

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {
            ...groupForStatus('Done', columns),
            items: items.slice(0, 5),
            pageInfoForItemsInGroup: {hasNextPage, hasPreviousPage: false, endCursor: '4'},
            totalCountOfItemsInGroup: {
              value: 8,
              isApproximate: false,
            },
          },
          {
            ...groupForStatus('Todo', columns),
            items: items.slice(5, 10),
            pageInfoForItemsInGroup: {hasNextPage, hasPreviousPage: false, endCursor: '9'},
            totalCountOfItemsInGroup: {
              value: 8,
              isApproximate: false,
            },
          },
        ],
        pageInfoForGroups: {hasNextPage: hasNextPageOfGroups, hasPreviousPage: false},
      }),
    )
    return {Board, columns}
  }

  function renderBoard(enablePagination = true, hasNextPage = false, hasNextPageOfGroups = false) {
    const {Board, columns} = setupVerticalGroupedBoardView(enablePagination, hasNextPage, hasNextPageOfGroups)
    return {renderResult: render(<Board />), columns}
  }

  beforeAll(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
  })

  it('uses client-side sort if memex_mwl_server_group_order is disabled', () => {
    renderBoard(false) // disable FF
    const boardColumns = screen.getAllByTestId('board-view-column')
    expect(boardColumns.length).toBe(3)
    expect(boardColumns.map(c => c.getAttribute('data-board-column'))).toEqual(['No Status', 'Todo', 'Done'])
  })

  it('uses server-side sort if memex_mwl_server_group_order is enabled', () => {
    renderBoard() // enable FF
    const boardColumns = screen.getAllByTestId('board-view-column')
    expect(boardColumns.length).toBe(2)
    expect(boardColumns.map(c => c.getAttribute('data-board-column'))).toEqual(['Done', 'Todo'])
  })
})
