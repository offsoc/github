import {expect, type Page} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind} from '../../helpers/dom/assertions'
import {waitForTitle} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {columnHeaderTestId} from '../../helpers/table/selectors'
import {waitForFunction} from '../../helpers/utils'
import type {HTMLOrSVGElementHandle} from '../../types/dom'

/** Drag the given target by `dx` pixels horizontally and `dy` pixels vertically. */
async function drag(page: Page, target: HTMLOrSVGElementHandle, dx = 0, dy = 0, up = true) {
  await target.dispatchEvent('mousedown')
  await page.mouse.move(dx, dy)
  if (up) await page.mouse.up()
}

async function getTitleColumnHeader(page: Page) {
  return mustFind(page, _(columnHeaderTestId('Title')))
}

async function getTitleColumnWidth(page: Page) {
  // Calculate the initial width of the title column.
  const titleColumnHeader = await getTitleColumnHeader(page)
  const {width} = await titleColumnHeader.boundingBox()

  return width
}

async function resizeColumnWidth(page: Page, x?: number, y?: number, endDragEvent = true) {
  const titleColumnResizer = await mustFind(page, _('Title-column-resizer'))

  // Move the resize handle
  await drag(page, titleColumnResizer, x, y, endDragEvent)
}

function waitForResize(page: Page, expectedWidth: number) {
  return waitForFunction(async () => {
    const nextTitleWidth = await getTitleColumnWidth(page)
    return nextTitleWidth === expectedWidth
  })
}

test.describe('Column resizing', () => {
  test('a column can be resized via a drag motion', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    // Calculate the initial width of the title column.
    const startingTitleWidth = await getTitleColumnWidth(page)

    await resizeColumnWidth(page, 100)

    // Confirm that the column was actually resized.
    const resisized = await waitForResize(page, startingTitleWidth + 100)
    expect(resisized).toBeTruthy()
  })

  test('a column cannot be resized if user does not have write permissions', async ({page, memex}) => {
    // navigating to readonly project
    await memex.navigateToStory('integrationTestsInReadonlyMode')

    // making sure we don't have the column resizer
    await mustNotFind(page, _('Title-column-resizer'))
  })

  test('columns can be resisized relative to a view', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.views.createNewView()
    await expect(memex.views.ACTIVE_TAB).toHaveText(/^View 100$/)

    const startingTitleWidth = await getTitleColumnWidth(page)
    await resizeColumnWidth(page, 100)

    await waitForResize(page, startingTitleWidth + 100)

    await memex.views.VIEW_TAB_LIST.getByTitle('View 1', {exact: true}).click()
    await expect(memex.views.ACTIVE_TAB).toHaveText(/^View 1$/)

    // original width is unchanged
    expect(await getTitleColumnWidth(page)).toEqual(startingTitleWidth)
  })

  test('table column widths are not reset while dragging when live updates are emitted', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const startingTitleWidth = await getTitleColumnWidth(page)

    // Start dragging, but don't release the mouse.
    await resizeColumnWidth(page, 100, undefined, false)

    // Update the title of the memex via a socket message.
    await page.evaluate(() => {
      return window.__memexInMemoryServer.memexes.update({title: "My Team's Memex(Updated by socket)"})
    })
    const emitted = await page.evaluate(() => {
      return window.__memexInMemoryServer.liveUpdate.sendSocketMessage({
        type: 'github.memex.v0.MemexProjectEvent',
      })
    })

    test.expect(emitted).toBeTruthy()
    await waitForTitle(page, "My Team's Memex(Updated by socket")

    // End the drag.
    await page.mouse.up()

    // Confirm that the column was actually resized.
    expect(await waitForResize(page, startingTitleWidth + 100)).toBeTruthy()
  })
})
