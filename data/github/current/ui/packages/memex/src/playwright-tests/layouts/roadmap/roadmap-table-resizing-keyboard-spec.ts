import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustGetCenter} from '../../helpers/dom/interactions'

test.describe('roadmap table resizing', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithRoadmapLayout')
  })

  test('can use keyboard to drag from the roadmap header sash', async ({memex, page}) => {
    const sash = memex.roadmapPage.ROADMAP_HEADER_DRAG_SASH.first()
    const {x: initialTableWidth} = await mustGetCenter(sash)
    await sash.press('Enter')

    await page.keyboard.press('ArrowRight')

    expect((await mustGetCenter(sash)).x).toBeGreaterThan(initialTableWidth)

    await page.keyboard.press('ArrowLeft')

    expect((await mustGetCenter(sash)).x).toBeCloseTo(initialTableWidth, -1)

    await page.keyboard.press('ArrowLeft')

    expect((await mustGetCenter(sash)).x).toBeLessThan(initialTableWidth)
  })

  test('escape cancels keyboard resizing', async ({memex, page}) => {
    const sash = memex.roadmapPage.ROADMAP_HEADER_DRAG_SASH.first()
    const {x: initialTableWidth} = await mustGetCenter(sash)
    await sash.press('Enter')

    await page.keyboard.press('ArrowRight')

    expect((await mustGetCenter(sash)).x).toBeGreaterThan(initialTableWidth)

    await page.keyboard.press('Escape')

    expect((await mustGetCenter(sash)).x).toBe(initialTableWidth)
  })

  test('enter persists keyboard resizing', async ({memex, page}) => {
    const sash = memex.roadmapPage.ROADMAP_HEADER_DRAG_SASH.first()
    const {x: initialTableWidth} = await mustGetCenter(sash)
    await sash.press('Enter')

    await page.keyboard.press('ArrowRight')

    const newX = (await mustGetCenter(sash)).x
    expect(newX).toBeGreaterThan(initialTableWidth)

    await page.keyboard.press('Enter')

    expect((await mustGetCenter(sash)).x).toBe(newX)
  })

  test('tab persists keyboard resizing', async ({memex, page}) => {
    const sash = memex.roadmapPage.ROADMAP_HEADER_DRAG_SASH.first()
    const {x: initialTableWidth} = await mustGetCenter(sash)
    await sash.press('Enter')

    await page.keyboard.press('ArrowRight')

    const newX = (await mustGetCenter(sash)).x
    expect(newX).toBeGreaterThan(initialTableWidth)

    await page.keyboard.press('Tab')

    expect((await mustGetCenter(sash)).x).toBe(newX)
  })
})
