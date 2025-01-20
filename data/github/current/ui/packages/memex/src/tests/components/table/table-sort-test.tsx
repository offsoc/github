import '../../mocks/platform/utils'

import {render, screen} from '@testing-library/react'

import {ItemType} from '../../../client/api/memex-items/item-type'
import type {SortDirection} from '../../../client/api/view/contracts'
import {dateStringFromISODate} from '../../../client/helpers/date-string-from-iso-string'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../mocks/hooks/use-repositories'
import {setupTableView} from '../../test-app-wrapper'

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

describe('Table Sorting', () => {
  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
  })

  type Column = 'Title' | 'Status' | 'Date'
  type TableProps = {
    sortBy: Array<{column: Column; direction: SortDirection}>
    groupBy?: Column
    filter?: string
  }

  const buildTable = (tableProps: TableProps) => {
    const {sortBy, groupBy, filter} = tableProps
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

    const view = viewFactory.table()
    const views = [
      view.build({
        name: 'All issues',
        sortBy: sortBy.map(({column, direction}) => [columnIds[column], direction]),
        groupBy: groupBy && columnIds[groupBy] ? [columnIds[groupBy]] : [],
        visibleFields: columns.map(column => column.databaseId),
        filter: filter ?? '',
      }),
    ]

    const items = [
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Row B', ItemType.DraftIssue).build(),
          columnValueFactory.status('Todo', columns).build(),
          columnValueFactory.date(today, 'Date', columns).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Row D', ItemType.DraftIssue).build(),
          columnValueFactory.status('Done', columns).build(),
          columnValueFactory.date(today, 'Date', columns).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Row A', ItemType.DraftIssue).build(),
          columnValueFactory.status('In Progress', columns).build(),
          columnValueFactory.date(today, 'Date', columns).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Row Beta', ItemType.DraftIssue).build(),
          columnValueFactory.status('Done', columns).build(),
          columnValueFactory.date(today, 'Date', columns).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Row C', ItemType.DraftIssue).build(),
          columnValueFactory.status('Done', columns).build(),
          columnValueFactory.date(today, 'Date', columns).build(),
        ],
      }),
    ]

    const {Table} = setupTableView({
      items,
      columns,
      views,
    })
    return Table
  }

  function expectRowOrderToBe(titleValues: Array<string>) {
    const rows = screen.getAllByRole('row')

    expect(rows).toHaveLength(titleValues.length + 1)

    for (let i = 0; i < titleValues.length; i++) {
      expect(rows[i + 1]).toHaveTextContent(titleValues[i])
    }
  }

  it('should sort items in ascending order', () => {
    const Table = buildTable({sortBy: [{column: 'Title', direction: 'asc'}]})
    render(<Table />)

    expectRowOrderToBe(['Row A', 'Row B', 'Row Beta', 'Row C', 'Row D'])
  })

  it('should sort items in descending order', () => {
    const Table = buildTable({sortBy: [{column: 'Title', direction: 'desc'}]})
    render(<Table />)

    expectRowOrderToBe(['Row D', 'Row C', 'Row Beta', 'Row B', 'Row A'])
  })

  it('should maintain ranking when sorting items with same status in ascending order', () => {
    const Table = buildTable({sortBy: [{column: 'Status', direction: 'asc'}]})
    render(<Table />)

    expectRowOrderToBe(['Row B', 'Row A', 'Row D', 'Row Beta', 'Row C'])
  })

  it('should maintain ranking when sorting items with same status in descending order', () => {
    const Table = buildTable({sortBy: [{column: 'Status', direction: 'desc'}]})
    render(<Table />)

    expectRowOrderToBe(['Row D', 'Row Beta', 'Row C', 'Row A', 'Row B'])
  })

  it('should maintain ranking when sorting items with same status and same group ascending', () => {
    const Table = buildTable({sortBy: [{column: 'Status', direction: 'asc'}], groupBy: 'Status', filter: 'status:Done'})
    render(<Table />)

    expectRowOrderToBe(['Row D', 'Row Beta', 'Row C'])
  })

  it('should maintain ranking when sorting items with same status and same group descending', () => {
    const Table = buildTable({sortBy: [{column: 'Status', direction: 'desc'}], groupBy: 'Status'})
    render(<Table />)

    expectRowOrderToBe(['Row D', 'Row Beta', 'Row C'])
  })
})
