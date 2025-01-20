import {expect} from '@playwright/test'

import {InsightsResources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'

test.describe('Insights View navigation', () => {
  test('When the memex_insights flag is enabled it is navigable', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      serverFeatures: {
        memex_insights: true,
      },
    })
    await expect(memex.topBarNavigation.INSIGHTS_NAV_BUTTON).toBeVisible()
    await expect(memex.topBarNavigation.INSIGHTS_NAV_BUTTON).not.toHaveJSProperty('disabled', true)
  })

  test('When the memex_insights flag is disabled it is still navigable', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      serverFeatures: {
        memex_insights: false,
      },
    })
    await expect(memex.topBarNavigation.INSIGHTS_NAV_BUTTON).toBeVisible()
    await expect(memex.topBarNavigation.INSIGHTS_NAV_BUTTON).not.toHaveJSProperty('disabled', true)
  })

  test('When the memex_table_without_limits flag is enabled it is not visible/navigable', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      serverFeatures: {
        memex_table_without_limits: true,
      },
    })
    await expect(memex.topBarNavigation.INSIGHTS_NAV_BUTTON).toBeHidden()
  })

  test('it does allow duplicating existing charts', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.CHART_NAVIGATION_ITEM_OPTIONS_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Duplicate chart"').click()

    await expect(memex.insightsPage.MY_CHART_NAVIGATION_ITEM).toHaveCount(1)
  })

  test('it does allow deleting existing charts', async ({memex, page}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.ADD_CHART_BUTTON.click()
    await memex.insightsPage.CHART_NAVIGATION_ITEM_OPTIONS_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Delete chart"').click()

    await submitConfirmDialog(page, 'Delete')

    await expect(memex.insightsPage.MY_CHART_NAVIGATION_ITEM).toHaveCount(0)
  })
})

test.describe('Insight view', () => {
  test('it shows the Burn up chart as default when only memex_insights is enabled', async ({memex}) => {
    await memex.navigateToStory('insights', {
      serverFeatures: {
        memex_insights: true,
      },
      testIdToAwait: 'insights-page',
    })
    await expect(memex.insightsPage.HEADING).toHaveText(/Burn up/)
  })

  test('it shows the Status chart as default even when memex_insights is disabled', async ({memex}) => {
    await memex.navigateToStory('insights', {
      serverFeatures: {
        memex_insights: false,
      },
      testIdToAwait: 'insights-page',
    })
    await expect(memex.insightsPage.HEADING).toHaveText(/Status chart/)
  })

  test('it shows the Burn up chart as default when memex_insights is enabled', async ({memex}) => {
    await memex.navigateToStory('insights', {
      serverFeatures: {
        memex_insights: true,
      },
      testIdToAwait: 'insights-page',
    })
    await expect(memex.insightsPage.HEADING).toHaveText(/Burn up/)
  })

  test('it allows adding new charts', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })
    await expect(memex.insightsPage.ADD_CHART_BUTTON).toBeVisible()
    await expect(memex.insightsPage.MY_CHART_NAVIGATION_ITEM).toHaveCount(0)

    await memex.insightsPage.ADD_CHART_BUTTON.click()

    await expect(memex.insightsPage.MY_CHART_NAVIGATION_ITEM).toHaveCount(1)
    await expect(memex.insightsPage.HEADING).toHaveText(/Chart:/)
  })

  test('it allows editing chart names', async ({page, memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.ADD_CHART_BUTTON.click()
    await memex.insightsPage.MY_CHART_NAVIGATION_ITEM.nth(0).click()
    await memex.insightsPage.CHART_NAME_EDITOR_BUTTON.click()
    await memex.insightsPage.CHART_NAME_EDITOR_INPUT.fill('Test Chart')
    await memex.insightsPage.HEADING.getByRole('button', {
      name: 'Save',
    }).click()

    await expect(page.getByRole('link', {name: 'Test Chart'})).toBeVisible()
  })

  test('it sends aggregate options correctly in the Burn up Chart', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await memex.insightsPage.ADD_CHART_BUTTON.click()
    await memex.insightsPage.CONFIGURE_BUTTON.click()

    await memex.insightsPage.X_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Time"').click()

    await memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Sum of a field"').click()
    await expect(memex.insightsPage.Y_AXIS_DROPDOWN_BUTTON).toHaveText('Sum of a field')

    await memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON.click()
    await memex.insightsPage.DROPDOWN_LIST_ITEM.locator('text="Estimate"').click()
    await expect(memex.insightsPage.Y_AXIS_FIELD_DROPDOWN_BUTTON).toHaveText('Estimate')

    await memex.insightsPage.CONFIGURATION_PANE_CLOSE_BUTTON.click()
  })

  test('it filters by project items when filters are applied to a custom curent-state Chart', async ({memex, page}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    await expect(memex.insightsPage.ADD_CHART_BUTTON).toBeVisible()
    await expect(memex.insightsPage.MY_CHART_NAVIGATION_ITEM).toHaveCount(0)

    await memex.insightsPage.ADD_CHART_BUTTON.click()

    await expect(page.locator('text=No data available')).toHaveCount(0)

    await memex.insightsPage.FILTER_BAR_INPUT.fill('some-bulfajslfkjadslkfjasdlk;fhalsfhaljsdfh')

    await expect(page.locator('text=No data available')).toHaveCount(1)
  })

  test('it tracks dirty state and maintains them across navigation', async ({memex}) => {
    await memex.navigateToStory('insights', {
      testIdToAwait: 'insights-page',
    })

    /**
     * Add a chart
     */
    await memex.insightsPage.ADD_CHART_BUTTON.click()
    await test.expect(memex.insightsPage.CHART_NAME_INPUT).toContainText('Chart: 1')

    const firstMyChartNavLink = memex.insightsPage.getMyChartNavigationItemForIndex(0)
    await firstMyChartNavLink.expectToBeActive()
    const filterToAdd = 'status:bug'
    /**
     * Update the filter for the new chart
     */
    await memex.insightsPage.FILTER_BAR_INPUT.fill(filterToAdd)
    await test.expect(memex.insightsPage.FILTER_BAR_INPUT).toHaveValue(filterToAdd)

    /**
     * Validate state is dirty
     */
    await firstMyChartNavLink.expectToShowDirtyIndicator()

    await test.expect(memex.insightsPage.FILTER_BAR_SAVE_BUTTON).toBeEnabled()

    /**
     * Navigate to another chart
     */
    await memex.insightsPage.DEFAULT_CHART_NAVIGATION_ITEM.nth(0).click()
    await firstMyChartNavLink.expectNotToBeActive()

    await test.expect(memex.insightsPage.FILTER_BAR_SAVE_BUTTON).toBeHidden()
    /**
     * Ensure the dirty state is maintained
     */
    await firstMyChartNavLink.expectToShowDirtyIndicator()

    /**
     * Go back to the dirty chart
     */
    await firstMyChartNavLink.click()

    /** Save */
    await test.expect(memex.insightsPage.FILTER_BAR_SAVE_BUTTON).toBeEnabled()
    await memex.insightsPage.FILTER_BAR_SAVE_BUTTON.click()

    /**
     * ensure that dirty state is gone, but value remains
     */
    await test.expect(firstMyChartNavLink.item.getByTestId('my-chart-navigation-item-dirty')).toBeHidden()
    await test.expect(memex.insightsPage.FILTER_BAR_INPUT).toHaveValue(filterToAdd)
  })

  test('Historical charts are visible on enterprise', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInEnterpriseMode', {
      serverFeatures: {
        memex_insights: false,
      },
    })
    await expect(memex.topBarNavigation.INSIGHTS_NAV_BUTTON).toBeVisible()

    const url = new URL(page.url())
    // Preserve query parameters
    await page.goto(`${url.origin}${url.pathname}/insights${url.search}`)
    await expect(memex.insightsPage.HEADING).toContainText(InsightsResources.defaultLeanBurnupChartName)
    await expect(memex.insightsPage.DESCRIPTION).toContainText(InsightsResources.defaultLeanBurnupChartDescription)
  })
})

test.describe('Insights burnup chart header & description', () => {
  test('The burnup chart renders the new chart name', async ({memex}) => {
    await memex.navigateToStory('insights', {
      serverFeatures: {
        memex_insights: true,
      },
      testIdToAwait: 'insights-page',
    })

    await expect(memex.insightsPage.HEADING).toContainText(InsightsResources.defaultLeanBurnupChartName)
    await expect(memex.insightsPage.DESCRIPTION).toContainText(InsightsResources.defaultLeanBurnupChartDescription)
  })
})
