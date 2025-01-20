import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {setupInsightsPage} from '../../../test-app-wrapper'

describe('Insights Upsell Dialog', () => {
  async function expectUpsellDialog() {
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  }

  function expectNoUpsellDialog() {
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  }

  async function waitForChartCount(count: number) {
    await waitFor(() => expect(screen.queryAllByTestId('my-chart-navigation-item')).toHaveLength(count))
  }

  async function clickNewChartButton() {
    const newChartButton = screen.getByTestId('add-chart-button')
    await userEvent.click(newChartButton)
  }
  describe('via add chart button', () => {
    it('should be shown after free account is at the limit', async () => {
      const {InsightsPageComponent} = setupInsightsPage({basicCharts: false, limitedChartsLimit: 1})
      render(<InsightsPageComponent />)

      await waitForChartCount(0)

      await clickNewChartButton()
      await waitForChartCount(1)
      expectNoUpsellDialog()

      await clickNewChartButton()
      await expectUpsellDialog()
      await waitForChartCount(1)
    })

    it('should not be shown after paid account is at the limit', async () => {
      const {InsightsPageComponent} = setupInsightsPage({basicCharts: true, limitedChartsLimit: 1})
      render(<InsightsPageComponent />)

      await waitForChartCount(0)

      await clickNewChartButton()
      await waitForChartCount(1)
      expectNoUpsellDialog()

      await clickNewChartButton()
      await waitForChartCount(2)
      expectNoUpsellDialog()
    })
  })
  describe('via duplicate chart action', () => {
    async function selectDuplicateChartAction(index: number) {
      const chartOptionsButton = screen.getAllByTestId('chart-options-button')[index]
      await userEvent.click(chartOptionsButton)

      const duplicateChartMenuItem = await screen.findByRole('menuitem', {name: 'Duplicate chart'})
      await userEvent.click(duplicateChartMenuItem)
    }

    it('should be shown after free account is at the limit', async () => {
      const {InsightsPageComponent} = setupInsightsPage({basicCharts: false, limitedChartsLimit: 1})
      render(<InsightsPageComponent />)

      await waitForChartCount(0)

      await clickNewChartButton()
      await waitForChartCount(1)
      expectNoUpsellDialog()

      await selectDuplicateChartAction(0)
      await expectUpsellDialog()
      await waitForChartCount(1)
    })

    it('should not be shown after paid account is at the limit', async () => {
      const {InsightsPageComponent} = setupInsightsPage({basicCharts: true, limitedChartsLimit: 1})
      render(<InsightsPageComponent />)

      await waitForChartCount(0)

      await clickNewChartButton()
      await waitForChartCount(1)
      expectNoUpsellDialog()

      await selectDuplicateChartAction(0)
      await waitForChartCount(2)
      expectNoUpsellDialog()
    })
    describe('via configuration pane', () => {
      async function openConfigurationPaneForDefaultChart() {
        const defaultChartNavItem = screen.getByTestId('default-chart-navigation-item')
        await userEvent.click(defaultChartNavItem)

        const configurateChartButton = await screen.findByTestId('insights-configuration-pane-button-open')
        await userEvent.click(configurateChartButton)
      }

      async function expectNoConfigurationPane() {
        await waitFor(() => expect(screen.queryByTestId('insights-configuration-pane')).not.toBeInTheDocument())
      }

      async function changeLayoutToBarChart() {
        const selectLayoutButton = await screen.findByRole('button', {name: /Layout/})
        await userEvent.click(selectLayoutButton)

        const barMenuItem = await screen.findByRole('menuitemradio', {name: 'Bar'})
        await userEvent.click(barMenuItem)
      }

      async function clickSaveToNewChartButton() {
        const saveToNewChartButton = await screen.findByRole('button', {name: 'Save to new chart'})
        await userEvent.click(saveToNewChartButton)
      }

      it('should be shown after free account is at the limit', async () => {
        const {InsightsPageComponent} = setupInsightsPage({basicCharts: false, limitedChartsLimit: 1})
        render(<InsightsPageComponent />)

        await waitForChartCount(0)

        await clickNewChartButton()
        await waitForChartCount(1)
        expectNoUpsellDialog()

        await openConfigurationPaneForDefaultChart()
        await changeLayoutToBarChart()
        await clickSaveToNewChartButton()
        await expectUpsellDialog()
        await waitForChartCount(1)
        await expectNoConfigurationPane()
      })

      it('should not be shown after paid account is at the limit', async () => {
        const {InsightsPageComponent} = setupInsightsPage({basicCharts: true, limitedChartsLimit: 1})
        render(<InsightsPageComponent />)

        await waitForChartCount(0)

        await clickNewChartButton()
        await waitForChartCount(1)
        expectNoUpsellDialog()

        await openConfigurationPaneForDefaultChart()
        await changeLayoutToBarChart()
        await clickSaveToNewChartButton()
        await waitForChartCount(2)
        expectNoUpsellDialog()
        await expectNoConfigurationPane()
      })
    })
  })
})
