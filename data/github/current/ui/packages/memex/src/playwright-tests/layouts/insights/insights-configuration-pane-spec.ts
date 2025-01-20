import {expect} from '@playwright/test'

import type {EnabledFeatures} from '../../../mocks/generate-enabled-features-from-url'
import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'

const visitNewChartInsightsAndOpenConfigurationPane = async (
  memex: MemexApp,
  serverFeatures: Partial<{[key in EnabledFeatures]: boolean}> = {},
) => {
  await memex.navigateToStory('insights', {
    testIdToAwait: 'insights-page',
    serverFeatures,
  })

  await memex.insightsPage.ADD_CHART_BUTTON.click()
  await memex.insightsPage.CONFIGURE_BUTTON.click()
}

test.describe('Insights configuration pane', () => {
  test('it can be opened from the navigation context menu', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })
    const navItem = memex.insightsPage.getDefaultChartNavigationItemForIndex(0)
    await navItem.openChartOptions()
    await navItem.openConfigPane()
    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeVisible()
    await expect(memex.insightsPage.CONFIGURATION_PANE_CLOSE_BUTTON).toBeFocused()
  })

  test('it does allow configuring custom charts with flag', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.ADD_CHART_BUTTON.click()

    await expect(memex.insightsPage.CONFIGURE_BUTTON).toBeVisible()
    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeHidden()

    await memex.insightsPage.CONFIGURE_BUTTON.click()

    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeVisible()
    await expect(memex.insightsPage.CONFIGURATION_PANE).toContainText(/Configure chart/)
  })

  test('can be closed with close button or escape', async ({memex, page}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.ADD_CHART_BUTTON.click()

    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeHidden()
    await memex.insightsPage.CONFIGURE_BUTTON.click()
    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeVisible()
    await memex.insightsPage.CONFIGURATION_PANE_CLOSE_BUTTON.click()
    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeHidden()
    await memex.insightsPage.CONFIGURE_BUTTON.click()
    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(memex.insightsPage.CONFIGURATION_PANE).toBeHidden()
    await expect(memex.insightsPage.CONFIGURE_BUTTON).toBeFocused()
  })

  test('can change the layout', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await expect(memex.insightsPage.LAYOUT_DROPDOWN_BUTTON).toHaveText('Column')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
    await memex.insightsPage.LAYOUT_DROPDOWN_BUTTON.click()
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).toContainText([
      /Bar/,
      /Column/,
      /Line/,
      /Stacked area/,
      /Stacked bar/,
      /Stacked column/,
    ])
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Bar"').click()
    await expect(memex.insightsPage.LAYOUT_DROPDOWN_BUTTON).toHaveText('Bar')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
  })

  test('X-axis includes "Time" as an option when memex_insights is enabled', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await expect(memex.insightsPage.X_AXIS_DROPDOWN_BUTTON).toHaveText('Status')
    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).toContainText([/Time/])
  })

  test('X-axis omits "Time" as an option when memex_insights is disabled', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex, {memex_insights: false})

    await expect(memex.insightsPage.X_AXIS_DROPDOWN_BUTTON).toHaveText('Status')
    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).not.toContainText([/Time/])
  })

  test('can change the X-axis', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await expect(memex.insightsPage.X_AXIS_DROPDOWN_BUTTON).toHaveText('Status')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    for (const dropdownItem of [/Time/, /Aardvarks/, /Status/, /Stage/]) {
      await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).toContainText([dropdownItem])
    }
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Stage"').click()
    await expect(memex.insightsPage.X_AXIS_DROPDOWN_BUTTON).toHaveText('Stage')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
  })

  test('can change the X-axis group by', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Status"').click()

    await expect(memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON).toHaveText('None')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
    await memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON.click()
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).not.toContainText([/Time/])
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).toContainText([/Aardvarks/, /Stage/])
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Stage"').click()
    await expect(memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON).toHaveText('Stage')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
  })

  test('changing the X-axis should reset the group by', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await expect(memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON).toHaveText('None')
    await memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Stage"').click()
    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Stage"').click()
    await expect(memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON).toHaveText('None')
  })

  test('can change the Y-axis', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Status"').click()

    await expect(memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON).toHaveText('Count of items')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).toContainText([/Count of items/, /Sum of a field/])
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Sum of a field"').click()
    await expect(memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON).toHaveText('Sum of a field')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
  })

  test('Y-axis defaults to "count" when X-axis is time', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Time"').click()

    // The Y-axis should default to Count and enabled when X-axis is time and the FF is enabled
    await expect(memex.insightsPage.X_AXIS_DROPDOWN_BUTTON).toHaveText('Time')
    await expect(memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON).toHaveText('Count of items')
    await expect(memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON).toBeEnabled()
  })

  test('can change the aggregate field for Y-axis', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Status"').click()

    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toBeHidden()
    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Sum of a field"').click()
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toBeVisible()
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
    await memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON.click()
    await expect(memex.insightsPage.DROPDOWN_LIST_ITEM).toContainText([/Estimate/])
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Estimate"').click()
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')
    await expect(memex.insightsPage.DROPDOWN_LIST).toBeHidden()
  })

  test('changing the Y-axis should reset the Y-axis aggregate field', async ({memex}) => {
    await visitNewChartInsightsAndOpenConfigurationPane(memex)

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Status"').click()

    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Sum of a field"').click()
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')
    await memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Estimate"').click()
    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Count of items"').click()
    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Sum of a field"').click()
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')
  })

  test('changing all values and refreshing maintains config', async ({memex, page}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.CONFIGURE_BUTTON.click()

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Status"').click()

    await memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Aardvarks"').click()

    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Sum of a field"').click()

    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')
    await memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON.click()

    await page.reload()

    await expect(page.getByTestId('insights-page')).toBeVisible()

    await memex.insightsPage.CONFIGURE_BUTTON.click()
    await expect(memex.insightsPage.X_AXIS_DROPDOWN_BUTTON).toHaveText('Status')
    await expect(memex.insightsPage.X_AXIS_GROUP_BY_DROPDOWN_BUTTON).toHaveText('Aardvarks')
    await expect(memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON).toHaveText('Sum of a field')
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')
  })

  test('changing the filter should allow configuration saving', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.CONFIGURE_BUTTON.click()
    await expect(memex.insightsPage.CONFIGURATION_SAVE_CHANGES_BUTTON).toBeDisabled()

    await memex.insightsPage.CONFIGURATION_PANE_CLOSE_BUTTON.click()

    // clear filter input
    await memex.insightsPage.CLEAR_FILTER_QUERY.click()
    await memex.insightsPage.FILTER_RESULTS_COUNT.waitFor()

    await memex.insightsPage.CONFIGURE_BUTTON.click()
    await expect(memex.insightsPage.CONFIGURATION_SAVE_CHANGES_BUTTON).toBeEnabled()
  })
})
