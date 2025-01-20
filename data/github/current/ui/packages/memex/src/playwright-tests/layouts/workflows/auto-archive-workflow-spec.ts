import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'

test.describe('Auto-archive workflow', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.topBarNavigation.navigateToAutomationPage()

    await memex.automationPage.navigateToAutoArchiveItemsTab()
  })

  test('Workflow actions should be rendered in order of priority', async ({memex}) => {
    // Check that blocks are rendered in the correct order
    const blockHeadings = await memex.automationPage.AUTOMATION_PAGE_LOCATOR.getByRole('heading', {
      level: 3,
    }).allTextContents()
    expect(blockHeadings).toEqual(['Filter items', 'Archive item'])

    // Disabled filter input should have the correct query
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('is:issue,pr is:closed')
  })

  test('Clicking on `Save and turn on workflow` creates and enables the workflow if user confirms', async ({memex}) => {
    // Initially, the workflow is in read-only mode
    await memex.automationPage.EDIT.click()
    // There should be matching items
    await memex.automationPage.expectMatchingItems()
    // Save and enable the workflow
    await memex.automationPage.SAVE.click()
    // The dialog should appear.
    await memex.automationPage.expectAutoArchiveConfirmationDialogToShow()
    // Confirm the dialog
    await memex.automationPage.DIALOG_SAVE_AND_ENABLE.click()
    // The workflow should be enabled
    await memex.automationPage.expectWorkflowTurnedOn()
  })

  test('Does nothing when user dismisses the confirmation dialog', async ({memex}) => {
    // Create a new workflow
    await memex.automationPage.createActiveWorkflow()
    await memex.automationPage.DIALOG_SAVE_AND_ENABLE.click()
    // Initially, the workflow is in read-only mode
    await memex.automationPage.EDIT.click()
    // There should be matching items
    await memex.automationPage.expectMatchingItems()
    // Save workflow
    await memex.automationPage.SAVE.click()
    // The dialog should appear.
    await memex.automationPage.expectAutoArchiveConfirmationDialogToShow()
    // Dismiss the dialog
    await memex.automationPage.DIALOG_CANCEL.click()
    // The workflow should still be in edit mode
    await expect(memex.automationPage.FILTER_INPUT).toBeEditable()
  })

  test('Clicking on `Save and turn on workflow` does not open a confirmation dialog when there are no matching items', async ({
    memex,
  }) => {
    // Initially, the workflow is in read-only mode
    await memex.automationPage.EDIT.click()
    // Edit and save query
    await memex.automationPage.updateAndSaveQuery('is:closed is:open')
    // There should be no matching items
    await memex.automationPage.expectNoMatchingItems(true)
    // Workflow is saved and enabled
    await memex.automationPage.expectWorkflowTurnedOn()
  })

  test('Disabling workflow does not open a confirmation dialog when there are matching items', async ({memex}) => {
    // Initially, the workflow is in read-only mode
    await memex.automationPage.EDIT.click()
    // There should be matching items
    await memex.automationPage.expectMatchingItems()
    // Save and enable the workflow
    await memex.automationPage.SAVE.click()
    // The dialog should appear.
    await memex.automationPage.expectAutoArchiveConfirmationDialogToShow()
    // Confirm the dialog
    await memex.automationPage.DIALOG_SAVE_AND_ENABLE.click()
    // The workflow should be enabled
    await memex.automationPage.expectWorkflowTurnedOn()
    // Turn the workflow off
    await memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR.click()
    // Dialog should not appear
    await memex.automationPage.expectAutoArchiveConfirmationDialogToNotShow()
    // The workflow should be disabled
    await memex.automationPage.expectWorkflowTurnedOff()
  })

  test('Discard does not enable the workflow, and disables edit', async ({memex}) => {
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
    await expect(memex.automationPage.EDIT).toBeVisible()
    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.DISCARD).toBeVisible()
    await memex.automationPage.DISCARD.click()
    await expect(memex.automationPage.ENABLE_WORKFLOW_TOGGLE_LOCATOR).toBeHidden()
  })

  test('Discarding changes restores data that was present before changes', async ({memex}) => {
    // to create the workflow
    await memex.automationPage.EDIT.click()
    await memex.automationPage.SAVE.click()
    await memex.automationPage.DIALOG_SAVE_AND_ENABLE.click()
    await memex.automationPage.expectWorkflowTurnedOn()

    await memex.automationPage.EDIT.click()
    await expect(memex.automationPage.FILTER_INPUT_COUNT).toContainText('3')

    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.FILTER_INPUT.click()
    await memex.automationPage.FILTER_INPUT.fill('abc:xyz')
    await expect(memex.automationPage.FILTER_INPUT_COUNT).toContainText('0')

    await memex.automationPage.DISCARD.click()
    await memex.automationPage.expectWorkflowTurnedOn()
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue('is:issue,pr is:closed')
    await expect(memex.automationPage.DISABLED_FILTER_INPUT_COUNT).toContainText('3')
  })

  test('Discarding after saving will revert to the most recently saved changes', async ({memex}) => {
    // to create the persisted workflow
    await memex.automationPage.EDIT.click()
    await memex.automationPage.SAVE.click()
    await memex.automationPage.DIALOG_SAVE_AND_ENABLE.click()
    await memex.automationPage.expectWorkflowTurnedOn()

    // update query and save the workflow
    await memex.automationPage.EDIT.click()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.updateAndSaveQuery('reason:"not planned"')
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue(/reason:"not planned"/)

    await memex.automationPage.EDIT.click()
    await memex.automationPage.CLEAR_FILTER_QUERY.click()
    await memex.automationPage.FILTER_INPUT.click()
    await memex.automationPage.FILTER_INPUT.type('reason:completed')
    await memex.automationPage.DISCARD.click()
    await memex.automationPage.expectWorkflowTurnedOn()
    // query gets formatted to contain the content types if they're not present
    await expect(memex.automationPage.DISABLED_FILTER_INPUT).toHaveValue(/is:issue,pr reason:"not planned"/)

    await memex.automationPage.toggleWorkflow()
    await memex.automationPage.expectWorkflowTurnedOff()
    await memex.automationPage.EDIT.click()
    await memex.automationPage.DISCARD.click()
    await memex.automationPage.expectWorkflowTurnedOff()
  })

  test('Typing in search block should show only `is` and `reason` and `last updated` suggestions', async ({
    memex,
    page,
  }) => {
    await memex.automationPage.EDIT.click()

    // should show `is` and `reason` and `last updated` suggestions
    await memex.automationPage.FILTER_INPUT.fill('i')
    await mustFind(page, _('search-suggestions-box'))
    await expect(page.getByTestId('search-suggestions-box')).toHaveText('is:')

    await memex.automationPage.FILTER_INPUT.fill('r')
    await mustFind(page, _('search-suggestions-box'))
    await expect(page.getByTestId('search-suggestions-box')).toHaveText('reason:')

    await memex.automationPage.FILTER_INPUT.fill('l')
    await mustFind(page, _('search-suggestions-box'))
    await expect(page.getByTestId('search-suggestions-box')).toHaveText('last updated:')

    await memex.automationPage.FILTER_INPUT.fill('d')
    await mustNotFind(page, _('search-suggestions-box'))

    await memex.automationPage.FILTER_INPUT.fill('n')
    await mustNotFind(page, _('search-suggestions-box'))

    // should not display type: filter suggestion
    await memex.automationPage.FILTER_INPUT.fill('t')
    await mustNotFind(page, _('search-suggestions-box'))
  })

  test('Typing `-` in search block should show `is` and `reason` and `last updated` suggestions', async ({
    memex,
    page,
  }) => {
    await memex.automationPage.EDIT.click()

    // should show `is` and `reason` and `last updated` suggestions
    await memex.automationPage.FILTER_INPUT.fill('-')
    await mustFind(page, _('search-suggestions-box'))
    await expect(page.getByTestId('search-suggestions-box')).toContainText('is:')
    await expect(page.getByTestId('search-suggestions-box')).toContainText('reason:')
    await expect(page.getByTestId('search-suggestions-box')).toContainText('last updated:')
    await expect(page.getByTestId('search-suggestions-box')).not.toContainText('no:')

    await memex.automationPage.FILTER_INPUT.fill('-i')
    await mustFind(page, _('search-suggestions-box'))
    await expect(page.getByTestId('search-suggestions-box')).toHaveText('is:')

    await memex.automationPage.FILTER_INPUT.fill('-r')
    await expect(page.getByTestId('search-suggestions-box')).toHaveText('reason:')

    await memex.automationPage.FILTER_INPUT.fill('-l')
    await expect(page.getByTestId('search-suggestions-box')).toHaveText('last updated:')

    await memex.automationPage.FILTER_INPUT.fill('-d')
    await mustNotFind(page, _('search-suggestions-box'))

    await memex.automationPage.FILTER_INPUT.fill('-t')
    await mustNotFind(page, _('search-suggestions-box'))
  })

  test('Search block should suggest values for keywords', async ({memex, page}) => {
    await memex.automationPage.EDIT.click()

    await memex.automationPage.FILTER_INPUT.fill('is:')
    await mustFind(page, _('search-suggestions-box'))
    await expect(page.getByTestId('search-suggestions-box')).toContainText('open')
  })

  test('Search block should suggest values for keyword `updated`', async ({memex, page}) => {
    await memex.automationPage.EDIT.click()

    await memex.automationPage.FILTER_INPUT.fill('updated:')
    await mustFind(page, _('search-suggestions-box'))

    const suggestionBox = page.getByTestId('search-suggestions-box')
    await expect(suggestionBox).toContainText('<@today-7d')
    await expect(suggestionBox).toContainText('<@today-2w')
    await expect(suggestionBox).toContainText('<@today-1m')
  })

  test('Search block should not suggest values for columns', async ({memex, page}) => {
    await memex.automationPage.EDIT.click()

    await memex.automationPage.FILTER_INPUT.fill('label:')
    await mustNotFind(page, _('search-suggestions-box'))
  })

  test('Typing unsupported column filters shows an error tooltip and disables the save button', async ({memex}) => {
    await memex.automationPage.EDIT.click()

    // free text is allowed
    await memex.automationPage.FILTER_INPUT.fill('    bug fix')
    await expect(memex.automationPage.SAVE).toBeEnabled()

    // last-updated: is allowed
    await memex.automationPage.FILTER_INPUT.fill('last-updated:7day')
    await expect(memex.automationPage.SAVE).toBeEnabled()

    // updated: is allowed
    await memex.automationPage.FILTER_INPUT.fill('updated:<@today-2m')
    await expect(memex.automationPage.SAVE).toBeEnabled()

    await memex.automationPage.FILTER_INPUT.fill('status:done')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getFieldErrorTooltip('status')).toHaveCount(1)
    await expect(memex.automationPage.SAVE).toBeDisabled()

    await memex.automationPage.FILTER_INPUT.fill('-label:blocker')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getFieldErrorTooltip('label')).toHaveCount(1)
    await expect(memex.automationPage.SAVE).toBeDisabled()
  })

  test('Filter should update count', async ({memex, page}) => {
    await memex.automationPage.EDIT.click()

    await memex.automationPage.FILTER_INPUT.fill('last-updated:7day')
    let resultsCountElement = await mustFind(page, _('filter-results-count'))
    expect(await resultsCountElement.textContent()).toEqual('6')

    await memex.automationPage.FILTER_INPUT.fill('updated:<@today-7d')
    resultsCountElement = await mustFind(page, _('filter-results-count'))
    expect(await resultsCountElement.textContent()).toEqual('6')

    await memex.automationPage.FILTER_INPUT.fill('-last-updated:7day')
    resultsCountElement = await mustFind(page, _('filter-results-count'))
    expect(await resultsCountElement.textContent()).toEqual('1')

    await memex.automationPage.FILTER_INPUT.fill('-updated:<@today-7d')
    resultsCountElement = await mustFind(page, _('filter-results-count'))
    expect(await resultsCountElement.textContent()).toEqual('1')
  })

  test('Invalid syntax for `updated` should be warned', async ({memex}) => {
    await memex.automationPage.EDIT.click()

    await memex.automationPage.FILTER_INPUT.fill('updated:@today-7d')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getUpdatedValueErrorTooltip()).toHaveCount(1)

    await memex.automationPage.FILTER_INPUT.fill('updated:<@today+7d')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getUpdatedValueErrorTooltip()).toHaveCount(1)

    await memex.automationPage.FILTER_INPUT.fill('updated:<@today-7')
    await expect(memex.automationPage.ERROR_UNDERLINE).toBeVisible()
    await expect(memex.automationPage.getUpdatedValueErrorTooltip()).toHaveCount(1)
  })

  test('Filter shows validation message when the query is empty', async ({memex}) => {
    await memex.automationPage.EDIT.click()

    await memex.automationPage.FILTER_INPUT.fill('last-updated:7day')
    await expect(memex.automationPage.EMPTY_QUERY_ERROR).toBeHidden()

    await memex.automationPage.FILTER_INPUT.fill('')
    await expect(memex.automationPage.EMPTY_QUERY_ERROR).toBeVisible()
  })
})
