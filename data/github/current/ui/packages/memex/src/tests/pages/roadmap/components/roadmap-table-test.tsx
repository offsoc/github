import '../../../mocks/platform/utils'

import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../../client/api/common-contracts'
import {ItemType} from '../../../../client/api/memex-items/item-type'
import {cellTestId, rowTestId} from '../../../../client/components/react_table/test-identifiers'
import {ROADMAP_TITLE_COLUMN_DEFAULT_WIDTH} from '../../../../client/components/roadmap/constants'
import {dateStringFromISODate} from '../../../../client/helpers/date-string-from-iso-string'
import {overrideDefaultPrivileges} from '../../../../client/helpers/viewer-privileges'
import {mockGetBoundingClientRect} from '../../../components/board/board-test-helper'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../../mocks/hooks/use-repositories'
import {setupRoadmapView} from '../../../test-app-wrapper'
import {setupRoadmapViewWithDates} from './roadmap-test-helpers'

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

describe('Roadmap Table View', () => {
  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    mockGetBoundingClientRect()
  })

  function buildGroupedRoadmap(buildOptions = {}) {
    const today = dateStringFromISODate(new Date().toISOString())
    const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done']}).build()
    const date = customColumnFactory.date().build({name: 'Date'})

    const columns = [systemColumnFactory.title().build(), status, date]

    const views = [
      viewFactory
        .roadmap()
        .withDefaultColumnsAsVisibleFields(columns)
        .build({
          name: 'All issues',
          groupBy: [status.databaseId],
          layoutSettings: {roadmap: {dateFields: [date.databaseId]}},
          ...buildOptions,
        }),
    ]

    const {Roadmap} = setupRoadmapView({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('First', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Second', ItemType.DraftIssue).build(),
            columnValueFactory.status('In Progress', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Third', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
            columnValueFactory.date(today, 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Fourth', ItemType.DraftIssue).build(),
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

  const HEADER_ROWGROUP_COUNT = 1
  async function expectToHaveRowGroups(expectedRowGroups: number) {
    await waitFor(() => expect(screen.getAllByRole('rowgroup')).toHaveLength(expectedRowGroups + HEADER_ROWGROUP_COUNT))
  }

  describe('Filtering', () => {
    it('should support filtering items', async () => {
      const {Roadmap} = setupRoadmapViewWithDates()
      render(<Roadmap />)
      expect(screen.getAllByTestId('roadmap-view-item-pill')).toHaveLength(3)

      await filterItems('issue')
      await expectToHaveRows(2)
    })
  })

  describe('Ranking', () => {
    const getRankedColumn = (index: number) => screen.getByTestId(`TableCell{row: ${index}, column: row-drag-handle}`)

    it('should display a numeric rank for a memex item', () => {
      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.withTitleColumnValue('Explore performance issues').build(),
          draftIssueFactory.withTitleColumnValue('Some random title').build(),
          issueFactory.withTitleColumnValue('Important issue').build(),
        ],
      })
      render(<Roadmap />)

      expect(getRankedColumn(0)).toHaveTextContent('1')
      expect(getRankedColumn(1)).toHaveTextContent('2')
      expect(getRankedColumn(2)).toHaveTextContent('3')
    })

    it('should re-rank on filtering', async () => {
      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.withTitleColumnValue('Explore performance issues').build(),
          draftIssueFactory.withTitleColumnValue('Some random title').build(),
          issueFactory.withTitleColumnValue('Important issue').build(),
        ],
      })
      render(<Roadmap />)

      await filterItems('issue')

      await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(5))

      expect(getRankedColumn(0)).toHaveTextContent('1')
      expect(getRankedColumn(1)).toHaveTextContent('2') // 'Some random title' filtered out, ranks are changed
    })

    describe('Grouped context', () => {
      it('should exclude group headings when ranking rows', async () => {
        const Roadmap = buildGroupedRoadmap()
        render(<Roadmap />)
        expect(screen.getAllByTestId('roadmap-view-item-pill')).toHaveLength(4)
        await expectToHaveRowGroups(3)

        expect(getRankedColumn(0)).toHaveTextContent('1')
        expect(getRankedColumn(1)).toHaveTextContent('2')
        expect(getRankedColumn(2)).toHaveTextContent('3')
        expect(getRankedColumn(3)).toHaveTextContent('4')
      })

      it('re-rank when filtering', async () => {
        const Roadmap = buildGroupedRoadmap({filter: '-status:Todo'})
        render(<Roadmap />)
        expect(screen.getAllByTestId('roadmap-view-item-pill')).toHaveLength(3)
        await expectToHaveRowGroups(2)

        expect(getRankedColumn(0)).toHaveTextContent('1')
        expect(getRankedColumn(1)).toHaveTextContent('2')
        expect(getRankedColumn(2)).toHaveTextContent('3')
      })
    })
  })

  describe('Grouping', () => {
    it('should include correct groups and group pills', async () => {
      const Roadmap = buildGroupedRoadmap()
      render(<Roadmap />)

      await expectToHaveRows(4)
      await expectToHaveRowGroups(3)
      expect(screen.getAllByTestId('roadmap-view-item-pill')).toHaveLength(4)
      expect(screen.getAllByTestId('roadmap-view-group-header-item')).toHaveLength(3)
    })

    it('should include correct groups and group pills when filtered', async () => {
      const Roadmap = buildGroupedRoadmap({filter: '-status:Todo'})
      render(<Roadmap />)

      await expectToHaveRows(3)
      await expectToHaveRowGroups(2)
      expect(screen.getAllByTestId('roadmap-view-item-pill')).toHaveLength(3)
      expect(screen.getAllByTestId('roadmap-view-group-header-item')).toHaveLength(2)
    })
  })

  // Most tests for actually resizing are in Playwright, see `roadmap-table-resizing-spec.ts`
  describe('Resizing', () => {
    it('should use default roadmap table width if no width is set', async () => {
      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.withTitleColumnValue('Explore performance issues').build(),
          draftIssueFactory.withTitleColumnValue('Some random title').build(),
          issueFactory.withTitleColumnValue('Important issue').build(),
        ],
      })
      render(<Roadmap />)

      const titleCell = await screen.findByTestId(cellTestId(0, 'Title'))

      const width = parseInt(titleCell.style.maxWidth, 10)
      expect(width).toEqual(ROADMAP_TITLE_COLUMN_DEFAULT_WIDTH)
    })

    it('has a table drag sash if project is writable', async () => {
      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.withTitleColumnValue('Explore performance issues').build(),
          draftIssueFactory.withTitleColumnValue('Some random title').build(),
          issueFactory.withTitleColumnValue('Important issue').build(),
        ],
        viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
      })
      render(<Roadmap />)

      // Ensure everything is rendered
      const firstRow = await screen.findByTestId(rowTestId(0))
      expect(firstRow).toBeVisible()

      const dragSash = await within(firstRow).findByTestId('roadmap-table-drag-sash')
      expect(dragSash).toBeInTheDocument()
    })

    it('disables the table dragging if project is readonly', async () => {
      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.withTitleColumnValue('Explore performance issues').build(),
          draftIssueFactory.withTitleColumnValue('Some random title').build(),
          issueFactory.withTitleColumnValue('Important issue').build(),
        ],
        viewerPrivileges: overrideDefaultPrivileges({role: Role.Read}),
      })
      render(<Roadmap />)

      // Ensure everything is rendered
      const firstRow = await screen.findByTestId(rowTestId(0))
      expect(firstRow).toBeVisible()

      const dragSash = within(firstRow).queryByTestId('roadmap-table-drag-sash')
      expect(dragSash).not.toBeInTheDocument()
    })

    it('allows dragging the group header to resize', async () => {
      const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done']}).build()
      const columns = [systemColumnFactory.title().build(), status]
      const views = [viewFactory.roadmap().build({name: 'All issues', groupBy: [status.databaseId]})]

      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.build({
            memexProjectColumnValues: [
              columnValueFactory.title('Second', ItemType.DraftIssue).build(),
              columnValueFactory.status('In Progress', columns).build(),
            ],
          }),
        ],
        columns,
        views,
        viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
      })
      render(<Roadmap />)

      const groupRow = (await screen.findAllByTestId('roadmap-group-header-row'))[0]
      expect(groupRow).toBeInTheDocument()

      const dragSash = await within(groupRow).findByTestId('roadmap-table-drag-sash')
      expect(dragSash).toBeInTheDocument()
    })

    it('disables dragging the group header if project is readonly', async () => {
      const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done']}).build()
      const columns = [systemColumnFactory.title().build(), status]
      const views = [viewFactory.roadmap().build({name: 'All issues', groupBy: [status.databaseId]})]

      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.build({
            memexProjectColumnValues: [
              columnValueFactory.title('Second', ItemType.DraftIssue).build(),
              columnValueFactory.status('In Progress', columns).build(),
            ],
          }),
        ],
        columns,
        views,
        viewerPrivileges: overrideDefaultPrivileges({role: Role.Read}),
      })
      render(<Roadmap />)

      const groupRow = (await screen.findAllByTestId('roadmap-group-header-row'))[0]
      expect(groupRow).toBeInTheDocument()

      const dragSash = within(groupRow).queryByTestId('roadmap-table-drag-sash')
      expect(dragSash).not.toBeInTheDocument()
    })

    it('allows dragging the sash in the omnibar if writable', async () => {
      const {Roadmap} = setupRoadmapView({
        items: [
          draftIssueFactory.withTitleColumnValue('Explore performance issues').build(),
          draftIssueFactory.withTitleColumnValue('Some random title').build(),
          issueFactory.withTitleColumnValue('Important issue').build(),
        ],
        viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
      })
      render(<Roadmap />)

      const omnibar = await screen.findByTestId('roadmap-omnibar-item')
      expect(omnibar).toBeVisible()

      const dragSash = await within(omnibar).findByTestId('roadmap-table-drag-sash')
      expect(dragSash).toBeInTheDocument()
    })
  })
})
