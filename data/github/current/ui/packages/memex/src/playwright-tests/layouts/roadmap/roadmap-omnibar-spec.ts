import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {cellTestId} from '../../helpers/table/selectors'

test.describe('Roadmap Omnibar', () => {
  test('omnibar is rendered inside of a fixed container', async ({page, memex}) => {
    await memex.navigateToStory('appWithRoadmapLayout')

    await expect(page.getByTestId('omnibar-container')).toBeVisible()
    await expect(page.getByTestId('omnibar')).toBeVisible()
  })

  test('fixed omnibar container should be hidden when grouped', async ({page, memex}) => {
    await memex.navigateToStory('appWithRoadmapLayout', {
      groupedBy: {
        columnId: 'Status',
      },
      filterQuery: 'label:blocker',
    })
    await expect(page.getByTestId('omnibar-container')).toBeHidden()
  })

  test('new draft issues can be added', async ({page, memex}) => {
    await memex.navigateToStory('appWithRoadmapLayout')
    const initialCount = await memex.roadmapPage.ROADMAP_ITEM_ROWS.count()

    await memex.omnibar.focusAndEnterText('Draft issue')
    await page.keyboard.press('Enter')

    await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(initialCount + 1)
    await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS.getByTestId(cellTestId(initialCount, 'Title'))).toHaveText(
      'Draft issue',
      {useInnerText: true},
    )
  })

  test('does not error when adding items past the viewport', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await page.getByRole('link', {name: 'Roadmap'}).click()
    await memex.templateDialog.NEW_APPLY_TEMPLATE_BUTTON.click()

    await page.setViewportSize({
      width: 768,
      height: 400,
    })

    await expect(memex.templateDialog.NAME_INPUT).toBeHidden()
    await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(0)

    await memex.omnibar.focusAndEnterText('Draft issue')
    await page.keyboard.press('Enter')
    await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(1)

    await memex.omnibar.focusAndEnterText('Draft issue')
    await page.keyboard.press('Enter')
    await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(2)

    await memex.omnibar.focusAndEnterText('Draft issue')
    await page.keyboard.press('Enter')
    await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(3)
  })

  test('items added from grouped omnibar have their default field attrs set', async ({page, memex}) => {
    await memex.navigateToStory('appWithRoadmapLayout', {
      groupedBy: {
        columnId: 'Status',
      },
    })
    const group = page.getByTestId('roadmap-group-Backlog')
    const rows = group.locator(
      '[role="row"]:not([data-testid="roadmap-omnibar-item"]):not([data-testid="roadmap-group-header-row"])',
    )
    const initialCount = await rows.count()
    const omnibar = group.getByTestId('repo-searcher-input')

    await omnibar.focus()
    await omnibar.fill('Draft issue')
    await page.keyboard.press('Enter')

    await expect(rows).toHaveCount(initialCount + 1)
    await expect(rows.getByTestId(cellTestId(initialCount, 'Title'))).toHaveText('Draft issue', {useInnerText: true})
  })
})
