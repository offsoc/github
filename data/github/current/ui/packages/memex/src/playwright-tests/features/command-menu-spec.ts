import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'
import {testPlatformMeta} from '../helpers/utils'

test.describe(`Command Palette integration`, () => {
  test('see a prompt in staging if you use the command palette shortcut', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await page.keyboard.press(`${testPlatformMeta}+k`)

    const warningTitle = page.getByTestId('command_palette_warning_title')

    await expect(warningTitle).toBeVisible()
    await expect(warningTitle).toHaveText('Command palette not available in staging')
  })
})
