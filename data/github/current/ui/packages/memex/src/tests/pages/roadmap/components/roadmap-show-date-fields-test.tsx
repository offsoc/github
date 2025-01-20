import '../../../mocks/platform/utils'

import {render, screen} from '@testing-library/react'
import {addDays} from 'date-fns'

import {ItemType} from '../../../../client/api/memex-items/item-type'
import {dateStringFromISODate} from '../../../../client/helpers/date-string-from-iso-string'
import {safeLocalStorage} from '../../../../client/platform/safe-local-storage'
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
jest.mock('../../../../client/components/common/picker-list', () => ({
  ...jest.requireActual('../../../../client/components/common/picker-list'),
  useAdjustPickerPosition: () => ({
    adjustPickerPosition: jest.fn(),
  }),
}))

jest.mock('../../../../client/state-providers/columns/use-has-column-data')

jest.mock('../../../../client/components/react_table/hooks/use-is-omnibar-fixed', () => ({
  useIsOmnibarFixed: jest.fn(() => false),
}))

const iteration = customColumnFactory
  .iteration({
    configuration: {
      startDay: 1,
      duration: 7,
      iterations: [
        {startDate: '2022-07-07', title: 'Sprint 1', titleHtml: 'Sprint 1', duration: 7, id: '1'},
        {startDate: '2022-07-14', title: 'Sprint 2', titleHtml: 'Sprint 2', duration: 7, id: '2'},
        {startDate: '2022-07-21', title: 'Sprint 3', titleHtml: 'Sprint 3', duration: 7, id: '3'},
      ],
      completedIterations: [],
    },
  })
  .build({name: 'Sprint'})

const today = dateStringFromISODate(new Date().toISOString())
const nextWeek = dateStringFromISODate(addDays(new Date(), 7).toISOString())
const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done']}).build()
const date = customColumnFactory.date().build({name: 'Start Date'})
const targetDate = customColumnFactory.date().build({name: 'End Date'})

function buildGroupedRoadmap(dateFields?: Array<number | 'none'>) {
  const columns = [systemColumnFactory.title().build(), status, date, targetDate, iteration]

  const views = [
    viewFactory
      .roadmap()
      .withDefaultColumnsAsVisibleFields(columns)
      .build({
        name: 'All issues',
        groupBy: [status.databaseId],
        layoutSettings: {roadmap: {dateFields: dateFields || [date.databaseId, targetDate.databaseId]}},
      }),
  ]

  const {Roadmap} = setupRoadmapView({
    items: [
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('First', ItemType.DraftIssue).build(),
          columnValueFactory.status('Todo', columns).build(),
          columnValueFactory.date(today, 'Start Date', columns).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Second', ItemType.DraftIssue).build(),
          columnValueFactory.status('In Progress', columns).build(),
          columnValueFactory.date(today, 'Start Date', columns).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Third', ItemType.DraftIssue).build(),
          columnValueFactory.status('Done', columns).build(),
          columnValueFactory.date(today, 'Start Date', columns).build(),
          columnValueFactory.iteration('Sprint 2', 'Sprint', [iteration]).build(),
        ],
      }),
      draftIssueFactory.build({
        memexProjectColumnValues: [
          columnValueFactory.title('Fourth', ItemType.DraftIssue).build(),
          columnValueFactory.status('Done', columns).build(),
          columnValueFactory.date(today, 'Start Date', columns).build(),
          columnValueFactory.date(nextWeek, 'End Date', columns).build(),
        ],
      }),
    ],
    columns,
    views,
  })
  return Roadmap
}

describe('Roadmap Show date fields', () => {
  const getColumnByRowIndex = (index: number, columnName: string) =>
    screen.getByTestId(`TableCell{row: ${index}, column: ${columnName}}`)

  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    mockGetBoundingClientRect()
  })

  beforeEach(() => {
    safeLocalStorage.setItem('projects.roadmapShowDateFields', 'true')
  })

  afterEach(() => {
    safeLocalStorage.removeItem('projects.roadmapShowDateFields')
  })

  it('should show date fields by default', () => {
    const Roadmap = buildGroupedRoadmap()
    render(<Roadmap />)

    expect(getColumnByRowIndex(0, 'Start Date')).toBeInTheDocument()
    expect(getColumnByRowIndex(0, 'End Date')).toBeInTheDocument()
  })

  it('should hide date fields when user setting is disabled', () => {
    safeLocalStorage.removeItem('projects.roadmapShowDateFields')
    const Roadmap = buildGroupedRoadmap()
    render(<Roadmap />)

    expect(screen.queryByTestId('TableCell{row: 0, column: Start Date}')).not.toBeInTheDocument()
    expect(screen.queryByTestId('TableCell{row: 0, column: End Date}')).not.toBeInTheDocument()
  })

  it('should hide date fields when no date fields are set', () => {
    const Roadmap = buildGroupedRoadmap([])
    render(<Roadmap />)

    expect(screen.queryByTestId('TableCell{row: 0, column: Start Date}')).not.toBeInTheDocument()
    expect(screen.queryByTestId('TableCell{row: 0, column: End Date}')).not.toBeInTheDocument()
  })

  it('should show date fields when iteration and date fields are set', () => {
    const Roadmap = buildGroupedRoadmap([date.databaseId, iteration.databaseId])
    render(<Roadmap />)

    expect(getColumnByRowIndex(0, 'Start Date')).toBeInTheDocument()
    expect(getColumnByRowIndex(0, 'Sprint')).toBeInTheDocument()
  })

  it('should show only one date field when no End Date field is set', () => {
    const Roadmap = buildGroupedRoadmap([date.databaseId])
    render(<Roadmap />)

    expect(getColumnByRowIndex(0, 'Start Date')).toBeInTheDocument()
    expect(screen.queryByTestId('TableCell{row: 0, column: End Date}')).not.toBeInTheDocument()
  })

  it('should show only one date field when no Date field is set', () => {
    const Roadmap = buildGroupedRoadmap(['none', date.databaseId])
    render(<Roadmap />)

    expect(screen.queryByTestId('TableCell{row: 0, column: End Date}')).not.toBeInTheDocument()
    expect(getColumnByRowIndex(0, 'Start Date')).toBeInTheDocument()
  })

  it('should show only one date field when same iteration field is set', () => {
    const Roadmap = buildGroupedRoadmap([iteration.databaseId, iteration.databaseId])
    render(<Roadmap />)

    expect(getColumnByRowIndex(0, 'Sprint')).toBeInTheDocument()
  })
})
