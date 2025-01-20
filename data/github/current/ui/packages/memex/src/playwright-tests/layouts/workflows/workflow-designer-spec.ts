import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {_} from '../../helpers/dom/selectors'

test.describe('Workflow designer', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestWorkflowsPage', {
      testIdToAwait: 'automation-page',
    })
  })

  test('Default is viewing mode', async ({memex}) => {
    await expect(memex.automationPage.READ_ONLY_LABEL).toBeVisible()
    await expect(memex.automationPage.WORKFLOW_NAME_HEADING).toBeVisible()
    await expect(memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON).toBeVisible()
    await expect(memex.automationPage.WORKFLOW_NAME_EDITOR).toBeHidden()
  })

  test('Clicking on `edit` shows the `Save and turn on workflow` and `discard` buttons', async ({memex}) => {
    await memex.automationPage.EDIT.click()

    await expect(memex.automationPage.SAVE).toBeEnabled()
    await expect(memex.automationPage.DISCARD).toBeEnabled()
  })

  test('Clicking on `Save and turn on workflow` will create and enable the workflow', async ({memex}) => {
    await memex.automationPage.EDIT.click()
    await memex.automationPage.SAVE.click()

    await memex.automationPage.expectWorkflowTurnedOn()
  })

  test('Clicking on `discard` will discard all changes', async ({memex, page}) => {
    const {WHEN_CONTENT_TYPES_SELECTOR, WHEN_CONTENT_TYPES_PICKER_OPTION_ISSUE} = memex.automationPage
    // Enter edit mode
    let text = await WHEN_CONTENT_TYPES_SELECTOR.textContent()
    expect(text).toEqual('issue, pull request')
    await memex.automationPage.EDIT.click()

    // Change to de-select issue, ensure only pull_request displayed
    await WHEN_CONTENT_TYPES_SELECTOR.click()
    await page.waitForSelector(_('workflows-when-content-types-panel'))
    await WHEN_CONTENT_TYPES_PICKER_OPTION_ISSUE.click()
    text = await WHEN_CONTENT_TYPES_SELECTOR.textContent()
    expect(text).toEqual('pull request')

    // Discard and enter viewing mode - ensure the content types selector is back to the original state
    await memex.automationPage.DISCARD.click()
    text = await WHEN_CONTENT_TYPES_SELECTOR.textContent()
    expect(text).toEqual('issue, pull request')
  })

  test.describe('Edit workflows containing `set_field` actions', () => {
    test('The value in the `Set Field` block updates as the active workflow changes', async ({memex}) => {
      // The workflow should have 'Done' selected for the Set Status box
      await memex.automationPage.expectWorkflowSetFieldToHaveText('Status: Done')

      // Navigate to the Item reopened workflow
      await memex.automationPage.navigateToWorkflow('reopened_set_field')
      await memex.automationPage.expectWorkflowSetFieldToHaveText('Status: In Progress')
    })

    test('Clicking toggle-switch toggles between workflow on and off', async ({memex}) => {
      // Make sure the workflow exists
      await memex.automationPage.EDIT.click()
      await memex.automationPage.SAVE.click()

      // Initially, the default workflow is on once created
      await memex.automationPage.expectWorkflowTurnedOn()

      // The workflow can be turned off
      await memex.automationPage.toggleWorkflow()
      await memex.automationPage.expectWorkflowTurnedOff()

      // The workflow can be turned on
      await memex.automationPage.toggleWorkflow()
      await memex.automationPage.expectWorkflowTurnedOn()
    })

    test('Clicking the Set block field opens a SelectPanel, the selected option can be changed, and it closes after selection or escape', async ({
      page,
      memex,
    }) => {
      await memex.automationPage.EDIT.click()
      // The default workflow should have 'Done' selected for the Set Status box
      await memex.automationPage.expectWorkflowSetFieldToHaveText('Status: Done')

      // Clicking the set Status anchor should open the SelectPanel with 4 Status options and 'Done' as the only option selected
      await memex.automationPage.openSetFieldMenu()
      await memex.automationPage.expectWorkflowSetFieldPickerMenuOptionCount(4)
      await memex.automationPage.expectWorkflowSetFieldMenuPickerSelectedOptionCount(1)
      await memex.automationPage.expectWorkflowSetFieldMenuPickerSelectedOptionToHaveText('Done')

      // Clicking the 'Ready' option should close the SelectPanel and update the Set Status box to show 'Ready'
      await memex.automationPage.setSetFieldMenuPickerOption('Ready')
      await memex.automationPage.expectWorkflowSetFieldMenuToBeClosed()
      await memex.automationPage.expectWorkflowSetFieldToHaveText('Status: Ready')

      // Reopening the SelectPanel now shows 'Ready' as the only option selected
      await memex.automationPage.openSetFieldMenu()
      await memex.automationPage.expectWorkflowSetFieldMenuPickerSelectedOptionCount(1)
      await memex.automationPage.expectWorkflowSetFieldMenuPickerSelectedOptionToHaveText('Ready')

      // Hitting the 'Escape' key closes the SelectPanel without any changes (still shows 'Status: Ready')
      await page.keyboard.down('Escape')
      await memex.automationPage.expectWorkflowSetFieldMenuToBeClosed()
      await memex.automationPage.expectWorkflowSetFieldToHaveText('Status: Ready')

      // Selecting the same option closes the SelectPanel deselects the option
      await memex.automationPage.openSetFieldMenu()
      await memex.automationPage.expectWorkflowSetFieldMenuPickerSelectedOptionCount(1)
      await memex.automationPage.clickWorkflowSetFieldMenuPickerSelectedOption()
      await memex.automationPage.expectWorkflowSetFieldMenuToBeClosed()
      await memex.automationPage.expectWorkflowSetFieldToHaveText('A value is required')
    })
  })

  test.describe('Edit workflow name', () => {
    test('Clicking on `edit` disables workflow name editing', async ({memex}) => {
      await memex.automationPage.EDIT.click()

      await expect(memex.automationPage.WORKFLOW_NAME_HEADING).toBeVisible()
      await expect(memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON).toBeHidden()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR).toBeHidden()
    })

    test('Clicking on the workflow name edit button enables workflow name editing', async ({memex}) => {
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()

      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR).toBeVisible()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT).toBeEditable()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_ERROR).toBeHidden()
    })

    test('Clicking on `Save` will save workflow name changes', async ({memex}) => {
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.fill('Updated workflow name')
      await memex.automationPage.WORKFLOW_NAME_EDITOR_SAVE_BUTTON.click()

      await expect(memex.automationPage.WORKFLOW_NAME_HEADING).toHaveText('Updated workflow name')
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR).toBeHidden()
    })

    test('Clicking on `Cancel` will discard workflow name changes', async ({memex}) => {
      const initialWorkflowName = await memex.automationPage.WORKFLOW_NAME_HEADING.textContent()

      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.fill('Updated workflow name')
      await memex.automationPage.WORKFLOW_NAME_EDITOR_CANCEL_BUTTON.click()

      await expect(memex.automationPage.WORKFLOW_NAME_HEADING).toHaveText(initialWorkflowName)
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR).toBeHidden()
    })

    test('Shows error message and prevents saving when name is empty', async ({memex}) => {
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.clear()

      await memex.automationPage.expectWorkflowNameError('Workflow name cannot be empty')
      await memex.automationPage.expectPreventWorkflowNameSave()
    })

    test('Shows error message and prevents saving when name is too long', async ({memex}) => {
      const randomTitle = 'random title'.repeat(25)
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.fill(randomTitle)

      await memex.automationPage.expectWorkflowNameError('Workflow name cannot be longer than 250 characters')
      await memex.automationPage.expectPreventWorkflowNameSave()
    })

    test('Shows error message and prevents saving when name already exists', async ({memex}) => {
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.fill('Auto-add to project')

      await memex.automationPage.expectWorkflowNameError('A workflow with this name already exists')
      await memex.automationPage.expectPreventWorkflowNameSave()
    })

    test('Does not show name duplication error with its own name', async ({memex}) => {
      const initialWorkflowName = await memex.automationPage.WORKFLOW_NAME_HEADING.textContent()
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.clear()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.fill(initialWorkflowName)

      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_ERROR).toBeHidden()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_SAVE_BUTTON).toBeEnabled()
    })

    test('Clicking on `Cancel` resets error state', async ({memex}) => {
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_INPUT.clear()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_ERROR).toBeVisible()
      await memex.automationPage.WORKFLOW_NAME_EDITOR_CANCEL_BUTTON.click()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_ERROR).toBeHidden()

      await expect(memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON).toBeVisible()
      await memex.automationPage.WORKFLOW_NAME_EDIT_BUTTON.click()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_ERROR).toBeHidden()
      await expect(memex.automationPage.WORKFLOW_NAME_EDITOR_SAVE_BUTTON).toBeEnabled()
    })
  })

  test.describe('Edit ', () => {
    test('Shows error message and disables saving when content type is empty', async ({memex}) => {
      await memex.automationPage.EDIT.click()

      const button = memex.automationPage.WORKFLOW_CONTENT_TYPE_BUTTON
      await button.click()

      const panel = memex.automationPage.WORKFLOW_CONTENT_TYPE_PANEL
      await panel.locator('[data-id=Issue]').first().click()
      await panel.locator('[data-id=PullRequest]').first().click()

      await expect(button).toHaveText('A type is required')
      await memex.automationPage.expectSaveToBeDisabled()
    })

    test('Clicking on `discard` will restore workflow enabled/disabled status', async ({memex}) => {
      // Make sure the workflow exists
      await memex.automationPage.EDIT.click()
      await memex.automationPage.SAVE.click()

      // The workflow stays on after discarding
      await memex.automationPage.expectWorkflowTurnedOn()
      await memex.automationPage.EDIT.click()
      await memex.automationPage.DISCARD.click()
      await memex.automationPage.expectWorkflowTurnedOn()

      // The workflow stays turned off after discarding
      await memex.automationPage.toggleWorkflow()
      await memex.automationPage.expectWorkflowTurnedOff()
      await memex.automationPage.EDIT.click()
      await memex.automationPage.DISCARD.click()
      await memex.automationPage.expectWorkflowTurnedOff()
    })
  })
})
