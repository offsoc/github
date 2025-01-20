import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'

test.describe(`Auto Add Workflow`, () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.navigateToAutomationPage()

    await memex.automationPage.navigateToAutoAddItemsTab()
  })

  test('Do not show the kebab menu for non auto-add workflows', async ({memex}) => {
    await memex.automationPage.expectWorkflowMenuToBeHidden('item_added_set_field')
  })

  test('Do not show the kebab menu for non persisted auto-add workflows', async ({memex}) => {
    await memex.automationPage.expectWorkflowMenuToBeHidden('query_matched_add_project_item')
  })

  test('Show and toggle the kebab menu', async ({memex}) => {
    // Persist the workflow to show the kebab menu
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.expectWorkflowMenuToBeClosed(100)
    await memex.automationPage.toggleWorkflowMenu(100)
    await memex.automationPage.expectWorkflowMenuToBeOpen(100)
  })

  test('Show the delete workflow option in the kebab menu of user-added workflow', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    // Add and persist the new workflow
    await memex.automationPage.addNewWorkflow(100, 'test123456')
    await memex.automationPage.SAVE.click()
    await memex.automationPage.toggleWorkflowMenu(101)
    await memex.automationPage.expectWorkflowMenuToBeOpen(101)
    await memex.automationPage.expectWorkflowMenuToContainDelete(101)
  })

  test('Do not show the delete workflow option in the kebab menu of default workflow', async ({memex}) => {
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.toggleWorkflowMenu(100)
    await memex.automationPage.expectWorkflowMenuToBeOpen(100)
    await memex.automationPage.expectWorkflowMenuToNotContainDelete(100)
  })

  test('Click the delete workflow option in the kebab menu to delete the workflow', async ({page, memex}) => {
    const name = 'test123456'
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.addNewWorkflow(100, name)
    await expect(memex.automationPage.NAVIGATION).toContainText(name)
    await memex.automationPage.SAVE.click()
    await memex.automationPage.toggleWorkflowMenu(101)
    await memex.automationPage.clickDeleteWorkflowMenuOption(101)
    await submitConfirmDialog(page, 'Delete')
    await expect(memex.automationPage.NAVIGATION).not.toContainText(name)
    await Promise.all([memex.toasts.expectErrorMessageVisible('Workflow deleted')])
  })

  test('Creating a duplicate workflow enters edit mode', async ({memex}) => {
    const name = 'test123456'
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.addNewWorkflow(100, name)
    await expect(memex.automationPage.SAVE).toBeVisible()
    await expect(memex.automationPage.DELETE).toBeVisible()
    await expect(memex.automationPage.EDIT).toBeHidden()
  })

  test('Get Items block is present', async ({memex}) => {
    return expect(memex.automationPage.GET_ITEMS_BLOCK).toBeVisible()
  })

  test('Filter input is disabled when workflow is enabled', async ({memex}) => {
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toBeEnabled()
    await expect(memex.automationPage.SAVE).toBeVisible()
    await memex.automationPage.SAVE.click()
    await memex.automationPage.expectWorkflowTurnedOn()
    await memex.automationPage.expectQueryToBeDisabled()
  })

  test('Filter input is disabled unless the edit button is clicked', async ({memex}) => {
    await memex.automationPage.expectQueryToBeDisabled()
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await expect(memex.automationPage.SAVE).toBeVisible()
    await expect(memex.automationPage.DISCARD).toBeVisible()
  })

  test('Save enables the workflow, and disables edit', async ({memex}) => {
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toBeEnabled()
    await expect(memex.automationPage.SAVE).toBeVisible()
    await memex.automationPage.SAVE.click()
    await memex.automationPage.expectWorkflowTurnedOn()
  })

  test('Discard does not enable the workflow, and disables edit', async ({memex}) => {
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.DISCARD).toBeVisible()
    await memex.automationPage.DISCARD.click()
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
  })

  test('Delete is visible if the workflow is non persisted and user added', async ({page, memex}) => {
    const name = 'Duplicate of Auto-add to project'
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.openNewWorkflowDialog(100)
    await memex.automationPage.NEW_WORKFLOW_DIALOG_CREATE_BUTTON.click()
    await expect(memex.automationPage.NAVIGATION).toContainText(name)
    await expect(memex.automationPage.DELETE).toBeVisible()
    await memex.automationPage.DELETE.click()
    await submitConfirmDialog(page, 'Delete')
    await expect(memex.automationPage.NAVIGATION).not.toContainText(name)
  })

  test('Suggestions are displayed for is, label, milestone, reason, & type only', async ({memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()

    // "label" suggestion is visible
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('l')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Labels')).toBeVisible()

    // "is" suggestion is visible
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('i')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-is')).toBeVisible()

    // "milestone" suggestion is visible
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('m')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Milestone')).toBeVisible()

    // "reason" suggestion is visible
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('r')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-reason')).toBeVisible()

    // "type" suggestion is visible
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('t')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Type')).toBeVisible()

    // "type" suggestion is not visible if does not match keyword input
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('l')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Labels')).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Type')).toBeHidden()

    // "last-updated" suggestion is hidden
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('l')
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-last-updated')).toBeHidden()
    await memex.automationPage.SAVE.click()
    // after saving a workflow, the "last-updated" suggestion should still be hidden
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('l')
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-last-updated')).toBeHidden()
  })

  test('Suggestions are displayed for labels', async ({page, memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('labe')

    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Labels')).toBeVisible()

    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    await memex.automationPage.expectAutoAddInputToHaveValue('label:')

    await memex.automationPage.expectSuggestionsResultCount(20)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    await memex.automationPage.expectAutoAddInputToHaveValue('label:":cactus: deferred timeline"')
  })

  test('displays an error tooltip if label is not in suggested values', async ({memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('label:blah')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getValueErrorTooltip('blah', 'Labels')).toHaveCount(1)

    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('label:":cactus: deferred timeline",blah')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getValueErrorTooltip('blah', 'Labels')).toHaveCount(1)
  })

  test('Suggestions are displayed for milestone', async ({page, memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('mile')

    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Milestone')).toBeVisible()

    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    await memex.automationPage.expectAutoAddInputToHaveValue('milestone:')

    await memex.automationPage.expectSuggestionsResultCount(5)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    await memex.automationPage.expectAutoAddInputToHaveValue('milestone:"Closed milestone"')
  })

  test('displays an error tooltip if milestone is not in suggested values', async ({memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('milestone:blah')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getValueErrorTooltip('blah', 'milestone')).toHaveCount(1)

    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('milestone:"Closed milestone",blah')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getValueErrorTooltip('blah', 'milestone')).toHaveCount(1)
  })

  test('Renders an error tooltip for type filter when issue_types feature flag is disabled', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      serverFeatures: {
        issue_types: false,
      },
    })

    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('type:')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getFieldErrorTooltip('type')).toHaveCount(1)
  })

  test('Suggestions are displayed for issue type', async ({page, memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('type')

    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
    await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Type')).toBeVisible()

    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    await memex.automationPage.expectAutoAddInputToHaveValue('type:')

    await memex.automationPage.expectSuggestionsResultCount(9)
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.type('Bu')
    await memex.automationPage.expectSuggestionsResultCount(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    await memex.automationPage.expectAutoAddInputToHaveValue('type:Bug')
  })

  test('displays an error tooltip if issue type is not in suggested values', async ({memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('type:blah')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getValueErrorTooltip('blah', 'type')).toHaveCount(1)

    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('type:Epic,blah')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getValueErrorTooltip('blah', 'type')).toHaveCount(1)
  })

  test('Suggestions are not displayed when writing the query', async ({memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('abc:xyz')
    await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeHidden()
  })

  test('Enable toggle is hidden unless workflow is persisted', async ({memex}) => {
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toBeEnabled()
    await expect(memex.automationPage.SAVE).toBeVisible()
    await memex.automationPage.SAVE.click()
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeVisible()
    await memex.automationPage.expectWorkflowTurnedOn()
  })

  test('Repo picker and filter input are disabled unless user clicks the "edit" button', async ({memex}) => {
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeHidden()
    await memex.automationPage.expectQueryToBeDisabled()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toBeDisabled()

    await memex.automationPage.EDIT.click()

    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toBeHidden()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toBeEnabled()
  })

  test('"Read-only" label is shown unless user clicks the "edit" button', async ({memex}) => {
    await expect(memex.automationPage.READ_ONLY_LABEL).toBeVisible()

    await memex.automationPage.EDIT.click()

    await expect(memex.automationPage.READ_ONLY_LABEL).toBeHidden()
  })

  test('A saved repo not in suggested is shown correctly after auto-add workflow created', async ({page, memex}) => {
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toHaveText('memex')
    await memex.automationPage.EDIT.click()
    await memex.automationPage.REPO_PICKER_BUTTON.click()

    await expect(memex.automationPage.REPO_PICKER_REPO_LIST).toBeVisible()
    const repoPickerInput = memex.automationPage.REPO_PICKER_REPO_LIST.locator('input')
    await expect(repoPickerInput).toBeVisible()
    await repoPickerInput.type('private')

    // Pick a repo that is not in the suggested repos originally shown
    await page.getByRole('option', {name: 'private-server'}).click()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toHaveText('private-server')
    await memex.automationPage.SAVE.click()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toHaveText('private-server')
    await memex.automationPage.navigateToAutoArchiveItemsTab()
    await page.goBack()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toHaveText('private-server')
  })

  test('Discarding changes restores data that was present before changes', async ({memex}) => {
    // to create the workflow
    await memex.automationPage.EDIT.click()
    await memex.automationPage.SAVE.click()
    await memex.automationPage.expectWorkflowTurnedOn()

    await memex.automationPage.EDIT.click()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('abc:xyz')

    await memex.automationPage.DISCARD.click()
    await memex.automationPage.expectWorkflowTurnedOn()
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('is:issue label:bug')
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toHaveText('memex')

    await memex.automationPage.toggleWorkflow()
    await memex.automationPage.expectWorkflowTurnedOff()
    await memex.automationPage.EDIT.click()
    await memex.automationPage.DISCARD.click()
    await memex.automationPage.expectWorkflowTurnedOff()
  })

  test('Discarding after saving will revert to the most recently saved changes', async ({memex}) => {
    test.fixme()
    // to create the persisted workflow
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.REPO_PICKER_BUTTON).toBeEnabled()
    await memex.automationPage.SAVE.click()

    await memex.automationPage.EDIT.click()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    // we need a delay here because the input is debounced
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.type('label:cat', {delay: 100})
    await memex.automationPage.SAVE.click()
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('label:cat')

    await memex.automationPage.EDIT.click()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.type('label:dog')
    await memex.automationPage.DISCARD.click()
    // query gets formatted to contain the content types if they're not present
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('is:issue,pr label:cat')
  })

  test('Error message is displayed when the query is empty', async ({memex}) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.clear()
    await expect(memex.automationPage.EMPTY_QUERY_WARNING).toBeVisible()
  })

  test('Displays an error tooltip if filter is not `is:`, `reason:`, `label:`, `assignee:`, `milestones:`, or `type:', async ({
    memex,
  }) => {
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('last-updated:')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getFieldErrorTooltip('last-updated')).toHaveCount(1)

    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('status:')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getFieldErrorTooltip('status')).toHaveCount(1)
  })

  test.describe('assignee filter', () => {
    test('Assignee filter autocompletes', async ({page, memex}) => {
      await expect(memex.automationPage.EDIT).toBeVisible()
      await memex.automationPage.EDIT.click()
      await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
      await memex.automationPage.CLEAR_FILTER_QUERY.click()
      await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('assign')

      await expect(memex.automationPage.FILTER_SUGGESTIONS).toBeVisible()
      await expect(memex.automationPage.getSuggestedItem('search-suggestions-item-Assignees')).toBeVisible()

      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      await memex.automationPage.expectAutoAddInputToHaveValue('assignee:')
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.type('@me', {delay: 100})
      await memex.automationPage.expectAutoAddInputToHaveValue('assignee:@me')

      await expect(memex.automationPage.SAVE).toBeVisible()
      await memex.automationPage.SAVE.click()
      await memex.automationPage.expectWorkflowTurnedOn()
      await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('is:issue,pr assignee:iansan5653')

      await expect(memex.automationPage.EDIT).toBeVisible()
      await memex.automationPage.EDIT.click()
      await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
      await memex.automationPage.CLEAR_FILTER_QUERY.click()
      await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('assignee:traumverloren,@me,iulia-b')

      await expect(memex.automationPage.SAVE).toBeVisible()
      await memex.automationPage.SAVE.click()
      await memex.automationPage.expectWorkflowTurnedOn()
      await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue(
        'is:issue,pr assignee:traumverloren,iansan5653,iulia-b',
      )

      // Strips out the leading @
      await expect(memex.automationPage.EDIT).toBeVisible()
      await memex.automationPage.EDIT.click()
      await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
      await memex.automationPage.CLEAR_FILTER_QUERY.click()
      await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('assignee:@traumverloren,@me,@iulia-b')

      await expect(memex.automationPage.SAVE).toBeVisible()
      await memex.automationPage.SAVE.click()
      await memex.automationPage.expectWorkflowTurnedOn()
      await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue(
        'is:issue,pr assignee:traumverloren,iansan5653,iulia-b',
      )

      await expect(memex.automationPage.EDIT).toBeVisible()
      await memex.automationPage.EDIT.click()
      await expect(memex.automationPage.CLEAR_FILTER_QUERY).toBeVisible()
      await memex.automationPage.CLEAR_FILTER_QUERY.click()
      await expect(memex.automationPage.AUTO_ADD_FILTER_INPUT).toBeVisible()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.click()
      await memex.automationPage.AUTO_ADD_FILTER_INPUT.fill('assignee:@traumverloren,@me,@iulia-b label:cat')

      await expect(memex.automationPage.SAVE).toBeVisible()
      await memex.automationPage.SAVE.click()
      await memex.automationPage.expectWorkflowTurnedOn()
      await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue(
        'is:issue,pr assignee:traumverloren,iansan5653,iulia-b label:cat',
      )
    })
  })
})
