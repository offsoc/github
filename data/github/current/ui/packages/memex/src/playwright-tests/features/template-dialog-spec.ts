import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'

test('can apply template via keyboard', async ({memex, page}) => {
  await memex.navigateToStory('integrationTestMemexTemplates')

  await expect(memex.templateDialog.NEW_DIALOG).toBeVisible()
  await expect(memex.templateDialog.NEW_CLOSE_BUTTON).toBeFocused()
  // Tabbing several times to get to the first interactable template
  const templateLink = memex.templateDialog.NEW_TEMPLATE_LINK('Team planning').first()
  await expect(templateLink).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(templateLink).toBeFocused()

  // Pressing enter should take you to the template details
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', {name: 'Team planning'})).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(memex.templateDialog.NAME_INPUT).toBeFocused()
  await page.keyboard.type('A totally different project title')

  // Activating the apply template button should close the dialog and apply the template
  await page.keyboard.press('Tab')
  await expect(memex.templateDialog.NEW_APPLY_TEMPLATE_BUTTON).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(memex.templateDialog.NEW_DIALOG).toBeHidden()
  await expect(page.getByRole('heading', {name: 'A totally different project title'})).toBeVisible()
})

test('can apply "from scratch" layout templates', async ({page, memex}) => {
  await memex.navigateToStory('integrationTestMemexTemplates')

  await expect(memex.templateDialog.NEW_DIALOG).toBeVisible()

  // Open the template details
  await page.getByRole('link', {name: 'Board'}).click()
  await expect(page.getByRole('heading', {name: 'New board'})).toBeVisible()
  await memex.templateDialog.NAME_INPUT.type('A totally different project title')
  await memex.templateDialog.NEW_APPLY_TEMPLATE_BUTTON.click()
  await expect(memex.templateDialog.NEW_DIALOG).toBeHidden()

  await memex.boardView.expectVisible()
  await expect(page.getByRole('heading', {name: 'A totally different project title'})).toBeVisible()
  await expect(memex.views.VIEW_TABS).toHaveCount(1)
  await expect(memex.views.VIEW_TABS.nth(0)).toHaveText('View 1')

  // no param because the template is applied and view is saved
  memex.expectQueryParams([{name: 'layout', expectedValue: null}])

  await memex.stats.expectStatsToContain({
    memexProjectViewNumber: 1,
    name: 'templates_create',
    context: JSON.stringify({template: 'board'}),
    ui: 'template_dialog',
  })
})

test('can close dialog without applying template', async ({page, memex}) => {
  await memex.navigateToStory('integrationTestMemexTemplates')
  await expect(memex.templateDialog.NEW_DIALOG).toBeVisible()
  await expect(memex.templateDialog.NEW_CLOSE_BUTTON).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(memex.templateDialog.NEW_DIALOG).toBeHidden()

  await memex.stats.expectStatsToContain({
    name: 'templates_cancel',
  })
})

test('can search for templates', async ({memex, page}) => {
  await memex.navigateToStory('integrationTestMemexTemplates')

  await expect(memex.templateDialog.NEW_DIALOG).toBeVisible()

  await memex.templateDialog.NEW_SEARCH_INPUT.fill('team')

  // Should get 3 results: 1 featured template + 2 org templates
  await expect(page.getByRole('heading', {name: '3 results'})).toBeVisible()
  await expect(page.getByRole('heading', {name: 'Featured'})).toBeVisible()
  await expect(memex.templateDialog.NEW_TEMPLATE_LINK('Team planning').nth(0)).toBeVisible()
  // There are multiple headings with the same name, but only the second is visible.
  // The first has the `sr-only` class, so it is hidden for non-screen-reader users.
  await expect(page.getByRole('heading', {name: 'From your organization'}).nth(1)).toBeVisible()
  await expect(memex.templateDialog.NEW_TEMPLATE_LINK('Team retrospective')).toBeVisible()
  await expect(memex.templateDialog.NEW_TEMPLATE_LINK('Team planning').nth(1)).toBeVisible()

  // Clicking on the "featured" tab should show only the featured templates
  await memex.templateDialog.NEW_DIALOG.getByRole('link', {name: 'Featured'}).click()
  await expect(page.getByRole('heading', {name: '1 result'})).toBeVisible()
  await expect(page.getByRole('heading', {name: 'Featured'})).toBeHidden()
  await expect(memex.templateDialog.NEW_TEMPLATE_LINK('Team planning')).toBeVisible()

  // Clicking on the "organization templates" tab should show only the org templates
  await memex.templateDialog.NEW_DIALOG.getByRole('link', {name: 'From your organization'}).click()
  await expect(page.getByRole('heading', {name: '2 results'})).toBeVisible()
  await expect(page.getByRole('heading', {name: 'From your organization'})).toBeHidden()
  await expect(memex.templateDialog.NEW_TEMPLATE_LINK('Team retrospective')).toBeVisible()
  await expect(memex.templateDialog.NEW_TEMPLATE_LINK('Team planning')).toBeVisible()

  // Can click the "clear input" button to clear the search
  await memex.templateDialog.NEW_SEARCH_INPUT_CLEAR_BUTTON.click()
  await expect(memex.templateDialog.NEW_SEARCH_INPUT).toHaveValue('')
})

test('only shows the featured templates tab for user-owned projects', async ({memex}) => {
  await memex.navigateToStory('integrationTestsEmptyUserOwned')

  await expect(memex.templateDialog.NEW_DIALOG).toBeVisible()

  // Only the "Featured" tab should be visible
  const tabs = await memex.templateDialog.NEW_DIALOG.getByRole('list', {name: 'Project templates'})
    .getByRole('listitem')
    .allTextContents()
  expect(tabs).toEqual(['Featured'])

  // The "Featured" navlist item should be the current one
  const featured = memex.templateDialog.NEW_DIALOG.getByRole('link', {name: 'Featured'})
  await expect(featured).toHaveAttribute('aria-current', 'page')
})

test('applying template with async draft item copy shows toast and does not autofocus omnibar', async ({
  memex,
  page,
}) => {
  await memex.navigateToStory('integrationTestMemexTemplates')

  await expect(memex.templateDialog.NEW_DIALOG).toBeVisible()
  await expect(memex.templateDialog.NEW_CLOSE_BUTTON).toBeFocused()

  await memex.templateDialog.NEW_DIALOG.getByRole('link', {name: 'Template with faked async drafts'}).click()
  await expect(page.getByRole('heading', {name: 'Template with faked async drafts'})).toBeVisible()
  await memex.templateDialog.NEW_APPLY_TEMPLATE_BUTTON.click()
  await expect(memex.templateDialog.NEW_DIALOG).toBeHidden()
  await memex.toasts.expectErrorMessageVisible('Copying draft issues to your new project.')
  await expect(memex.omnibar.INPUT).not.toBeFocused()
})
