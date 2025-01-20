import {test} from '../../fixtures/test-extended'
import {testPlatformMeta} from '../../helpers/utils'

test.describe('View save shortcut', () => {
  test('meta+s on a dirty view saves it', async ({memex, page}) => {
    // Visit the URL again, but use the "table" URL param
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.viewOptionsMenu.expectViewStateIsDirty()

    await page.keyboard.press(`${testPlatformMeta}+s`)

    await memex.viewOptionsMenu.expectViewStateNotDirty()
  })
  test('meta+s on a clean view does not error', async ({memex, page}) => {
    // Visit the URL again, but use the "table" URL param
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.viewOptionsMenu.expectViewStateNotDirty()

    await page.keyboard.press(`${testPlatformMeta}+s`)

    await memex.viewOptionsMenu.expectViewStateNotDirty()
  })
})
