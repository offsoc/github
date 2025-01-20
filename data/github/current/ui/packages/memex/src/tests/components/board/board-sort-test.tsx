import '../../mocks/platform/utils'

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {addDays} from 'date-fns'

import {ItemType} from '../../../client/api/memex-items/item-type'
import type {SortDirection} from '../../../client/api/view/contracts'
import {dateStringFromISODate} from '../../../client/helpers/date-string-from-iso-string'
import {getCard, mockGetBoundingClientRect} from '../../components/board/board-test-helper'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../mocks/hooks/use-repositories'
import {setupBoardView} from '../../test-app-wrapper'

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

jest.mock('../../../client/state-providers/columns/use-has-column-data')

describe('Board Sorting', () => {
  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    mockGetBoundingClientRect()
  })

  function findFilterInput() {
    return screen.findByTestId('filter-bar-input')
  }

  async function filterItems(query: string) {
    await userEvent.type(await findFilterInput(), query)
  }

  type Column = 'Title' | 'Status' | 'Date'
  const buildBoard = (sortBy: Array<{column: Column; direction: SortDirection}>, groupBy?: Column) => {
    const today = dateStringFromISODate(new Date().toISOString())
    const tomorrow = dateStringFromISODate(addDays(new Date(), 1).toISOString())
    const title = systemColumnFactory.title().build()
    const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done', 'Backlog']}).build()
    const date = customColumnFactory.date().build({name: 'Date'})

    const columnIds = {
      Title: title.databaseId,
      Status: status.databaseId,
      Date: date.databaseId,
    }
    const columns = [title, status, date]

    const view = viewFactory.board()
    const views = [
      view.build({
        name: 'All issues',
        sortBy: sortBy.map(({column, direction}) => [columnIds[column], direction]),
        verticalGroupBy: groupBy && columnIds[groupBy] ? [columnIds[groupBy]] : [],
      }),
    ]

    const {Board} = setupBoardView({
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
            columnValueFactory.title('4 Card', ItemType.DraftIssue).build(),
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
            columnValueFactory.title('3 Card', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('X', ItemType.DraftIssue).build(),
            columnValueFactory.status('Backlog', columns).build(),
            columnValueFactory.date(tomorrow, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Y', ItemType.DraftIssue).build(),
            columnValueFactory.status('Backlog', columns).build(),
            columnValueFactory.date(tomorrow, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Z', ItemType.DraftIssue).build(),
            columnValueFactory.status('Backlog', columns).build(),
            columnValueFactory.date(tomorrow, 'Date', columns).build(),
          ],
        }),
      ],
      columns,
      views,
    })
    return Board
  }

  it('should sort items in ascending order', async () => {
    const Board = buildBoard([{column: 'Title', direction: 'asc'}])
    render(<Board />)

    expect(await getCard('Done', 0)).toHaveTextContent('3')
    expect(await getCard('Done', 1)).toHaveTextContent('4')
    expect(await getCard('Done', 2)).toHaveTextContent('A')
  })

  it('should sort items in descending order', async () => {
    const Board = buildBoard([{column: 'Title', direction: 'desc'}])
    render(<Board />)

    expect(await getCard('Done', 0)).toHaveTextContent('A')
    expect(await getCard('Done', 1)).toHaveTextContent('4')
    expect(await getCard('Done', 2)).toHaveTextContent('3')
  })

  it('should sort filtered items in ascending order', async () => {
    const Board = buildBoard([{column: 'Title', direction: 'asc'}], 'Status')
    render(<Board />)

    await filterItems('Card')

    expect(await getCard('Done', 0)).toHaveTextContent('3')
    expect(await getCard('Done', 1)).toHaveTextContent('4')
  })

  it('should sort filtered items in descending order', async () => {
    const Board = buildBoard([{column: 'Title', direction: 'desc'}], 'Status')
    render(<Board />)

    await filterItems('Card')

    expect(await getCard('Done', 0)).toHaveTextContent('4')
    expect(await getCard('Done', 1)).toHaveTextContent('3')
  })

  it('should sort grouped sets in asc ranked order when group and sort columns are the same and ascending', async () => {
    const Board = buildBoard([{column: 'Status', direction: 'asc'}], 'Status')
    render(<Board />)

    expect(await getCard('Done', 0)).toHaveTextContent('4')
    expect(await getCard('Done', 1)).toHaveTextContent('A')
    expect(await getCard('Done', 2)).toHaveTextContent('3')
  })

  it('should sort grouped sets in asc ranked order when group and sort columns are the same and descending', async () => {
    const Board = buildBoard([{column: 'Status', direction: 'desc'}], 'Status')
    render(<Board />)
    expect(await getCard('Done', 0)).toHaveTextContent('4')
    expect(await getCard('Done', 1)).toHaveTextContent('A')
    expect(await getCard('Done', 2)).toHaveTextContent('3')
  })

  it('should sort items by secondary sort when they have the same primary sort value', async () => {
    const Board = buildBoard([
      {column: 'Date', direction: 'asc'},
      {column: 'Title', direction: 'asc'},
    ])
    render(<Board />)

    expect(await getCard('Backlog', 0)).toHaveTextContent('X')
    expect(await getCard('Backlog', 1)).toHaveTextContent('Y')
    expect(await getCard('Backlog', 2)).toHaveTextContent('Z')
  })

  it('should sort items descending by secondary sort when they have the same primary sort value', async () => {
    const Board = buildBoard([
      {column: 'Date', direction: 'asc'},
      {column: 'Title', direction: 'desc'},
    ])
    render(<Board />)

    expect(await getCard('Backlog', 0)).toHaveTextContent('Z')
    expect(await getCard('Backlog', 1)).toHaveTextContent('Y')
    expect(await getCard('Backlog', 2)).toHaveTextContent('X')
  })
})
