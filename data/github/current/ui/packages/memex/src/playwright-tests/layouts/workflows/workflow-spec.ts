import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe(`Workflows`, () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.navigateToAutomationPage()

    await memex.automationPage.navigateToAutoAddItemsTab()
  })

  test('Do not show the delete workflow option in the kebab menu of default workflow', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.toggleWorkflowMenu(100)
    await memex.automationPage.expectWorkflowMenuToBeOpen(100)
    await memex.automationPage.expectWorkflowMenuToNotContainDelete(100)
  })

  test('Show the delete workflow option in the kebab menu of a migrated workflow', async ({memex}) => {
    // Show the delete workflow for both the original persisted item closed workflow
    await memex.automationPage.toggleWorkflowMenu(1)
    await memex.automationPage.expectWorkflowMenuToBeOpen(1)
    await memex.automationPage.expectWorkflowMenuToContainDelete(1)

    // And the migrated persisted item closed workflow
    await memex.automationPage.toggleWorkflowMenu(5)
    await memex.automationPage.expectWorkflowMenuToBeOpen(5)
    await memex.automationPage.expectWorkflowMenuToContainDelete(5)
  })

  test('Focus flows as expected when editing a workflow', async ({memex, page}) => {
    await expect(memex.automationPage.EDIT).not.toBeFocused()
    await memex.automationPage.EDIT.focus()
    await expect(memex.automationPage.EDIT).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(memex.automationPage.DISCARD).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(memex.automationPage.EDIT).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(memex.automationPage.DISCARD).toBeFocused()
  })
})
