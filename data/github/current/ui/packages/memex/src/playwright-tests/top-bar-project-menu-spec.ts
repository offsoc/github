import {expect} from '@playwright/test'

import {test} from './fixtures/test-extended'

test.describe('Project menu tests', () => {
  test('Copy as template button should show on the project menu', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestCustomTemplatesCanCopyAsTemplate')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()

    await expect(page.getByTestId('copy-as-template-button')).toBeVisible()
  })

  test('Copy as template button should be hidden on the project menu', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestCustomTemplates')
    await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()

    await expect(page.getByTestId('copy-as-template-button')).toBeHidden()
  })
})
