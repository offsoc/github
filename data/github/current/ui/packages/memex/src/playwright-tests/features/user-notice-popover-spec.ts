import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'
import {getTableColumnHeaderNames} from '../helpers/table/selectors'

test.describe('User notice popover', () => {
  test.describe('Issue type rename prompt', () => {
    test('should not display the dismissable prompt on projects without user notice', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeHidden()
    })

    test('should display the dismissable prompt on projects with user notice', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      const dismiss = popover.getByRole('button', {name: 'I’ll do it later'})
      await dismiss.click()

      await expect(popover).toBeHidden()
    })

    test('should hide the popover if sidepanel opens', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      await memex.sidePanel.openBulkAddSidePanel()

      await expect(popover).toBeHidden()
    })

    test('should hide the prompt if the view options menu trigger is clicked', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      await memex.viewOptionsMenu.open()

      await expect(popover).toBeHidden()
    })

    test('should open the rename prompt when clicking "Get Started"', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      const getStarted = popover.getByRole('button', {name: 'Get Started'})
      await getStarted.click()

      const renameDialog = page.getByRole('dialog', {name: 'Set up issue types in your project'})
      await expect(renameDialog).toBeVisible()
    })

    test('reopens the popover if the prompt is dismissed', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      const getStarted = popover.getByRole('button', {name: 'Get Started'})
      await getStarted.click()

      const renameDialog = page.getByRole('dialog', {name: 'Set up issue types in your project'})
      await expect(renameDialog).toBeVisible()

      await expect(popover).toBeHidden()

      const cancelButton = renameDialog.getByRole('button', {name: 'Cancel'})
      await cancelButton.click()

      await expect(renameDialog).toBeHidden()
      await expect(popover).toBeVisible()
    })

    test('rename dialog requires valid input', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      const getStarted = popover.getByRole('button', {name: 'Get Started'})
      await getStarted.click()

      const renameDialog = page.getByRole('dialog', {name: 'Set up issue types in your project'})
      await expect(renameDialog).toBeVisible()

      const input = renameDialog.getByRole('textbox')
      await expect(input).toBeVisible()
      await input.clear()
      await expect(input).toHaveAttribute('aria-invalid', 'false')

      const confirm = renameDialog.getByRole('button', {name: 'Finish setup'})
      await confirm.click()

      await expect(input).toHaveAttribute('aria-invalid', 'true')
      await expect(renameDialog.getByText('Title cannot be blank')).toBeVisible()

      await input.fill('Type')
      await expect(input).toHaveAttribute('aria-invalid', 'true')

      await input.fill('Custom Type')
      await expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    test('should rename type field when finishing setup', async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithIssueTypeRenamePopover')

      const columnNamesBefore = await getTableColumnHeaderNames(page)
      expect(columnNamesBefore).toContain('Type')

      const popover = page.getByTestId('user-notice-popover')
      await expect(popover).toBeVisible()

      const getStarted = popover.getByRole('button', {name: 'Get Started'})
      await getStarted.click()

      const renameDialog = page.getByRole('dialog', {name: 'Set up issue types in your project'})
      await expect(renameDialog).toBeVisible()

      const input = renameDialog.getByRole('textbox')
      await expect(input).toHaveValue('Custom Type')

      const confirm = renameDialog.getByRole('button', {name: 'Finish setup'})
      await confirm.click()

      await expect(renameDialog).toBeHidden()
      await expect(popover).toBeHidden()

      const columnNamesAfter = await getTableColumnHeaderNames(page)
      expect(columnNamesAfter).toContain('Custom Type')
      expect(columnNamesAfter).not.toContain('Type')
    })
  })
})
