import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('Roadmap sidepanel', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithRoadmapLayout')
  })

  test('side panel opens on click and returns focus to the pill', async ({memex, page}) => {
    const pill = memex.roadmapPage.getPill({name: /Today/})
    await pill.visiblePill.locator.click()

    await expect(memex.sidePanel.getIssueSidePanel('Today')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(memex.sidePanel.getIssueSidePanel('Today')).toBeHidden()
    await pill.visiblePill.expectToHaveFocus()
  })

  test('side panel opens on Space and returns focus to the pill', async ({memex, page}) => {
    const pill = memex.roadmapPage.getPill({name: /Today/})
    await pill.visibleLink.focus()
    await page.keyboard.press('Space')

    await expect(memex.sidePanel.getIssueSidePanel('Today')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(memex.sidePanel.getIssueSidePanel('Today')).toBeHidden()
    await pill.visiblePill.expectToHaveFocus()
  })
})
