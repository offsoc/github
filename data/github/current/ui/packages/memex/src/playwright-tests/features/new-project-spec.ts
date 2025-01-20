import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'

test('shows an onboarding popover after closing the template dialog', async ({memex, page}) => {
  await memex.navigateToStory('integrationTestsEmpty')
  await page.getByLabel('Close').click()

  await expect(page.getByRole('heading', {name: 'Add your first item'})).toBeVisible()
  await page.getByRole('button', {name: 'Add item'}).click()

  await expect(memex.omnibar.INPUT).toBeFocused()
  await expect(memex.omnibar.discoverySuggestions.LIST).toBeVisible()
})

test('does not show an onboarding popover in the board view', async ({memex, page}) => {
  await memex.navigateToStory('integrationTestsEmpty', {viewType: 'board'})
  await page.getByLabel('Close').click()

  await expect(page.getByRole('heading', {name: 'Add your first item'})).toBeHidden()
})
