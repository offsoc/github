import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {forwardRef} from 'react'

import type {DraftIssue} from '../../../../client/api/memex-items/contracts'
import {ItemType} from '../../../../client/api/memex-items/item-type'
import {useHasColumnData} from '../../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../../client/state-providers/repositories/use-repositories'
import {useFetchSuggestedAssignees} from '../../../../client/state-providers/suggestions/use-fetch-suggested-assignees'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {buildRows} from '../../../components/react-table/table-test-helper'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {systemColumnFactory} from '../../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {stubGetPaginatedItems} from '../../../mocks/api/memex-items'
import {asMockHook} from '../../../mocks/stub-utilities'
import {buildGroupedItemsResponse} from '../../../state-providers/memex-items/query-client-api/helpers'
import {setupRoadmapView} from '../../../test-app-wrapper'

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
jest.mock('../../../../client/state-providers/columns/use-has-column-data')

/**
 * Without mocking this hook we will asynchronously make a call to fetch repositories and assignees after
 * rendering the omnibar. This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../../client/state-providers/repositories/use-repositories')
jest.mock('../../../../client/state-providers/suggestions/use-fetch-suggested-assignees')

/**
 * We don't really care about the filter suggestions that are shown when we focus the
 * filter input during these tests, so we'll just stub out the component. Without these,
 * we run into jest warnings for setting state outside after the test has been torn down.
 */
jest.mock('../../../../client/components/filter-bar/filter-suggestions', () => ({
  ...jest.requireActual('../../../../client/components/filter-bar/filter-suggestions'),
  FilterSuggestions: forwardRef(function MockFilterSuggestions() {
    return <></>
  }),
}))

jest.mock('../../../../client/components/board/hooks/use-is-visible', () => ({
  ...jest.requireActual('../../../../client/components/board/hooks/use-is-visible'),
  __esModule: true,
  default: () => ({
    isVisible: true,
  }),
}))

function mockResponseWithNoNextPage() {
  const items = buildRows(2)
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

function mockGroupedResponseWithNoNextPage() {
  const items = buildRows(2)
  return stubGetPaginatedItems(
    buildGroupedItemsResponse({
      groups: [
        {
          groupId: 'group1',
          groupValue: 'In Progress',
          items: [items[0]],
        },
        {
          groupId: 'group2',
          groupValue: 'Next',
          items: [items[1]],
        },
      ],
    }),
  )
}

describe(`roadmap view infinite scroll`, () => {
  function setupGroupedRoadmapView(enablePagination = true, hasNextPage = false) {
    const title = systemColumnFactory.title().build()
    const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Next', 'Done']}).build()
    const columns = [title, status]

    const items: Array<DraftIssue> = []
    for (let i = 0; i < 10; i++) {
      const memexProjectColumnValues = [
        columnValueFactory.title(`Cell ${items.length + 3}`, ItemType.DraftIssue).build(),
      ]

      items.push(
        draftIssueFactory.build({
          memexProjectColumnValues,
        }),
      )
    }

    const views = [
      viewFactory
        .roadmap()
        .withDefaultColumnsAsVisibleFields(columns)
        .build({
          groupBy: [status.databaseId],
        }),
    ]
    const {Roadmap} = setupRoadmapView({columns, items, views})

    if (enablePagination) {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
    }
    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {
            groupId: '_noValue',
            groupValue: '_noValue',
            items: items.slice(0, 5),
            pageInfoForItemsInGroup: {hasNextPage, hasPreviousPage: false, endCursor: '4'},
            totalCountOfItemsInGroup: {
              value: 8,
              isApproximate: false,
            },
          },
        ],
      }),
    )
    return Roadmap
  }

  function renderGroupedRoadmap(enablePagination = true, hasNextPage = false) {
    const Roadmap = setupGroupedRoadmapView(enablePagination, hasNextPage)
    return render(<Roadmap />)
  }

  function setupRoadmapViewWithRows(enablePagination = true, hasNextPage = true) {
    const items = buildRows(10)
    const {Roadmap} = setupRoadmapView({items})
    if (enablePagination) {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
    }
    seedJSONIsland('memex-paginated-items-data', {
      nodes: items.slice(0, 5),
      pageInfo: {hasNextPage, hasPreviousPage: false, endCursor: '4'},
      totalCount: {value: 8, isApproximate: false},
    })
    return Roadmap
  }

  function renderRoadmapWithRows(enablePagination = true, hasNextPage = true) {
    const Roadmap = setupRoadmapViewWithRows(enablePagination, hasNextPage)
    return render(<Roadmap />)
  }

  beforeAll(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
    asMockHook(useFetchSuggestedAssignees).mockReturnValue({fetchSuggestedAssignees: jest.fn()})
  })

  it('is omitted if memex_table_without_limits is disabled', () => {
    renderRoadmapWithRows(false) // disable FF
    expect(screen.queryByTestId('roadmap-pagination')).not.toBeInTheDocument()
  })

  it('is rendered, but without placeholder rows if no more items are available on the server', () => {
    renderRoadmapWithRows(true, false) // hasNextPage is false
    expect(screen.getByTestId('roadmap-pagination')).toBeInTheDocument()
    expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument()
  })

  it('is rendered and shows placeholder while requesting the next page of items', async () => {
    const Roadmap = setupRoadmapViewWithRows()
    const mockRequest = mockResponseWithNoNextPage()
    render(<Roadmap />)
    expect(screen.getAllByTestId('placeholder-row')).toHaveLength(5)
    await waitFor(() => {
      // once the request is made and resolved, we expect no more placeholder rows to be shown
      expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument()
    })
    expect(mockRequest).toHaveBeenCalledTimes(1)
  })

  it('requests new data if the filter value changes', async () => {
    renderRoadmapWithRows(true, false) // hasNextPage is false

    expect(screen.getByTestId('roadmap-pagination')).toBeInTheDocument()
    expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument()
    // 5 items + the header rows
    expect(screen.getAllByRole('row')).toHaveLength(5 + 3)

    // The paginated-items endpoint will return 2 items
    const mockRequest = mockResponseWithNoNextPage()

    // Focus the filter bar
    await userEvent.click(screen.getByPlaceholderText('Filter by keyword or by field'))

    // delay:null eliminates any time that is added between keystrokes
    // without this, multiple requests are made, each with a different q value in the URL params
    await userEvent.keyboard('Status:Todo', {delay: null})

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      // 2 items + the header rows
      expect(screen.getAllByRole('row')).toHaveLength(2 + 3)
    })
  })

  it('for groups is rendered, but without placeholder rows if no more items are available on the server', () => {
    renderGroupedRoadmap(true, false) // hasNextPageForGroupedItems is false
    expect(screen.getByTestId('roadmap-pagination-_noValue')).toBeInTheDocument()
    expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument()
  })

  it('for groups is rendered and shows placeholder while requesting the next page of items', async () => {
    renderGroupedRoadmap(true, true) // hasNextPageForGroupedItems is true
    expect(screen.getAllByTestId('placeholder-row')).toHaveLength(5)
    expect(within(screen.getByTestId('group-header-No Status')).getByTestId('column-items-counter')).toHaveTextContent(
      '8',
    )
    await waitFor(() => {
      // once the request is made and resolved, we expect no more placeholder rows to be shown
      expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument()
    })
  })

  it('returns grouped data when filter is changed while grouped', async () => {
    renderGroupedRoadmap(true, false) // hasNextPageForGroupedItems is false
    expect(screen.getByTestId('roadmap-pagination-_noValue')).toBeInTheDocument()
    expect(screen.queryByTestId('placeholder-row')).not.toBeInTheDocument()

    // 5 items + the header rows + the group header row
    expect(screen.getAllByRole('row')).toHaveLength(5 + 3 + 1)

    // The paginated-items endpoint will return 2 groups with 1 item each
    const mockRequest = mockGroupedResponseWithNoNextPage()

    // Focus the filter bar
    await userEvent.click(screen.getByPlaceholderText('Filter by keyword or by field'))

    // delay:null eliminates any time that is added between keystrokes
    // without this, multiple requests are made, each with a different q value in the URL params
    await userEvent.keyboard('Status:Todo', {delay: null})

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      // 2 items + the header rows + the group header row + "Add item" omnibar row
      expect(screen.getAllByRole('row')).toHaveLength(2 + 3 + 1 + 1)
    })
  })
})
