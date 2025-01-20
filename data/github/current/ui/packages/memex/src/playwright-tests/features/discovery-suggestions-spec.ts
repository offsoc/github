import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'

test.describe('DiscoverySuggestions', () => {
  test('does not open automatically when navigating to an new memex', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    // Close the Select a Template modal
    await page.getByLabel('Close').click()

    await expect(memex.omnibar.discoverySuggestions.LIST).toBeHidden()
  })

  test('does not open automatically when navigating to an existing memex', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await expect(memex.omnibar.discoverySuggestions.LIST).toBeHidden()
  })

  test('is triggered by add new item button and hidden when focus is lost', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.omnibar.NEW_ITEM.click()

    // Pressing Esc should hide the menu
    await expect(memex.omnibar.discoverySuggestions.LIST).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(memex.omnibar.discoverySuggestions.LIST).toBeHidden()
  })
})

test('clicking Add item from repository opens side panel', async ({memex}) => {
  await memex.navigateToStory('integrationTestsWithItems')

  await memex.omnibar.NEW_ITEM.click()
  await expect(memex.omnibar.discoverySuggestions.LIST).toBeVisible()

  await memex.omnibar.discoverySuggestions.ADD_ITEM_SIDEPANEL.click()

  await expect(memex.sidePanel.BULK_ADD_SIDE_PANEL).toBeVisible()

  // Expect hydro events to be posted
  await memex.stats.expectStatsToContain({
    memexProjectViewNumber: 1,
    name: 'bulk_add_side_panel_open',
    ui: 'omnibar_discovery_suggestions_ui',
  })
})
