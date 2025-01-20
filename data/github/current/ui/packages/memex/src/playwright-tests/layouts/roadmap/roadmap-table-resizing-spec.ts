import {expect, type Locator} from '@playwright/test'

import {statusColumn} from '../../../mocks/data/columns'
import {test} from '../../fixtures/test-extended'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'

for (const isSliceBySet of [true, false]) {
  test.describe(`roadmap table resizing with the slicer panel open: ${isSliceBySet}`, () => {
    test.beforeEach(async ({memex, browserName}) => {
      test.skip(['webkit', 'firefox'].includes(browserName), 'Cannot drag in playwright in safari/firefox reliably')
      await memex.navigateToStory('appWithRoadmapLayout', {
        sliceBy: isSliceBySet ? {columnId: statusColumn.name} : undefined,
      })
    })

    test('can drag the sash to resize table', async ({memex}) => {
      const {x: initialTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
      const amountToDragTable = 100
      const sash = memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first()
      await drag(sash, ({x, y}) => ({x: x + amountToDragTable, y}))

      const {x: newTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
      expect(newTableWidth).toBeCloseTo(initialTableWidth + amountToDragTable, -1)
    })

    test('can drag the header sash to resize table', async ({memex}) => {
      const {x: initialTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_HEADER_DRAG_SASH.first())
      const amountToDragTable = 100
      const sash = memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first()
      await drag(sash, ({x, y}) => ({x: x + amountToDragTable, y}))

      const {x: newTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
      expect(newTableWidth).toBeCloseTo(initialTableWidth + amountToDragTable, -1)
    })

    test('dragging sash in one view should be independent of other views', async ({memex}) => {
      const {x: initialTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())

      // Create a new roadmap view
      await memex.views.createNewView()
      await memex.viewOptionsMenu.switchToRoadmapView()

      // Drag the sash in the new view
      const sash = memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first()
      await drag(sash, ({x, y}) => ({x: x - 200, y}))

      // Go back to original view
      await memex.views.VIEW_TABS.first().click()

      // Width should not have changed
      const {x: newTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
      expect(newTableWidth).toBeCloseTo(initialTableWidth, -1)
    })

    test('can drag the sash to resize table when date fields hidden', async ({memex}) => {
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.ROADMAP_SHOW_DATE_FIELDS.click()

      const {x: initialTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
      const amountToDragTable = 100

      const sash = memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first()
      await drag(sash, ({x, y}) => ({x: x + amountToDragTable, y}))

      const {x: newTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
      expect(newTableWidth).toBeCloseTo(initialTableWidth + amountToDragTable, -1)
    })
  })
}

const drag = async (
  locator: Locator,
  getNewCoordinates: ({x, y}: {x: number; y: number}) => {x: number; y: number},
) => {
  const center = await mustGetCenter(locator)
  return dragTo(locator.page(), locator, getNewCoordinates({x: center.x, y: center.y}), {steps: 5})
}
