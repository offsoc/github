import {expect} from '@playwright/test'

import {CreateWorkflowResources, WorkflowResources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'

test.describe('Create new workflow', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.navigateToAutomationPage()

    await memex.automationPage.navigateToAutoAddItemsTab()
  })

  test('`Duplicate workflow` option is enabled', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.openWorkflowMenu(100)

    await expect(memex.automationPage.DUPLICATE_WORKFLOW_MENU_ITEM).toBeEnabled()
  })

  test('can open the workflow creation dialog when clicking on `Duplicate workflow`', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.openNewWorkflowDialog(100)

    await expect(memex.automationPage.NEW_WORKFLOW_DIALOG_INPUT).toBeEditable()
  })

  test('can create a new workflow when workflow name is valid', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.openNewWorkflowDialog(100)
    await expect(memex.automationPage.NEW_WORKFLOW_DIALOG_ERROR).toBeHidden()

    await memex.automationPage.NEW_WORKFLOW_DIALOG_CREATE_BUTTON.click()
    await memex.automationPage.SAVE.click()
    await expect(memex.automationPage.WORKFLOW_NAME_HEADING).toHaveText('Duplicate of Auto-add to project')
  })

  test('shows validation error when workflow name is invalid', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.openNewWorkflowDialog(100)
    await expect(memex.automationPage.NEW_WORKFLOW_DIALOG_ERROR).toBeHidden()

    await memex.automationPage.NEW_WORKFLOW_DIALOG_INPUT.fill('Auto-add to project')
    await expect(memex.automationPage.NEW_WORKFLOW_DIALOG_ERROR).toHaveText(WorkflowResources.duplicateWorkflowName)
    await expect(memex.automationPage.NEW_WORKFLOW_DIALOG_CREATE_BUTTON).toBeDisabled()
  })

  test('transfers workflow settings from workflow being duplicated', async ({memex}) => {
    await memex.automationPage.EDIT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.clear()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.type('is:issue is:open')
    await memex.automationPage.SAVE.click()
    await memex.automationPage.openNewWorkflowDialog(100)
    await memex.automationPage.NEW_WORKFLOW_DIALOG_CREATE_BUTTON.click()
    await memex.automationPage.SAVE.click()

    await expect(memex.automationPage.WORKFLOW_NAME_HEADING).toHaveText('Duplicate of Auto-add to project')
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('is:issue is:open')
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toHaveText('memex')
  })

  test('disables `Duplicate workflow` when there are 4 auto-add workflows', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()

    // There is already one auto-add workflow by default, so we will add 3 more, for 4 total auto-add workflows.
    await memex.automationPage.addNewWorkflow(100, 'Workflow 1')
    await memex.automationPage.addNewWorkflow(100, 'Workflow 2')
    await memex.automationPage.addNewWorkflow(100, 'Workflow 3')

    await memex.automationPage.openWorkflowMenu(100)
    await expect(memex.automationPage.DUPLICATE_WORKFLOW_MENU_ITEM).toBeDisabled()
    await expect(memex.automationPage.DUPLICATE_WORKFLOW_MENU_ITEM).toHaveText(
      new RegExp(CreateWorkflowResources.autoAddWorkflowLimitReached),
    )
  })

  test('Pressing escape or clicking outside closes workflow menu', async ({page, memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.expectWorkflowMenuToBeClosed(100)
    await memex.automationPage.toggleWorkflowMenu(100)
    await memex.automationPage.expectWorkflowMenuToBeOpen(100)

    // Hitting the 'Escape' key closes the workflow menu
    await page.keyboard.down('Escape')
    await memex.automationPage.expectWorkflowMenuToBeClosed(100)

    await memex.automationPage.toggleWorkflowMenu(100)
    await memex.automationPage.expectWorkflowMenuToBeOpen(100)

    // Clicking outside the workflow menu closes the workflow menu
    await page.getByRole('heading', {level: 1}).click()
    await memex.automationPage.expectWorkflowMenuToBeClosed(100)

    // Add and persist a second workflow for last test
    await memex.automationPage.addNewWorkflow(100, 'test123456')
    await memex.automationPage.SAVE.click()
    await memex.automationPage.toggleWorkflowMenu(101)
    await memex.automationPage.expectWorkflowMenuToBeOpen(101)

    // Clicking on another the workflow menu closes the current one and opens the other one
    await memex.automationPage.toggleWorkflowMenu(100)
    await memex.automationPage.expectWorkflowMenuToBeClosed(101)
    await memex.automationPage.expectWorkflowMenuToBeOpen(100)
  })
})
