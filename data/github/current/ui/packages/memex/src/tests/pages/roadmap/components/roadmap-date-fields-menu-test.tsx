import {noop} from '@github-ui/noop'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {MemexColumn} from '../../../../client/api/columns/contracts/memex-column'
import {Role} from '../../../../client/api/common-contracts'
import {ItemType} from '../../../../client/api/memex-items/item-type'
import {RoadmapDateFieldSelected, ViewOptionsMenuUI} from '../../../../client/api/stats/contracts'
import type {PageView} from '../../../../client/api/view/contracts'
import {ViewNavigation} from '../../../../client/components/view-navigation'
import {ViewType} from '../../../../client/helpers/view-type'
import {overrideDefaultPrivileges} from '../../../../client/helpers/viewer-privileges'
import {usePostStats} from '../../../../client/hooks/common/use-post-stats'
import {mockGetBoundingClientRect} from '../../../components/board/board-test-helper'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../../mocks/hooks/use-repositories'
import {asMockHook} from '../../../mocks/stub-utilities'
import {setupProjectView} from '../../../test-app-wrapper'

jest.mock('../../../../client/hooks/common/use-post-stats')

// Todo: these tests frequently time out on CI.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Roadmap Date Fields Menu', () => {
  let mockPostStats: jest.Mock
  beforeEach(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    mockPostStats = jest.fn()
    asMockHook(usePostStats).mockReturnValue({
      postStats: mockPostStats,
    })
    mockGetBoundingClientRect({left: 100})
  })

  const date1 = customColumnFactory.date().build({name: 'Date 1'})
  const date2 = customColumnFactory.date().build({name: 'Date 2'})
  const iteration1 = customColumnFactory
    .iteration({
      configuration: {
        startDay: 1,
        duration: 7,
        iterations: [],
        completedIterations: [],
      },
    })
    .build({name: 'Iteration 1'})
  const iteration2 = customColumnFactory
    .iteration({
      configuration: {
        startDay: 1,
        duration: 7,
        iterations: [],
        completedIterations: [],
      },
    })
    .build({name: 'Iteration 2'})

  const allColumns = [date1, date2, iteration1, iteration2]
  const startGroup = 1
  const targetGroup = 2

  function renderRoadmap({
    roadmapDateFields,
    dateColumns,
    viewTypeParams = {type: ViewType.Roadmap, views: undefined},
  }: {
    roadmapDateFields: Array<number | 'none'>
    dateColumns: Array<MemexColumn>
    viewTypeParams?: {type: ViewType; views?: Array<PageView>}
  }) {
    const layoutSettings = {roadmap: {dateFields: roadmapDateFields}}
    const views = viewTypeParams.views || [viewFactory.roadmap().build({name: 'Product Roadmap', layoutSettings})]

    const columns = [
      systemColumnFactory.title().build(),
      systemColumnFactory.status({optionNames: ['todo', 'in progress', 'done']}).build(),
      ...dateColumns,
    ]
    const {ProjectViewComponent} = setupProjectView(viewTypeParams.type, {
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
            columnValueFactory.status('todo', columns).build(),
          ],
        }),
      ],
      viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
      columns,
      views,
      children: <ViewNavigation projectViewId="" onFocusIntoCurrentView={noop} />,
    })

    render(<ProjectViewComponent />)
  }

  function findViewOptionsButton() {
    return screen.findByTestId('view-options-menu-toggle')
  }

  function findRoadmapDatesMenuItem() {
    return screen.findByTestId(`view-options-menu-item-date-fields-menu`)
  }

  function findRoadmapToolbarDatesButton() {
    return screen.findByTestId('quick-action-toolbar-date-fields-menu')
  }

  async function findRoadmapDatesMenu() {
    return screen.findByTestId('roadmap-date-fields-menu')
  }

  async function findAddFieldMenuItem() {
    return screen.findByTestId('roadmap-new-field-button')
  }

  async function findRoadmapGroup(group: number) {
    const groups = await within(await findRoadmapDatesMenu()).findAllByRole('group')
    return groups[group]
  }

  async function findRoadmapDateOption(group: number, label: string) {
    const ul = await findRoadmapGroup(group)
    return within(ul).findByRole('menuitemradio', {name: label})
  }

  async function openRoadmapDatesMenuFromViewOptions() {
    await userEvent.click(await findViewOptionsButton())

    const roadmapDatesMenuTrigger = await findRoadmapDatesMenuItem()
    await userEvent.click(roadmapDatesMenuTrigger)
  }

  async function openRoadmapDatesMenuFromToolbar() {
    await userEvent.click(await findRoadmapToolbarDatesButton())
  }

  async function setAddFieldName(name: string) {
    const nameInput = await screen.findByTestId('add-column-name-input')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, name)
  }

  async function setAddFieldType(type: 'date' | 'iteration') {
    await userEvent.click(await screen.findByTestId('add-column-type'))
    await userEvent.click(await screen.findByTestId(`column-type-${type}`))
  }

  async function clickAddFieldSaveButton() {
    await userEvent.click(await screen.findByTestId('add-column-modal-save'))
  }

  async function expectToHaveMenuItemLabel(menuItemLabel: string) {
    const label = await findRoadmapDatesMenuItem()
    expect(label).toHaveTextContent(`date fields: ${menuItemLabel}`)
  }

  it('should display persisted roadmap date fields in the menu', async () => {
    renderRoadmap({dateColumns: [date1, date2], roadmapDateFields: [date1.databaseId]})

    await userEvent.click(await findViewOptionsButton())
    await expectToHaveMenuItemLabel('Date 1')

    await userEvent.click(await findRoadmapDatesMenuItem())
    expect(await findRoadmapDateOption(startGroup, 'Date 1')).toBeChecked()
    expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()
  })

  it('should allow selecting a target date field', async () => {
    renderRoadmap({dateColumns: [date1, date2], roadmapDateFields: [date1.databaseId]})
    await openRoadmapDatesMenuFromViewOptions()

    const endDateOption = await findRoadmapDateOption(targetGroup, 'Date 2')
    await userEvent.click(endDateOption)

    await userEvent.click(await findViewOptionsButton())
    await expectToHaveMenuItemLabel('Date 1 and Date 2')
  })

  it('should remove end date selection if start date selection matches end', async () => {
    renderRoadmap({dateColumns: [date1, date2], roadmapDateFields: [date1.databaseId]})
    await openRoadmapDatesMenuFromViewOptions()

    const endDateOption = await findRoadmapDateOption(targetGroup, 'Date 2')
    await userEvent.click(endDateOption)

    const startDateOption = await findRoadmapDateOption(startGroup, 'Date 2')
    await userEvent.click(startDateOption)

    // End date is cleared
    expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()

    await userEvent.click(await findViewOptionsButton())
    await expectToHaveMenuItemLabel('Date 2')
  })

  it('should not use default date fields if view has not configured any', async () => {
    renderRoadmap({dateColumns: [date1, date2], roadmapDateFields: []})

    await userEvent.click(await findViewOptionsButton())
    await expectToHaveMenuItemLabel('none')
  })

  it('should show placeholders if no date columns are available', async () => {
    renderRoadmap({dateColumns: [], roadmapDateFields: []})
    await openRoadmapDatesMenuFromViewOptions()

    expect(await findRoadmapDateOption(startGroup, 'No start date')).toBeChecked()
    expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()
  })

  describe('Iteration fields', () => {
    it('allows using the same iteration for start and end', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: [iteration1.databaseId, iteration1.databaseId],
      })

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('Iteration 1')

      await userEvent.click(await findRoadmapDatesMenuItem())
      expect(await findRoadmapDateOption(startGroup, 'Iteration 1 start')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Iteration 1 end')).toBeChecked()
    })

    it('allows using an iteration start with no target date', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: [iteration1.databaseId],
      })

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('Iteration 1')

      await userEvent.click(await findRoadmapDatesMenuItem())
      expect(await findRoadmapDateOption(startGroup, 'Iteration 1 start')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()
    })

    it('allows using an iteration end with no start date', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: ['none', iteration1.databaseId],
      })

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('Iteration 1')

      await userEvent.click(await findRoadmapDatesMenuItem())
      expect(await findRoadmapDateOption(startGroup, 'No start date')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Iteration 1 end')).toBeChecked()
    })

    it('allows mixing and matching iterations and date fields', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: [iteration1.databaseId, date1.databaseId],
      })

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('Iteration 1 and Date 1')

      await userEvent.click(await findRoadmapDatesMenuItem())
      expect(await findRoadmapDateOption(startGroup, 'Iteration 1 start')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Date 1')).toBeChecked()
    })
  })

  describe('Roadmap toolbar Date Fields menu with Add field features', () => {
    it('allows adding and defaulting to use new date fields', async () => {
      renderRoadmap({dateColumns: [], roadmapDateFields: []})
      await openRoadmapDatesMenuFromToolbar()

      // Confirm that the start and end dates are not set
      expect(await findRoadmapDateOption(startGroup, 'No start date')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()

      await userEvent.click(await findAddFieldMenuItem())
      await setAddFieldName('Date X')
      await setAddFieldType('date')
      await clickAddFieldSaveButton()

      // Sets the start date to the new date field since it wasn't set before.
      expect(await findRoadmapDateOption(startGroup, 'Date X')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()

      await userEvent.click(await findAddFieldMenuItem())
      await setAddFieldName('Date Y')
      await setAddFieldType('date')
      await clickAddFieldSaveButton()

      // Sets the target date to the new date field since it wasn't set before.
      expect(await findRoadmapDateOption(startGroup, 'Date X')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Date Y')).toBeChecked()
    })

    it('allows adding and defaulting to use a new iteration field', async () => {
      renderRoadmap({dateColumns: [], roadmapDateFields: []})
      await openRoadmapDatesMenuFromToolbar()

      // Confirm that the start and end dates are not set
      expect(await findRoadmapDateOption(startGroup, 'No start date')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'No target date')).toBeChecked()

      await userEvent.click(await findAddFieldMenuItem())
      await setAddFieldName('My Iteration')
      await setAddFieldType('iteration')
      await clickAddFieldSaveButton()

      // Sets the start and target dates to the new iteration field since they weren't set before.
      expect(await findRoadmapDateOption(startGroup, 'My Iteration start')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'My Iteration end')).toBeChecked()
    })

    it('allows adding a new date field without affecting existing date selections', async () => {
      renderRoadmap({dateColumns: [date1, date2], roadmapDateFields: [date1.databaseId, date2.databaseId]})
      await openRoadmapDatesMenuFromToolbar()

      // Confirm that the start and end dates are already set
      expect(await findRoadmapDateOption(startGroup, 'Date 1')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Date 2')).toBeChecked()

      await userEvent.click(await findAddFieldMenuItem())
      await setAddFieldName('Date X')
      await setAddFieldType('date')
      await clickAddFieldSaveButton()

      // Confirm that the previously set start and end dates are unaffected, but the new date is available too.
      expect(await findRoadmapDateOption(startGroup, 'Date 1')).toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Date 2')).toBeChecked()
      expect(await findRoadmapDateOption(startGroup, 'Date X')).not.toBeChecked()
      expect(await findRoadmapDateOption(targetGroup, 'Date X')).not.toBeChecked()
    })
  })

  describe('Switching to roadmap view', () => {
    function getDirtyState() {
      return screen.queryByTestId('view-options-dirty')
    }

    it('should prepopulate dates when switching to roadmap view and handle dirty state', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: [],
        viewTypeParams: {
          views: [viewFactory.board().build({name: 'Product Board'})],
          type: ViewType.Board,
        },
      })

      await userEvent.click(await findViewOptionsButton())
      expect(getDirtyState()).not.toBeInTheDocument()
      await userEvent.click(screen.getByTestId('view-type-roadmap'))

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('Date 1 and Date 2')
      expect(getDirtyState()).toBeInTheDocument()

      // View is not dirty when switching back to board
      await userEvent.click(screen.getByTestId('view-type-board'))
      await userEvent.click(await findViewOptionsButton())
      expect(getDirtyState()).not.toBeInTheDocument()
    })

    it('should not result in dirty state for project with no date columns when "none" is selected', async () => {
      // Start in board view with no dates
      renderRoadmap({
        dateColumns: [],
        roadmapDateFields: [],
        viewTypeParams: {
          views: [viewFactory.board().build({name: 'Product Board'})],
          type: ViewType.Board,
        },
      })

      // Switch to roadmap view and save
      await userEvent.click(await findViewOptionsButton())
      expect(getDirtyState()).not.toBeInTheDocument()
      await userEvent.click(screen.getByTestId('view-type-roadmap'))

      await userEvent.click(await findViewOptionsButton())
      await expectToHaveMenuItemLabel('none')
      expect(getDirtyState()).toBeInTheDocument()
      await userEvent.click(screen.getByTestId('view-options-menu-save-changes-button'))

      // Clicking on "no start/target" does not result in dirty state
      await openRoadmapDatesMenuFromViewOptions()
      await userEvent.click(await findRoadmapDateOption(startGroup, 'No start date'))
      await userEvent.click(await findRoadmapDateOption(targetGroup, 'No target date'))
      expect(getDirtyState()).not.toBeInTheDocument()
    })
  })

  describe('Stats', () => {
    it('should post stats when start date is added/removed', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: [date1.databaseId, 'none'],
      })

      await openRoadmapDatesMenuFromViewOptions()

      await userEvent.click(await findRoadmapDateOption(startGroup, 'Date 2'))

      expect(mockPostStats).toHaveBeenCalledWith({
        memexProjectColumnId: date2.databaseId,
        name: RoadmapDateFieldSelected,
        ui: ViewOptionsMenuUI,
        context: 'start',
      })

      await userEvent.click(await findRoadmapDateOption(startGroup, 'No start date'))

      expect(mockPostStats).toHaveBeenCalledWith({
        name: RoadmapDateFieldSelected,
        ui: ViewOptionsMenuUI,
        context: 'start',
      })
    })

    it('should post stats when target date is added/removed', async () => {
      renderRoadmap({
        dateColumns: allColumns,
        roadmapDateFields: ['none', date1.databaseId],
      })

      await openRoadmapDatesMenuFromViewOptions()

      await userEvent.click(await findRoadmapDateOption(targetGroup, 'Date 2'))

      expect(mockPostStats).toHaveBeenCalledWith({
        memexProjectColumnId: date2.databaseId,
        name: RoadmapDateFieldSelected,
        ui: ViewOptionsMenuUI,
        context: 'target',
      })

      await userEvent.click(await findRoadmapDateOption(targetGroup, 'No target date'))

      expect(mockPostStats).toHaveBeenCalledWith({
        name: RoadmapDateFieldSelected,
        ui: ViewOptionsMenuUI,
        context: 'target',
      })
    })
  })
})
