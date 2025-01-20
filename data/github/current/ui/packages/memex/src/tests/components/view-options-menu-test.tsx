import {noop} from '@github-ui/noop'
import {act, render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {MemexColumn} from '../../client/api/columns/contracts/memex-column'
import {FieldSortAsc, FieldSortDesc, ViewOptionsMenuUI} from '../../client/api/stats/contracts'
import type {SortDirection} from '../../client/api/view/contracts'
import useToasts from '../../client/components/toasts/use-toasts'
import {ViewNavigation} from '../../client/components/view-navigation'
import {ViewType} from '../../client/helpers/view-type'
import {usePostStats} from '../../client/hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../client/hooks/use-enabled-features'
import {
  useGetFieldIdsFromFilter,
  useLoadRequiredFieldsForViewsAndCurrentView,
} from '../../client/hooks/use-load-required-fields'
import {PROJECT_VIEW_ROUTE} from '../../client/routes'
import {autoFillColumnServerProps} from '../../mocks/data/columns'
import {customColumnFactory} from '../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../factories/columns/system-column-factory'
import {draftIssueFactory} from '../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../factories/views/view-factory'
import {asMockHook} from '../mocks/stub-utilities'
import {setupProjectView, TestAppContainer} from '../test-app-wrapper'
import {mockGetBoundingClientRect} from './board/board-test-helper'

jest.mock('../../client/components/toasts/use-toasts')
jest.mock('../../client/hooks/use-load-required-fields')
jest.mock('../../client/hooks/use-enabled-features')
jest.mock('../../client/hooks/common/use-post-stats')

describe('View options menu', () => {
  let mockPostStats: jest.Mock
  beforeAll(() => {
    asMockHook(useToasts).mockReturnValue({
      addToast: jest.fn(),
    })
    mockGetBoundingClientRect({left: 100})
  })
  beforeEach(() => {
    asMockHook(useGetFieldIdsFromFilter).mockReturnValue({
      getFieldIdsFromFilter: jest.fn(),
    })
    asMockHook(useLoadRequiredFieldsForViewsAndCurrentView).mockReturnValue([])
    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: false})
    mockPostStats = jest.fn()
    asMockHook(usePostStats).mockReturnValue({
      postStats: mockPostStats,
    })
  })

  function findViewOptionsButton() {
    return screen.findByTestId('view-options-menu-toggle')
  }

  function findGroupByMenuItem() {
    return screen.findByTestId('view-options-menu-item-group-by-menu')
  }

  async function findGroupByMenu() {
    return screen.findByTestId('group-by-menu')
  }

  async function findGroupByOption(label: string) {
    return within(await findGroupByMenu()).findByRole('menuitemradio', {name: label})
  }

  async function clickGroupByMenuItem() {
    const groupByTrigger = await findGroupByMenuItem()
    await userEvent.click(groupByTrigger)
  }

  function renderProject(viewType: ViewType = ViewType.Table, columns: Array<MemexColumn> = []) {
    const view = viewFactory.withViewType(viewType)
    const views = [view.build({name: 'All issues'})]
    setupProjectView(viewType, {
      items: [draftIssueFactory.withTitleColumnValue('').build()],
      columns: autoFillColumnServerProps([
        systemColumnFactory.title().build(),
        systemColumnFactory.status({optionNames: ['todo', 'in progress', 'done']}).build(),
        systemColumnFactory.repository().build(),
        customColumnFactory.number().build({name: 'Estimate'}),
        customColumnFactory.text().build({name: 'Text'}),
        customColumnFactory.number().build({name: 'Points'}),
        ...columns,
      ]),
      views,
    })

    render(
      <TestAppContainer
        routerProps={{
          initialEntries: [
            PROJECT_VIEW_ROUTE.generatePath({
              projectNumber: 1,
              ownerIdentifier: 'monalisa',
              ownerType: 'orgs',
              viewNumber: views[0].number,
            }),
          ],
        }}
      >
        <ViewNavigation projectViewId="" onFocusIntoCurrentView={noop} />
      </TestAppContainer>,
    )
  }

  describe('Sort by menu', () => {
    function getSortByMenuItem(...sorts: Array<[columnName: string, direction: SortDirection]>) {
      return screen.getByRole('menuitem', {
        name: `Sort by: ${
          sorts.length === 0
            ? 'manual'
            : sorts.map(([col, dir]) => `${col} (${dir === 'asc' ? 'ascending' : 'descending'})`).join(', ')
        }`,
      })
    }

    function findSortByMenu() {
      return screen.findByTestId('sort-by-menu')
    }

    async function findSortOption(label: string) {
      return within(await findSortByMenu()).findByRole('menuitemradio', {name: label})
    }

    it('changes the sort label correctly', async () => {
      renderProject()
      await userEvent.click(await screen.findByRole('tab', {name: 'All issues'}))
      await userEvent.click(await findViewOptionsButton())
      const sortedManual = getSortByMenuItem()

      // Sort by the title in ascending order
      await userEvent.click(sortedManual)
      await userEvent.click(await findSortOption('Title'))
      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{enter}')
      const sortedAscending = getSortByMenuItem(['Title', 'asc'])

      expect(mockPostStats).toHaveBeenCalledWith({
        name: FieldSortAsc,
        ui: ViewOptionsMenuUI,
        context: 'Title',
        index: 0,
      })

      // Sort by the title in descending order
      await userEvent.click(sortedAscending)
      await userEvent.click(await findSortOption('Title (sort: ascending)'))
      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{enter}')
      expect(getSortByMenuItem(['Title', 'desc'])).toBeInTheDocument()

      expect(mockPostStats).toHaveBeenCalledWith({
        name: FieldSortDesc,
        ui: ViewOptionsMenuUI,
        context: 'Title',
        index: 0,
      })
    })

    it('should have no sort selected by default', async () => {
      renderProject()

      const trigger = await findViewOptionsButton()
      await userEvent.click(trigger)

      await userEvent.click(getSortByMenuItem())

      const selected = within(await findSortByMenu()).getByRole('menuitemradio', {checked: true})
      expect(selected).toHaveTextContent('No sorting')
    })

    it('should allow navigating with the arrow keys and close the menu on selection', async () => {
      renderProject()

      const trigger = await findViewOptionsButton()
      act(() => trigger.focus())

      await userEvent.keyboard('{Enter}')

      await userEvent.keyboard('s')
      expect(getSortByMenuItem()).toHaveFocus()
      await userEvent.keyboard('{Enter}')

      const menu = await findSortByMenu()
      const menuItems = within(menu).getAllByRole('menuitemradio')

      // Title, Status, Clear, Repository
      expect(menuItems).toHaveLength(7)
      expect(menuItems[0]).toHaveFocus()

      await userEvent.keyboard('{ArrowDown}')
      expect(menuItems[1]).toHaveFocus()

      await userEvent.keyboard('{Enter}')
      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{Escape}')

      // Original trigger has focus
      expect(trigger).toHaveFocus()

      // Menu is closed
      expect(menu).not.toBeInTheDocument()
    })

    it('should allow clearing an existing selection', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      await userEvent.click(getSortByMenuItem())

      await userEvent.click(await findSortOption('Title'))

      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{Enter}')

      await userEvent.click(getSortByMenuItem(['Title', 'asc']))

      await userEvent.click(await findSortOption('No sorting'))
      await userEvent.keyboard('{Escape}')

      await userEvent.keyboard('{Enter}')
      expect(getSortByMenuItem()).toBeInTheDocument()
    })
  })

  describe('Group by menu', () => {
    async function expectToHaveSelectedGroup(groupName: string) {
      const label = await findGroupByMenuItem()
      expect(label).toHaveTextContent(`Group by: ${groupName}`)
    }

    it('should have no group selected by default', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      const groupByTrigger = await findGroupByMenuItem()
      await expectToHaveSelectedGroup('none')

      await userEvent.click(groupByTrigger)

      const selected = within(await findGroupByMenu()).getByRole('menuitemradio', {checked: true})
      expect(selected).toHaveTextContent('No grouping')
    })

    it('should allow navigating with the arrow keys and close the menu on selection', async () => {
      renderProject()

      const trigger = await findViewOptionsButton()
      act(() => trigger.focus())
      await userEvent.keyboard('{Enter}')

      const groupByTrigger = await findGroupByMenuItem()
      await userEvent.keyboard('g')
      expect(groupByTrigger).toHaveFocus()
      await userEvent.keyboard('{Enter}')

      const menu = await findGroupByMenu()
      const menuItems = within(menu).getAllByRole('menuitemradio')

      // Status, Clear, Repository
      expect(menuItems).toHaveLength(6)
      expect(menuItems[0]).toHaveFocus()

      await userEvent.keyboard('{ArrowDown}')
      expect(menuItems[1]).toHaveFocus()

      // Focus wraps back to the first item
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowDown}')
      expect(menuItems[0]).toHaveFocus()

      await userEvent.keyboard('{Enter}')
      await userEvent.keyboard('{Escape}')

      // Original trigger has focus
      expect(trigger).toHaveFocus()

      // Menu is closed
      expect(menu).not.toBeInTheDocument()
    })

    it('should allow clearing an existing selection', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      await clickGroupByMenuItem()

      await userEvent.click(await findGroupByOption('Status'))
      await userEvent.keyboard('{Escape}')

      await userEvent.keyboard('{Enter}')
      await expectToHaveSelectedGroup('Status')

      await clickGroupByMenuItem()

      await userEvent.click(await findGroupByOption('No grouping'))
      await userEvent.keyboard('{Escape}')

      await userEvent.keyboard('{Enter}')
      await expectToHaveSelectedGroup('none')
    })

    it('should appear in board view', async () => {
      renderProject(ViewType.Board)

      await userEvent.click(await findViewOptionsButton())

      expect(await findGroupByMenuItem()).toBeInTheDocument()
    })
  })

  describe('Slice by menu', () => {
    beforeEach(() => {
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
    })

    function findSliceByMenuItem() {
      return screen.findByTestId('view-options-menu-item-slice-by-menu')
    }

    async function findSliceByMenu() {
      return screen.findByTestId('slice-by-menu')
    }

    async function findSliceByOption(label: string) {
      return within(await findSliceByMenu()).findByRole('menuitemradio', {name: label})
    }

    async function clickSliceByMenuItem() {
      const slicebyTrigger = await findSliceByMenuItem()
      await userEvent.click(slicebyTrigger)
    }

    async function expectToHaveMenuItemLabel(menuItemLabel: string) {
      const label = await findSliceByMenuItem()
      expect(label).toHaveTextContent(`Slice by: ${menuItemLabel}`)
    }

    it('should appear in table view', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      await expectToHaveMenuItemLabel('none')
    })

    it('should be enabled in table view if memex_table_without_limits is enabled', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({memex_table_without_limits: true})
      renderProject()
      await userEvent.click(await findViewOptionsButton())
      const item = await findSliceByMenuItem()
      expect(item).toHaveTextContent('Slice by: none')
      expect(item).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('should appear in board view', async () => {
      renderProject(ViewType.Board)

      await userEvent.click(await findViewOptionsButton())

      await expectToHaveMenuItemLabel('none')
    })

    it('should be enabled in board view if memex_table_without_limits is enabled', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({memex_table_without_limits: true})
      renderProject(ViewType.Board)
      await userEvent.click(await findViewOptionsButton())
      const item = await findSliceByMenuItem()
      expect(item).toHaveTextContent('Slice by: none')
      expect(item).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('should appear in roadmap view', async () => {
      renderProject(ViewType.Roadmap)

      await userEvent.click(await findViewOptionsButton())

      await expectToHaveMenuItemLabel('none')
    })

    it('should be enabled in roadmap view if memex_table_without_limits is enabled', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({memex_table_without_limits: true})
      renderProject(ViewType.Roadmap)
      await userEvent.click(await findViewOptionsButton())
      const item = await findSliceByMenuItem()
      expect(item).toHaveTextContent('Slice by: none')
      expect(item).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('should have tracked by, single select, repository, milestone, text, number, and iteration fields as options', async () => {
      renderProject(ViewType.Table, [
        systemColumnFactory.milestone().build(),
        systemColumnFactory.trackedBy().build(),
        customColumnFactory.date().build({name: 'Start Date'}),
        customColumnFactory
          .iteration({
            configuration: {
              startDay: 1,
              duration: 7,
              iterations: [{startDate: '2022-07-07', title: 'Sprint 1', titleHtml: 'Sprint 1', duration: 7, id: '1'}],
              completedIterations: [],
            },
          })
          .build({name: 'Sprint'}),
      ])

      await userEvent.click(await findViewOptionsButton())

      await clickSliceByMenuItem()

      const items = within(await findSliceByMenu()).getAllByRole('menuitemradio')
      expect(items).toHaveLength(10)
      expect(items[0]).toHaveTextContent('Status')
      expect(items[1]).toHaveTextContent('Repository')
      expect(items[2]).toHaveTextContent('Estimate')
      expect(items[3]).toHaveTextContent('Text')
      expect(items[4]).toHaveTextContent('Points')
      expect(items[5]).toHaveTextContent('Milestone')
      expect(items[6]).toHaveTextContent('Tracked by')
      expect(items[7]).toHaveTextContent('Start Date')
      expect(items[8]).toHaveTextContent('Sprint')
      expect(items[9]).toHaveTextContent('No slicing')
    })

    it('should update view option title when option is selected', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      await clickSliceByMenuItem()

      await userEvent.click(await findSliceByOption('Status'))

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('Status')
    })
  })

  describe('Field sum menu', () => {
    function findFieldSumMenuItem() {
      return screen.findByTestId('view-options-menu-item-field-sum-menu')
    }

    async function findFieldSumMenu() {
      return screen.findByTestId('field-sum-menu')
    }

    async function expectToHaveMenuItemLabel(menuItemLabel: string) {
      const label = await findFieldSumMenuItem()
      expect(label).toHaveTextContent(`Field sum: ${menuItemLabel}`)
    }

    it('should not appear when in table view when no grouping is applied', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      expect(screen.queryByTestId('view-options-menu-item-field-sum-menu')).not.toBeInTheDocument()
    })

    it('should appear in table view when grouping is applied', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      await clickGroupByMenuItem()

      await userEvent.click(await findGroupByOption('Status'))
      await userEvent.keyboard('{Escape}')

      await userEvent.click(await findViewOptionsButton())

      expect(screen.getByTestId('view-options-menu-item-field-sum-menu')).toBeInTheDocument()
    })

    it('should display only number fields', async () => {
      renderProject(ViewType.Board)

      await userEvent.click(await findViewOptionsButton())

      const fieldSumMenuTrigger = await findFieldSumMenuItem()
      await expectToHaveMenuItemLabel('Count')

      await userEvent.click(fieldSumMenuTrigger)

      const menuItems = within(await findFieldSumMenu()).getAllByRole('menuitemcheckbox')
      expect(menuItems).toHaveLength(3)
      expect(menuItems[0]).toHaveTextContent('Count')
      expect(menuItems[1]).toHaveTextContent('Estimate')
      expect(menuItems[2]).toHaveTextContent('Points')
    })

    it('should only have count selected by default', async () => {
      renderProject(ViewType.Board)

      await userEvent.click(await findViewOptionsButton())

      const fieldSumMenuTrigger = await findFieldSumMenuItem()
      await expectToHaveMenuItemLabel('Count')

      await userEvent.click(fieldSumMenuTrigger)

      const selectedItems = within(await findFieldSumMenu()).getAllByRole('menuitemcheckbox', {checked: true})
      expect(selectedItems).toHaveLength(1)
      expect(selectedItems[0]).toHaveTextContent('Count')
    })
  })

  describe('Roadmap user settings', () => {
    async function findUserSettings() {
      return screen.findByRole('group', {name: 'User settings'})
    }

    async function findUserSetting(name: string | RegExp) {
      return within(await findUserSettings()).findByRole('menuitemcheckbox', {name})
    }

    describe('Truncate titles', () => {
      it('can be checked in the Roadmap view options menu', async () => {
        renderProject(ViewType.Roadmap)

        await userEvent.click(await findViewOptionsButton())
        expect(await findUserSettings()).toBeInTheDocument()

        let truncateTitles = await findUserSetting('Truncate titles')
        expect(truncateTitles).toBeInTheDocument()
        expect(truncateTitles).not.toBeChecked()

        await userEvent.click(truncateTitles)
        await userEvent.click(await findViewOptionsButton())
        expect(await findUserSettings()).toBeInTheDocument()

        truncateTitles = await findUserSetting('Truncate titles')
        expect(truncateTitles).toBeInTheDocument()
        expect(truncateTitles).toBeChecked()
      })

      it('does not appear in the view options menu for other layouts', async () => {
        renderProject(ViewType.Board)

        await userEvent.click(await findViewOptionsButton())
        expect(screen.queryByRole('group', {name: 'User settings'})).not.toBeInTheDocument()
        expect(screen.queryByRole('menuitem', {name: 'Truncate titles'})).not.toBeInTheDocument()
      })
    })

    describe('Show date fields', () => {
      beforeEach(() => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          tasklist_block: false,
        })
      })

      it('can be checked in the Roadmap view options menu', async () => {
        renderProject(ViewType.Roadmap)

        await userEvent.click(await findViewOptionsButton())

        expect(await findUserSettings()).toBeInTheDocument()

        let showDateFields = await findUserSetting('Show date fields')
        expect(showDateFields).toBeInTheDocument()
        expect(showDateFields).not.toBeChecked()

        await userEvent.click(showDateFields)
        await userEvent.click(await findViewOptionsButton())
        expect(await findUserSettings()).toBeInTheDocument()

        showDateFields = await findUserSetting('Show date fields')
        expect(showDateFields).toBeInTheDocument()
        expect(showDateFields).toBeChecked()
      })

      it('does not appear in the view options menu for other layouts', async () => {
        renderProject(ViewType.Board)

        await userEvent.click(await findViewOptionsButton())
        expect(screen.queryByRole('group', {name: 'User settings'})).not.toBeInTheDocument()
        expect(screen.queryByRole('menuitem', {name: 'Show date fields'})).not.toBeInTheDocument()
      })
    })
  })
})
