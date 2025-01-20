import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'
import {submitConfirmDialog} from '../helpers/dom/interactions'

test.describe('archive page', () => {
  test('shows archived items', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const row1 = memex.tableView.rows.getRow(1)
    await row1.CONTEXT_MENU.TRIGGER.click()
    await row1.CONTEXT_MENU.ACTION_ARCHIVE.click()
    await submitConfirmDialog(page, 'Archive')

    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
    await memex.topBarNavigation.ARCHIVE_PAGE_BUTTON.click()
    await expect(memex.archivePage.PAGE.locator('text="1 archived item"')).toBeVisible()
  })
  test('allows archived items to be restored', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})

    const itemName = 'Improve the archived items page (ARCHIVE)'
    const item = page.locator(`li:has-text("${itemName}")`)
    await expect(item).toBeVisible()

    await item.getByRole('button', {name: 'Open item actions'}).click()
    await page.getByRole('menuitem', {name: 'Restore'}).click()

    await expect(item).toBeHidden()
    await memex.topBarNavigation.RETURN_TO_PROJECT_VIEW.click()

    await expect(page.locator(`text="${itemName}"`)).toBeVisible()
  })
  test.fixme('can select all items', async ({memex}) => {
    // https://github.com/github/memex/issues/9151
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})

    await memex.archivePage.FILTER_INPUT.type('is:open')
    await expect(memex.archivePage.PAGE.locator('text=/\\d+ archived items/')).toBeVisible()
    await expect(memex.archivePage.PAGE.locator('text=/Filter on all/')).toBeVisible()

    // Should be able to select all items in the list
    await expect(memex.archivePage.SELECT_ALL_CHECKBOX).not.toBeChecked()
    await memex.archivePage.SELECT_ALL_CHECKBOX.click()
    await expect(memex.archivePage.SELECT_ALL_CHECKBOX).toBeChecked()

    // Select a single item to deselect should make the selection partial
    await memex.archivePage.ITEM.first().locator('input[type="checkbox"]').click()
    await expect(memex.archivePage.SELECT_ALL_CHECKBOX).not.toBeChecked()
    await expect(memex.archivePage.SELECT_ALL_CHECKBOX).toHaveAttribute('aria-checked', 'mixed')
  })
  test('filtering items will reset the selected items', async ({memex}) => {
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})

    await memex.archivePage.SELECT_ALL_CHECKBOX.click()
    await memex.archivePage.FILTER_INPUT.type('is:closed')
    await expect(memex.archivePage.SELECT_ALL_CHECKBOX).not.toBeChecked()
  })
  test('tells you when you are not filtering on all items', async ({memex}) => {
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})

    await memex.archivePage.FILTER_INPUT.type('status:ready')
    await expect(memex.archivePage.PAGE.locator('text="Only filtering on most recently archived"')).toBeVisible()
    await memex.archivePage.PAGE.locator('text="Filter on all"').click()
    await expect(memex.archivePage.PAGE.locator('text="Only filtering on most recently archived"')).toBeHidden()
  })
  test.fixme('tells you when you are not selecting on all items', async ({memex}) => {
    // https://github.com/github/memex/issues/9151
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})

    await memex.archivePage.SELECT_ALL_CHECKBOX.click()
    await expect(
      memex.archivePage.PAGE.locator('text="Only selecting results from most recently archived"'),
    ).toBeVisible()
    await memex.archivePage.PAGE.locator('text="Select all"').click()
    await expect(
      memex.archivePage.PAGE.locator('text="Only selecting results from most recently archived"'),
    ).toBeHidden()
  })

  test('disables bulk restore when it would exceed the project item limit', async ({memex}) => {
    // NOTE: Due to the way JSON island data must be set, the project item limit is small
    // for the whole test suite, but it is intended to only affect these item limit tests.
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})
    await memex.archivePage.SELECT_ALL_CHECKBOX.click()
    await expect(memex.archivePage.PAGE.locator('button:has-text("Restore unavailable")')).toBeDisabled()
  })

  test('disables individual restore when it would exceed the project item limit', async ({page, memex}) => {
    // NOTE: Due to the way JSON island data must be set, the project item limit is small
    // for the whole test suite, but it is intended to only affect these item limit tests.
    await memex.navigateToStory('integrationTestArchivePage', {testIdToAwait: 'archive-page'})
    // Select the first two items in the list
    await memex.archivePage.PAGE.locator('input[type="checkbox"] >> nth=1').click()
    await memex.archivePage.PAGE.locator('input[type="checkbox"] >> nth=2').click()
    // Restore those items, now the project should be full
    await memex.archivePage.PAGE.locator('button:has-text("Restore")').click()
    // Should no longer be able to restore via the action menu
    const itemName = 'Issues with loading archived items (ARCHIVE)'
    const item = page.locator(`li:has-text("${itemName}")`)
    await item.getByRole('button', {name: 'Open item actions'}).click()
    await expect(page.getByRole('menuitem', {name: 'Restore unavailable'})).toBeDisabled()
    await expect(page.getByRole('menuitem', {name: 'This will exceed the 10 project item limit'})).toBeDisabled()
  })
})
