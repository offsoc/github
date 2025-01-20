import {noop} from '@github-ui/noop'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {ItemType} from '../client/api/memex-items/item-type'
import {
  AggregationSettingsItemsCountHidden,
  AggregationSettingsItemsCountShown,
  AggregationSettingsSumApplied,
  AggregationSettingsSumRemoved,
  ViewOptionsMenuUI,
} from '../client/api/stats/contracts'
import useToasts from '../client/components/toasts/use-toasts'
import {ViewNavigation} from '../client/components/view-navigation'
import {ViewType} from '../client/helpers/view-type'
import {usePostStats} from '../client/hooks/common/use-post-stats'
import {
  useGetFieldIdsFromFilter,
  useLoadRequiredFieldsForViewsAndCurrentView,
} from '../client/hooks/use-load-required-fields'
import {autoFillColumnServerProps} from '../mocks/data/columns'
import {mockGetBoundingClientRect} from './components/board/board-test-helper'
import {columnValueFactory} from './factories/column-values/column-value-factory'
import {customColumnFactory} from './factories/columns/custom-column-factory'
import {systemColumnFactory} from './factories/columns/system-column-factory'
import {draftIssueFactory} from './factories/memex-items/draft-issue-factory'
import {viewFactory} from './factories/views/view-factory'
import {asMockHook} from './mocks/stub-utilities'
import {setupProjectView} from './test-app-wrapper'

jest.mock('../client/components/toasts/use-toasts')
jest.mock('../client/hooks/use-load-required-fields')
jest.mock('../client/hooks/common/use-post-stats')

/**
 * Without mocking this hook, we won't render rows from groups outside of the first group
 */
jest.mock('../client/components/board/hooks/use-is-visible', () => ({
  ...jest.requireActual('../client/components/board/hooks/use-is-visible'),
  __esModule: true,
  default: () => ({
    isVisible: true,
    size: 40,
  }),
}))

describe('Field sums', () => {
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
    mockPostStats = jest.fn()
    asMockHook(usePostStats).mockReturnValue({
      postStats: mockPostStats,
    })
  })

  let pointsId: number

  function renderProject(viewType: ViewType = ViewType.Board) {
    const view = viewType === ViewType.Table ? viewFactory.table() : viewFactory.board()
    const status = systemColumnFactory.status({optionNames: ['todo', 'in progress', 'done']}).build()
    const points = customColumnFactory.number().build({name: 'Points'})
    pointsId = points.id as number

    const groupKind = viewType === ViewType.Table ? 'groupBy' : 'verticalGroupBy'
    const views = [view.build({name: 'All issues', [groupKind]: [status.databaseId]})]

    const columns = autoFillColumnServerProps([
      systemColumnFactory.title().build(),
      status,
      systemColumnFactory.repository().build(),
      customColumnFactory.number().build({name: 'Estimate'}),
      customColumnFactory.text().build({name: 'Text'}),
      points,
    ])
    const {ProjectViewComponent} = setupProjectView(viewType, {
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
            columnValueFactory.status('todo', columns).build(),
            columnValueFactory.number(5, 'Estimate', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
            columnValueFactory.status('todo', columns).build(),
            columnValueFactory.number(3, 'Estimate', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
            columnValueFactory.status('in progress', columns).build(),
            columnValueFactory.number(2, 'Estimate', columns).build(),
            columnValueFactory.number(1000, 'Points', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
            columnValueFactory.status('done', columns).build(),
            columnValueFactory.number(-1, 'Points', columns).build(),
          ],
        }),
      ],
      columns,
      views,
      children: <ViewNavigation projectViewId="" onFocusIntoCurrentView={noop} />,
    })

    render(<ProjectViewComponent />)
  }

  function findViewOptionsButton() {
    return screen.findByTestId('view-options-menu-toggle')
  }

  describe('Field sum menu', () => {
    function findFieldSumMenuItem() {
      return screen.findByTestId('view-options-menu-item-field-sum-menu')
    }

    async function findFieldSumMenu() {
      return screen.findByTestId('field-sum-menu')
    }

    async function findFieldSumOption(label: string) {
      return within(await findFieldSumMenu()).findByRole('menuitemcheckbox', {name: label})
    }

    async function openFieldSumMenu() {
      await userEvent.click(await findViewOptionsButton())

      const fieldSumMenuTrigger = await findFieldSumMenuItem()
      await userEvent.click(fieldSumMenuTrigger)
    }

    async function expectToHaveMenuItemLabel(menuItemLabel: string) {
      const label = await findFieldSumMenuItem()
      expect(label).toHaveTextContent(`Field sum: ${menuItemLabel}`)
    }

    it('should keep selections when reopening the submenu', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())

      await expectToHaveMenuItemLabel('Count')

      await userEvent.click(await findFieldSumMenuItem())

      const countOption = await findFieldSumOption('Count')
      const estimateOption = await findFieldSumOption('Estimate')

      await userEvent.click(countOption)
      await userEvent.click(estimateOption)
      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{Escape}')

      await userEvent.click(await findViewOptionsButton())

      await expectToHaveMenuItemLabel('Estimate')

      await userEvent.click(await findFieldSumMenuItem())

      const menu = await findFieldSumMenu()
      const pointsItem = within(menu).getByRole('menuitemcheckbox', {name: 'Points'})
      const estimateItem = within(menu).getByRole('menuitemcheckbox', {name: 'Estimate'})

      expect(pointsItem).not.toBeChecked()
      expect(estimateItem).toBeChecked()
    })

    it('should update changes indicators on selection and deselection', async () => {
      renderProject()

      await userEvent.click(await findViewOptionsButton())
      expect(screen.queryByTestId('view-options-dirty')).not.toBeInTheDocument()
      expect(screen.queryByTestId('aggregation-settings-dirty')).not.toBeInTheDocument()

      await userEvent.click(await findFieldSumMenuItem())

      const countOption = await findFieldSumOption('Count')
      await userEvent.click(countOption)
      expect(screen.getByTestId('view-options-dirty')).toBeInTheDocument()

      await userEvent.click(countOption)
      expect(screen.queryByTestId('view-options-dirty')).not.toBeInTheDocument()

      const estimateOption = await findFieldSumOption('Estimate')
      await userEvent.click(estimateOption)
      expect(screen.getByTestId('view-options-dirty')).toBeInTheDocument()

      await userEvent.keyboard('{Escape}')
      await userEvent.keyboard('{Escape}')
      await userEvent.click(await findViewOptionsButton())
      expect(screen.getByTestId('view-options-dirty')).toBeInTheDocument()
      expect(screen.getByTestId('aggregation-settings-dirty')).toBeInTheDocument()
    })

    it('should ensure labels are in consistent order', async () => {
      renderProject(ViewType.Table)

      await userEvent.click(await findViewOptionsButton())
      await userEvent.click(await findFieldSumMenuItem())

      const items = await within(await findFieldSumMenu()).findAllByRole('menuitemcheckbox')

      expect(items[0]).toHaveTextContent('Count')
      expect(items[1]).toHaveTextContent('Estimate')
      expect(items[2]).toHaveTextContent('Points')

      await userEvent.click(items[2])
      await userEvent.click(items[1])

      const header = await screen.findByTestId('group-header-todo')

      expect(header).toHaveTextContent(/Estimate.*Points/)
    })

    it('should post stats when hide item count is toggled', async () => {
      renderProject()

      await openFieldSumMenu()

      const countOption = await findFieldSumOption('Count')
      await userEvent.click(countOption)

      expect(mockPostStats).toHaveBeenCalledWith({
        name: AggregationSettingsItemsCountHidden,
        ui: ViewOptionsMenuUI,
        context: ViewType.Board,
      })

      await userEvent.click(countOption)

      expect(mockPostStats).toHaveBeenCalledWith({
        name: AggregationSettingsItemsCountShown,
        ui: ViewOptionsMenuUI,
        context: ViewType.Board,
      })
    })

    it('should post stats when field aggregations are added and removed', async () => {
      renderProject()

      await openFieldSumMenu()

      const pointOption = await findFieldSumOption('Points')
      await userEvent.click(pointOption)

      expect(mockPostStats).toHaveBeenCalledWith({
        name: AggregationSettingsSumApplied,
        memexProjectColumnId: pointsId,
        ui: ViewOptionsMenuUI,
        context: ViewType.Board,
      })

      await userEvent.click(pointOption)

      expect(mockPostStats).toHaveBeenCalledWith({
        name: AggregationSettingsSumRemoved,
        memexProjectColumnId: pointsId,
        ui: ViewOptionsMenuUI,
        context: ViewType.Board,
      })
    })

    describe('board view display', () => {
      it('should display count label and field sums when selected', async () => {
        renderProject()

        await userEvent.click(await findViewOptionsButton())

        const fieldSumMenuTrigger = await findFieldSumMenuItem()
        await expectToHaveMenuItemLabel('Count')

        await userEvent.click(fieldSumMenuTrigger)

        const countLabels = await screen.findAllByTestId('column-items-counter')
        expect(countLabels.length).toBe(4)
        expect(countLabels[0]).toHaveTextContent('0')
        expect(countLabels[1]).toHaveTextContent('2')
        expect(countLabels[2]).toHaveTextContent('1')
        expect(countLabels[3]).toHaveTextContent('1')

        const estimateOption = await findFieldSumOption('Estimate')

        await userEvent.click(estimateOption)

        const estimateLabels = await screen.findAllByTestId('column-sum-Estimate')
        expect(estimateLabels.length).toBe(4)
        expect(estimateLabels[0]).toHaveTextContent('Estimate: 0')
        expect(estimateLabels[1]).toHaveTextContent('Estimate: 8')
        expect(estimateLabels[2]).toHaveTextContent('Estimate: 2')
        expect(estimateLabels[3]).toHaveTextContent('Estimate: 0')

        const pointsOption = await findFieldSumOption('Points')

        await userEvent.click(pointsOption)

        const pointsLabels = await screen.findAllByTestId('column-sum-Points')
        expect(pointsLabels.length).toBe(4)
        expect(pointsLabels[0]).toHaveTextContent('Points: 0')
        expect(pointsLabels[1]).toHaveTextContent('Points: 0')
        expect(pointsLabels[2]).toHaveTextContent('Points: 1000')
        expect(pointsLabels[3]).toHaveTextContent('Points: -1')

        await userEvent.keyboard('{Escape}')
        await userEvent.keyboard('{Escape}')
        await userEvent.click(await findViewOptionsButton())

        await expectToHaveMenuItemLabel('Count, Estimate and 1 more')
      })

      it('should hide count label when deselected', async () => {
        renderProject()

        await userEvent.click(await findViewOptionsButton())

        const fieldSumMenuTrigger = await findFieldSumMenuItem()
        await expectToHaveMenuItemLabel('Count')

        await userEvent.click(fieldSumMenuTrigger)

        const countLabels = await screen.findAllByTestId('column-items-counter')
        expect(countLabels.length).toBe(4)

        const countOption = await findFieldSumOption('Count')

        await userEvent.click(countOption)

        expect(screen.queryByTestId('column-items-counter')).not.toBeInTheDocument()
      })
    })

    describe('table view display', () => {
      it('should display count label and field sums when selected', async () => {
        renderProject(ViewType.Table)

        await userEvent.click(await findViewOptionsButton())

        const fieldSumMenuTrigger = await findFieldSumMenuItem()
        await expectToHaveMenuItemLabel('Count')

        await userEvent.click(fieldSumMenuTrigger)

        const countLabels = await screen.findAllByTestId('column-items-counter')
        expect(countLabels.length).toBe(3)
        expect(countLabels[0]).toHaveTextContent('2')
        expect(countLabels[1]).toHaveTextContent('1')
        expect(countLabels[2]).toHaveTextContent('1')

        const estimateOption = await findFieldSumOption('Estimate')

        await userEvent.click(estimateOption)

        const estimateLabels = await screen.findAllByTestId('column-sum-Estimate')
        expect(estimateLabels.length).toBe(3)
        expect(estimateLabels[0]).toHaveTextContent('Estimate: 8')
        expect(estimateLabels[1]).toHaveTextContent('Estimate: 2')
        expect(estimateLabels[2]).toHaveTextContent('Estimate: 0')

        const pointsOption = await findFieldSumOption('Points')

        await userEvent.click(pointsOption)

        const pointsLabels = await screen.findAllByTestId('column-sum-Points')
        expect(pointsLabels.length).toBe(3)
        expect(pointsLabels[0]).toHaveTextContent('Points: 0')
        expect(pointsLabels[1]).toHaveTextContent('Points: 1000')
        expect(pointsLabels[2]).toHaveTextContent('Points: -1')

        await userEvent.keyboard('{Escape}')
        await userEvent.keyboard('{Escape}')
        await userEvent.click(await findViewOptionsButton())

        await expectToHaveMenuItemLabel('Count, Estimate and 1 more')
      })

      it('should hide count label when deselected', async () => {
        renderProject(ViewType.Table)

        await userEvent.click(await findViewOptionsButton())

        const fieldSumMenuTrigger = await findFieldSumMenuItem()
        await expectToHaveMenuItemLabel('Count')

        await userEvent.click(fieldSumMenuTrigger)

        const countLabels = await screen.findAllByTestId('column-items-counter')
        expect(countLabels.length).toBe(3)

        const countOption = await findFieldSumOption('Count')

        await userEvent.click(countOption)

        expect(screen.queryByTestId('column-items-counter')).not.toBeInTheDocument()
      })
    })
  })
})
