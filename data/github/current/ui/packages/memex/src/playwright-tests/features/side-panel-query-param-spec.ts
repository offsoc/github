import {expect} from '@playwright/test'

import {test} from '../fixtures/test-extended'

test.describe('Side panel query params', () => {
  test('it opens project info pane', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      paneState: {
        pane: 'info',
      },
    })

    await expect(memex.sidePanel.PROJECT_SIDE_PANEL).toBeVisible()
  })

  /**
   * Item is deprecated, but we're keeping this test to make sure it still works
   */
  for (const pane of ['item', 'issue'] as const) {
    test(`when param is ${pane} it opens when the item is in the project and reopens when navigating back`, async ({
      memex,
      page,
    }) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        paneState: {
          pane,
          itemId: 2,
        },
      })

      const sidePanel = memex.sidePanel.getIssueSidePanel(
        "This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!",
      )
      await expect(sidePanel).toBeVisible()
      await page.waitForURL(/pane=issue/)
      await page.keyboard.press('Escape')
      await expect(sidePanel).toBeHidden()
      await page.goBack()
      await expect(sidePanel).toBeVisible()
      await page.waitForURL(/pane=issue/)
    })

    test(`when param is ${pane} it is not opened if the item id is not in the project`, async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        paneState: {
          pane,
          itemId: -123123,
        },
      })

      await Promise.all([
        memex.toasts.expectErrorMessageVisible('not in the project'),
        memex.sidePanel.expectSidePanelNotToBeVisible(),
      ])

      expect(page.url()).not.toContain('pane=')
    })
  }

  test('it opens the bulk add panel', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      paneState: {
        pane: 'bulk-add',
      },
    })

    await memex.sidePanel.expectBulkAddSidePanelToBeVisible()
  })

  test('it does not open the bulk add panel in readonly mode', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode', {
      paneState: {
        pane: 'bulk-add',
      },
    })

    await memex.sidePanel.expectBulkAddSidePanelNotToBeVisible()
    expect(page.url()).not.toContain('pane=bulk-add')
  })
})
