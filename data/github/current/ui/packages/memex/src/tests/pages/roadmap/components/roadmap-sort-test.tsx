import '../../../mocks/platform/utils'

import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {ItemType} from '../../../../client/api/memex-items/item-type'
import type {SortDirection} from '../../../../client/api/view/contracts'
import {dateStringFromISODate} from '../../../../client/helpers/date-string-from-iso-string'
import {mockGetBoundingClientRect} from '../../../components/board/board-test-helper'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../../mocks/hooks/use-repositories'
import {setupRoadmapView} from '../../../test-app-wrapper'

// Forgo debounced update to query parameters when typing in the filter bar, which currently falls outside of the focus
// for this test. Using jest.useFakeTimers and jest.advanceTimersByTime does not work well when rendered inside of the AppContext,
// which involves many timer interactions.
jest.mock('lodash-es/debounce', () =>
  jest.fn(fn => {
    fn.cancel = jest.fn()
    fn.flush = jest.fn()
    return fn
  }),
)

jest.mock('../../../../client/state-providers/columns/use-has-column-data')

jest.mock('../../../../client/components/react_table/hooks/use-is-omnibar-fixed', () => ({
  useIsOmnibarFixed: jest.fn(() => false),
}))

describe('Roadmap Sorting', () => {
  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    mockGetBoundingClientRect({left: 100})
  })

  function findFilterInput() {
    return screen.findByTestId('filter-bar-input')
  }

  async function filterItems(query: string) {
    await userEvent.type(await findFilterInput(), query)
  }

  async function expectToHaveRows(expectedRows: number) {
    await waitFor(() =>
      expect(
        screen.getAllByRole('row').filter(item => item.getAttribute('data-testid')?.startsWith('TableRow')),
      ).toHaveLength(expectedRows),
    )
  }

  type Column = 'Title' | 'Status' | 'Date'
  const buildRoadmap = (sortBy?: Column, direction?: SortDirection, groupBy?: Column) => {
    const today = dateStringFromISODate(new Date().toISOString())
    const title = systemColumnFactory.title().build()
    const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done']}).build()
    const date = customColumnFactory.date().build({name: 'Date'})

    const columnIds = {
      Title: title.databaseId,
      Status: status.databaseId,
      Date: date.databaseId,
    }
    const columns = [title, status, date]
    const sortByOptions: [[columnDatabaseId: number, direction: SortDirection]?] = []
    if (sortBy && direction) {
      sortByOptions.push([columnIds[sortBy], direction])
    }

    const view = viewFactory.roadmap().withDefaultColumnsAsVisibleFields(columns)
    const views = [
      view.build({
        name: 'All issues',
        sortBy: sortByOptions,
        groupBy: groupBy && columnIds[groupBy] ? [columnIds[groupBy]] : [],
      }),
    ]

    const {Roadmap} = setupRoadmapView({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('2', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('4', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('1', ItemType.DraftIssue).build(),
            columnValueFactory.status('In Progress', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('A', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('3', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
      ],
      columns,
      views,
    })
    return Roadmap
  }

  const getTitleColumn = (index: number) => screen.getByTestId(`TableCell{row: ${index}, column: Title}`)

  it('should sort items in ascending order', async () => {
    const Roadmap = buildRoadmap('Title', 'asc')
    render(<Roadmap />)

    await expectToHaveRows(5)

    expect(getTitleColumn(0)).toHaveTextContent('1')
    expect(getTitleColumn(1)).toHaveTextContent('2')
    expect(getTitleColumn(2)).toHaveTextContent('3')
    expect(getTitleColumn(3)).toHaveTextContent('4')
    expect(getTitleColumn(4)).toHaveTextContent('A')
  })

  it('should sort items in descending order', async () => {
    const Roadmap = buildRoadmap('Title', 'desc')
    render(<Roadmap />)

    await expectToHaveRows(5)

    expect(getTitleColumn(0)).toHaveTextContent('A')
    expect(getTitleColumn(1)).toHaveTextContent('4')
    expect(getTitleColumn(2)).toHaveTextContent('3')
    expect(getTitleColumn(3)).toHaveTextContent('2')
    expect(getTitleColumn(4)).toHaveTextContent('1')
  })

  it('should sort grouped items in ascending order', async () => {
    const Roadmap = buildRoadmap('Title', 'asc', 'Status')
    render(<Roadmap />)

    await filterItems('status:Done')
    await expectToHaveRows(3)

    expect(getTitleColumn(0)).toHaveTextContent('3')
    expect(getTitleColumn(1)).toHaveTextContent('4')
    expect(getTitleColumn(2)).toHaveTextContent('A')
  })

  it('should sort grouped items in descending order', async () => {
    const Roadmap = buildRoadmap('Title', 'desc', 'Status')
    render(<Roadmap />)

    await filterItems('status:Done')
    await expectToHaveRows(3)

    expect(getTitleColumn(0)).toHaveTextContent('A')
    expect(getTitleColumn(1)).toHaveTextContent('4')
    expect(getTitleColumn(2)).toHaveTextContent('3')
  })

  it('should sort grouped sets in ranked order when group and sort columns are the same and ascending', async () => {
    const Roadmap = buildRoadmap('Status', 'asc', 'Status')
    render(<Roadmap />)

    const groupNames = screen.getAllByTestId('group-name')

    expect(groupNames[0]).toHaveTextContent('Todo')
    expect(groupNames[1]).toHaveTextContent('In Progress')
    expect(groupNames[2]).toHaveTextContent('Done')

    await filterItems('status:Done')
    await expectToHaveRows(3)

    expect(getTitleColumn(0)).toHaveTextContent('4')
    expect(getTitleColumn(1)).toHaveTextContent('A')
    expect(getTitleColumn(2)).toHaveTextContent('3')
  })

  it('should sort grouped sets in reverse order when group and sort columns are the same and descending', async () => {
    const Roadmap = buildRoadmap('Status', 'desc', 'Status')
    render(<Roadmap />)

    const groupNames = screen.getAllByTestId('group-name')

    expect(groupNames[0]).toHaveTextContent('Done')
    expect(groupNames[1]).toHaveTextContent('In Progress')
    expect(groupNames[2]).toHaveTextContent('Todo')

    await filterItems('status:Done')
    await expectToHaveRows(3)

    expect(getTitleColumn(0)).toHaveTextContent('4')
    expect(getTitleColumn(1)).toHaveTextContent('A')
    expect(getTitleColumn(2)).toHaveTextContent('3')
  })

  describe('Sort by menu', () => {
    function findSortByMenu() {
      return screen.findByTestId('sort-by-menu')
    }

    function findRoadmapSortByMenuButton() {
      return screen.findByTestId('quick-action-toolbar-sort-by-menu')
    }

    async function findSortOption(label: string) {
      return within(await findSortByMenu()).findByRole('menuitemradio', {name: label})
    }

    it('changes the sort label correctly', async () => {
      const Roadmap = buildRoadmap()
      render(<Roadmap />)

      const sortByMenuButton = await findRoadmapSortByMenuButton()
      expect(sortByMenuButton).toHaveTextContent('Sort')
      expect(sortByMenuButton).toHaveAccessibleName('No sort applied')

      // Sort by the title in ascending order
      await userEvent.click(sortByMenuButton)
      await userEvent.click(await findSortOption('Title'))
      expect(sortByMenuButton).toHaveTextContent('Title')
      expect(sortByMenuButton).toHaveAccessibleName('Sorted by: Title ascending')

      // Sort by the title in descending order
      await userEvent.click(await findSortOption('Title (sort: ascending)'))
      expect(sortByMenuButton).toHaveTextContent('Title')
      expect(sortByMenuButton).toHaveAccessibleName('Sorted by: Title descending')

      // Sort by the title in descending order
      await userEvent.click(await findSortOption('No sorting'))
      expect(sortByMenuButton).toHaveTextContent('Sort')
      expect(sortByMenuButton).toHaveAccessibleName('No sort applied')
    })

    it('should have no sort selected by default', async () => {
      const Roadmap = buildRoadmap()
      render(<Roadmap />)

      const sortByMenuButton = await findRoadmapSortByMenuButton()
      expect(sortByMenuButton).toHaveAccessibleName('No sort applied')
      expect(sortByMenuButton).toHaveTextContent('Sort')
    })
  })
})
