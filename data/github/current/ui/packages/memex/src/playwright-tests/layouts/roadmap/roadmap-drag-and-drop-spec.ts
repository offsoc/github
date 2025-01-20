import {expect, type Page} from '@playwright/test'
import {addDays} from 'date-fns'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {parseISODateString} from '../../helpers/dates'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'

test.describe('roadmap drag and drop', () => {
  test.beforeEach(({browserName}) => {
    test.skip(['webkit', 'firefox'].includes(browserName), 'Cannot drag in playwright in safari/firefox reliably')
  })
  test.describe('start and end date fields set', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
    })

    test('can drag a pill', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.dragTo((x, y) => ({x: x - 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -3)))
      await pill.expectToHaveEndDate(parseISODateString(addDays(endDate, -3)))
      await pill.expectVisibleLinkFocused()
    })

    test('can extend items to an earlier date with only a start date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Today/})

      const startDate = await pill.getStartDate()
      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
      await pill.expectToHaveEndDate(parseISODateString(startDate))
    })

    test('can extend items to an later date with only a start date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Today/})

      const startDate = await pill.getStartDate()
      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(startDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(startDate, 2)))
    })

    test('can extend items to an earlier date with only a target date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Target/})

      const startDate = await pill.getStartDate()
      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
      await pill.expectToHaveEndDate(parseISODateString(startDate))
    })

    test('can extend items to an later date with only a target date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Target/})

      const startDate = await pill.getStartDate()
      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(startDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(startDate, 2)))
    })

    test('can extend items to an earlier date with reversed dates', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Reversed/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()
      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
      await pill.expectToHaveEndDate(parseISODateString(endDate))
    })

    test('can extend items to an later date with only a reversed dates', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Reversed/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()
      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(startDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(endDate, 2)))
    })

    test('can drag pill for items with only a single date to an earlier date', async ({memex, browserName}) => {
      test.fixme(['webkit', 'firefox'].includes(browserName), 'Cannot drag in playwright in safari/firefox reliably')
      const pill = memex.roadmapPage.getPill({name: /Today/})
      const startDate = await pill.getStartDate()
      await pill.dragTo((x, y) => ({x: x - 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
    })

    test('can drag pill for items with only a single date to a later date', async ({memex, browserName}) => {
      test.fixme(['webkit', 'firefox'].includes(browserName), 'Cannot drag in playwright in safari/firefox reliably')
      const pill = memex.roadmapPage.getPill({name: /Today/})
      const startDate = await pill.getStartDate()
      await pill.dragTo((x, y) => ({x: x + 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, 2)))
    })

    test('can drag a leading handle to an earlier date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
      await pill.expectToHaveEndDate(parseISODateString(endDate))
    })

    test('can drag a leading handle to a later date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, +2)))
      await pill.expectToHaveEndDate(parseISODateString(endDate))
    })

    test('can drag a trailing handle to a later date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(startDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(endDate, 2)))
    })

    test('can drag a trailing handle to an earlier date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(startDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(endDate, -3)))
    })

    test('can drag a trailing handle to later date if days are the same', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Same day/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(startDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(endDate, 2)))
    })

    test('can drag a leading handle to earlier date if days are the same', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Same day/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 100, y}))
      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
      await pill.expectToHaveEndDate(parseISODateString(endDate))
    })

    test('trailing date is dragged to before leading date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 450, y}), {steps: 100})
      await pill.expectToHaveStartDate(parseISODateString(addDays(endDate, -9)))
      await pill.expectToHaveEndDate(parseISODateString(startDate))
    })

    test('leading date is dragged to after trailing date', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /This Week/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 450, y}), {steps: 100})
      await pill.expectToHaveStartDate(parseISODateString(endDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(startDate, 8)))
    })

    test('trailing date is dragged before leading date for reversed data items', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Reversed/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x - 450, y}), {steps: 100})
      await pill.expectToHaveStartDate(parseISODateString(addDays(endDate, -9)))
      await pill.expectToHaveEndDate(parseISODateString(startDate))
    })

    test('leading date is dragged after trailing date for reversed data items', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Reversed/})

      const startDate = await pill.getStartDate()
      const endDate = await pill.getEndDate()

      await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x + 450, y}), {steps: 100})
      await pill.expectToHaveStartDate(parseISODateString(endDate))
      await pill.expectToHaveEndDate(parseISODateString(addDays(startDate, 8)))
    })
  })

  test.describe('only one date field set', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithDateItems')
      await memex.viewOptionsMenu.switchToRoadmapView()
    })

    test('can drag an item to change the date', async ({memex, browserName}) => {
      test.fixme(['webkit', 'firefox'].includes(browserName), 'Cannot drag in playwright in safari/firefox reliably')

      const pill = memex.roadmapPage.getPill({name: /Remove/})
      const startDate = await pill.getStartDate()

      await pill.dragTo((x, y) => ({x: x - 100, y}))

      await pill.expectToHaveStartDate(parseISODateString(addDays(startDate, -2)))
      await pill.expectVisibleLinkFocused()
    })

    test('cannot drag leading or trailing handle of an item', async ({memex}) => {
      const pill = memex.roadmapPage.getPill({name: /Remove/})

      await pill.LEADING_DRAG_HANDLE.expectToBeHidden()
      await pill.TRAILING_DRAG_HANDLE.expectToBeHidden()
    })
  })

  test.describe('with iterations', () => {
    const title = 'Today' // Using the 'Today' item only for convenience, and it has no 'End Date' column value
    const dayWidth = 16 // Quarter zoom
    const dragHandleMargin = 5 // The drag handles extends from the pill, so this is a fudge factor to account for that
    const iterationDays = 14
    const daysAfterToday = 9
    const iterationWidth = iterationDays * dayWidth
    const today = new Date()
    const currentIterationStartDate = today
    const currentIterationEndDate = addDays(currentIterationStartDate, 13)
    const targetDate = parseISODateString(addDays(today, daysAfterToday))
    const currentIterationStart = parseISODateString(currentIterationStartDate)
    const currentIterationEnd = parseISODateString(currentIterationEndDate)

    test.describe('start and end set to an iteration', () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('appWithRoadmapLayout')

        // Select to use the Iteration field for start and end
        await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
        await memex.roadmapPage.dateFieldStart('Iteration').click()
        await memex.roadmapPage.dateFieldEnd('Iteration').click()
        await memex.roadmapPage.getPill({name: title}).expectToBeHidden()

        // Switch to the Quarter zoom for adding/editing pills with 2-week iterations
        await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
        await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()
        await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_DIRTY).toBeVisible()
      })

      test('add and update snaps to single iteration endpoints', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(currentIterationStart)
        await pill.expectToHaveEndDate(currentIterationEnd)

        // Move the pill so its center (where the cursor is) crosses the iteration boundary
        await pill.dragTo((x, y) => ({x: x + iterationWidth + dayWidth, y}))
        const nextIterationStart = parseISODateString(addDays(currentIterationStartDate, iterationDays))
        const nextIterationEnd = parseISODateString(addDays(currentIterationEndDate, iterationDays))
        await pill.expectToHaveStartDate(nextIterationStart)
        await pill.expectToHaveEndDate(nextIterationEnd)

        // Cannot resize the pill
        await pill.LEADING_DRAG_HANDLE.expectToBeHidden()
        await pill.TRAILING_DRAG_HANDLE.expectToBeHidden()
      })
    })

    test.describe('start set to iteration, end set to date', () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('appWithRoadmapLayout')

        // Select to use the Iteration for start and a date field for end
        await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
        await memex.roadmapPage.dateFieldStart('Iteration').click()
        await memex.roadmapPage.dateFieldEnd('End Date').click()
        await memex.roadmapPage.getPill({name: title}).expectToBeHidden()

        // Switch to the Quarter zoom for adding/editing pills with 2-week iterations
        await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
        await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()
        await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_DIRTY).toBeVisible()
      })

      test('add and move snaps to iteration start and any date end', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(currentIterationStart)
        await pill.expectToHaveEndDate(targetDate)

        // Move the pill so its center (where the cursor is) crosses the next iteration boundary
        const pillWidth = (daysAfterToday + 1) * dayWidth
        const dragDistance = iterationWidth - pillWidth / 2 + dayWidth
        await pill.dragTo((x, y) => ({x: x + dragDistance, y}))
        const nextPillStart = parseISODateString(addDays(currentIterationStartDate, iterationDays))
        const nextPillEnd = parseISODateString(addDays(currentIterationStartDate, iterationDays + daysAfterToday))
        await pill.expectToHaveStartDate(nextPillStart)
        await pill.expectToHaveEndDate(nextPillEnd)
      })

      test('add and drag leading snaps to the previous iteration', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(currentIterationStart)
        await pill.expectToHaveEndDate(targetDate)

        // Drag the leading handle to resize, snapping to the previous iteration boundary
        const dragDistance = dayWidth
        await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - dragDistance, y}))
        const nextPillStart = parseISODateString(addDays(currentIterationStartDate, -iterationDays))
        const nextPillEnd = targetDate
        await pill.expectToHaveStartDate(nextPillStart)
        await pill.expectToHaveEndDate(nextPillEnd)
      })

      test('add and drag trailing snaps to any date', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(currentIterationStart)
        await pill.expectToHaveEndDate(targetDate)

        // Drag the trailing handle to resize, snapping to the next date
        const dragDistance = dayWidth
        await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + dragDistance, y}))
        const nextPillStart = currentIterationStart
        const nextPillEnd = parseISODateString(addDays(today, daysAfterToday + 1))
        await pill.expectToHaveStartDate(nextPillStart)
        await pill.expectToHaveEndDate(nextPillEnd)
      })
    })

    test.describe('start set to date, end set to iteration', () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('appWithRoadmapLayout')

        // Select to use a date for start and the Iteration field for end (using 'End Date' only because it's not set for 'Today')
        await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
        await memex.roadmapPage.dateFieldStart('End Date').click()
        await memex.roadmapPage.dateFieldEnd('Iteration').click()
        await memex.roadmapPage.getPill({name: title}).expectToBeHidden()

        // Switch to the Quarter zoom for adding/editing pills with 2-week iterations
        await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
        await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()
        await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_DIRTY).toBeVisible()
      })

      test('add and move snaps to iteration end and any date start', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(targetDate)
        await pill.expectToHaveEndDate(currentIterationEnd)

        // Move the pill so its center (where the cursor is) crosses the next iteration boundary
        const pillWidth = (daysAfterToday + 1) * dayWidth
        const dragDistance = pillWidth / 2 + dayWidth
        await pill.dragTo((x, y) => ({x: x + dragDistance, y}))
        const nextPillStart = parseISODateString(addDays(currentIterationStartDate, daysAfterToday + iterationDays))
        const nextPillEnd = parseISODateString(addDays(currentIterationEndDate, iterationDays))
        await pill.expectToHaveStartDate(nextPillStart)
        await pill.expectToHaveEndDate(nextPillEnd)
      })

      test('add and drag leading snaps to any date', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(targetDate)
        await pill.expectToHaveEndDate(currentIterationEnd)

        // Drag the leading handle to resize, snapping to the previous date
        const dragDistance = dayWidth - dragHandleMargin
        await pill.LEADING_DRAG_HANDLE.dragTo((x, y) => ({x: x - dragDistance, y}))
        const nextPillStart = parseISODateString(addDays(today, daysAfterToday - 1))
        const nextPillEnd = currentIterationEnd
        await pill.expectToHaveStartDate(nextPillStart)
        await pill.expectToHaveEndDate(nextPillEnd)
      })

      test('add and drag trailing snaps to the next iteration', async ({memex, page}) => {
        // Add the pill by clicking at 9 days after today
        const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
        await pill.expectToBeVisible()
        await pill.expectToHaveStartDate(targetDate)
        await pill.expectToHaveEndDate(currentIterationEnd)

        // Drag the trailing handle to resize, snapping to the next iteration
        const dragDistance = dayWidth
        await pill.TRAILING_DRAG_HANDLE.dragTo((x, y) => ({x: x + dragDistance, y}))
        const nextPillStart = targetDate
        const nextPillEnd = parseISODateString(addDays(currentIterationEndDate, iterationDays))
        await pill.expectToHaveStartDate(nextPillStart)
        await pill.expectToHaveEndDate(nextPillEnd)
      })
    })
  })

  test.describe('pill drag interactions', () => {
    const title = 'Today' // Using the 'Today' item only for convenience, and it has no 'End Date' column value
    const dayWidth = 16 // Quarter zoom
    const iterationDays = 14
    const daysAfterToday = 9
    const iterationWidth = iterationDays * dayWidth
    const today = new Date()
    const currentIterationStartDate = today
    const currentIterationEndDate = addDays(currentIterationStartDate, 13)
    const currentIterationStart = parseISODateString(currentIterationStartDate)
    const currentIterationEnd = parseISODateString(currentIterationEndDate)

    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithRoadmapLayout')

      // Select to use the Iteration field for start and end
      await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
      await memex.roadmapPage.dateFieldStart('Iteration').click()
      await memex.roadmapPage.dateFieldEnd('Iteration').click()
      await memex.roadmapPage.getPill({name: title}).expectToBeHidden()

      // Switch to the Quarter zoom for adding/editing pills with 2-week iterations
      await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
      await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByText('Quarter').click()
      await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_DIRTY).toBeVisible()
    })

    test('drag ghost and target pills render in correct positions', async ({memex, page}) => {
      // Add the pill by clicking at 9 days after today
      const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
      await pill.expectToBeVisible()
      await pill.expectToHaveStartDate(currentIterationStart)
      await pill.expectToHaveEndDate(currentIterationEnd)

      // Get the original pill's position.  Foreground and background should be the same.
      const originalBackgroundBox = await pill.pillBackground.getBoundingBox()
      const originalForegroundBox = await pill.pillBackground.getBoundingBox()
      expect(originalBackgroundBox.x).toEqual(originalForegroundBox.x)
      expect(originalBackgroundBox.width).toEqual(originalForegroundBox.width)

      // Move the pill so its center (where the cursor is) crosses the iteration boundary
      // But do not release the mouse button to complete the drag yet
      const dragDistance = iterationWidth / 2 + dayWidth
      await pill.dragTo((x, y) => ({x: x + dragDistance, y}), false)

      // The pill background should not move
      const dragBackgroundBox = await pill.pillBackground.getBoundingBox()
      expect(dragBackgroundBox.x).toEqual(originalBackgroundBox.x)
      expect(dragBackgroundBox.width).toEqual(originalBackgroundBox.width)

      // The pill foreground should move the drag distance
      const dragForegroundBox = await pill.pillForeground.getBoundingBox()
      expectToBeWithin2Pixels(dragForegroundBox.x, originalForegroundBox.x + dragDistance)
      expect(dragForegroundBox.width).toEqual(originalForegroundBox.width)

      // The pill drag target should snap to the next iteration
      const dragTargetBox = await pill.pillDragTarget.getBoundingBox()
      expectToBeWithin2Pixels(dragTargetBox.x, originalForegroundBox.x + iterationWidth)
      expect(dragTargetBox.width).toEqual(originalForegroundBox.width)
    })

    test('cancel drag with esc key', async ({memex, page}) => {
      // Add the pill by clicking at 9 days after today
      const pill = await addPillRelativeToToday(memex, page, title, daysAfterToday)
      await pill.expectToBeVisible()
      await pill.expectToHaveStartDate(currentIterationStart)
      await pill.expectToHaveEndDate(currentIterationEnd)

      // Get the original pill's position and start/end dates
      const originalForegroundBox = await pill.pillBackground.getBoundingBox()
      const originalPillStart = currentIterationStart
      const originalPillEnd = currentIterationEnd
      await pill.expectToHaveStartDate(originalPillStart)
      await pill.expectToHaveEndDate(originalPillEnd)

      // Move the pill so its center (where the cursor is) crosses the iteration boundary
      // But do not release the mouse button to complete the drag yet
      const dragDistance = iterationWidth / 2 + dayWidth
      await pill.dragTo((x, y) => ({x: x + dragDistance, y}), false)

      // The pill foreground should move the drag distance
      let dragForegroundBox = await pill.pillForeground.getBoundingBox()
      expectToBeWithin2Pixels(dragForegroundBox.x, originalForegroundBox.x + dragDistance)
      expect(dragForegroundBox.width).toEqual(originalForegroundBox.width)

      // Cancel the drag with the escape key
      await page.keyboard.press('Escape')

      // The pill foreground should move back to the original position, with original dates
      dragForegroundBox = await pill.pillForeground.getBoundingBox()
      expect(dragForegroundBox.x).toEqual(originalForegroundBox.x)
      expect(dragForegroundBox.width).toEqual(originalForegroundBox.width)
      await pill.expectToHaveStartDate(originalPillStart)
      await pill.expectToHaveEndDate(originalPillEnd)
    })
  })

  test.describe(`row dragging`, () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
    })

    test('clicking on a row highlights it', async ({memex}) => {
      await memex.roadmapPage.getRowDragHandle(0).click()
      await memex.roadmapPage.expectRowToBeSelected(0)

      await memex.roadmapPage.getRowDragHandle(2).click()
      await memex.roadmapPage.expectRowToBeSelected(2)
      await memex.roadmapPage.expectRowNotToBeSelected(0)

      // Clicking on a different element clears the highlight
      await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
      await memex.roadmapPage.expectRowNotToBeSelected(3)
    })

    test('can drag the first item to change order', async ({memex, page}) => {
      const row1 = memex.roadmapPage.getRowDragHandle(0)
      const row3 = memex.roadmapPage.getRowDragHandle(2)

      await expect(memex.roadmapPage.getTitleCell(0)).toContainText('Whole year')
      await expect(memex.roadmapPage.getTitleCell(1)).toContainText('Q1')
      await expect(memex.roadmapPage.getTitleCell(2)).toContainText('Q2')

      const thirdRowCenter = await mustGetCenter(row3)
      await dragTo(page, row1, {y: thirdRowCenter.y + 10}, {}, false)

      // Expect dragging classes to be applied
      const draggingClasses = await memex.roadmapPage.getRowByIndex(0).getAttribute('class')
      expect(draggingClasses).toContain('row-highlight')

      await page.mouse.up()

      await expect(memex.roadmapPage.getTitleCell(0)).toContainText('Q1')
      await expect(memex.roadmapPage.getTitleCell(1)).toContainText('Q2')
      await expect(memex.roadmapPage.getTitleCell(2)).toContainText('Whole year')

      // Expect row to be selected
      await memex.roadmapPage.expectRowToBeSelected(2)
    })

    test('can drag the last item to change order', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('Week')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(5)

      const secondRow = memex.roadmapPage.getRowDragHandle(1)
      const lastRow = memex.roadmapPage.getRowDragHandle(4)

      await expect(memex.roadmapPage.getTitleCell(1)).toContainText('Week 2')
      await expect(memex.roadmapPage.getTitleCell(4)).toContainText('This Week')

      const secondRowCenter = await mustGetCenter(secondRow)
      await dragTo(page, lastRow, {y: secondRowCenter.y - 10})

      await expect(memex.roadmapPage.getTitleCell(1)).toContainText('This Week')
      await expect(memex.roadmapPage.getTitleCell(2)).toContainText('Week 2')
    })

    test('can drag n-th item to change order', async ({memex, page}) => {
      await memex.roadmapPage.FILTER_BAR_INPUT.fill('Week')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(5)

      const secondRow = memex.roadmapPage.getRowDragHandle(1)
      const secondLastRow = memex.roadmapPage.getRowDragHandle(3)

      await expect(memex.roadmapPage.getTitleCell(1)).toContainText('Week 2')
      await expect(memex.roadmapPage.getTitleCell(3)).toContainText('Week 4')

      const secondLastRowCenter = await mustGetCenter(secondLastRow)
      await dragTo(page, secondRow, {y: secondLastRowCenter.y + 10})

      await expect(memex.roadmapPage.getTitleCell(3)).toContainText('Week 2')
      await expect(memex.roadmapPage.getTitleCell(2)).toContainText('Week 4')
    })

    test('can drag items between groups', async ({page, memex}) => {
      const sourceGroup = 'Backlog'
      const targetGroup = 'Ready'

      // Group items by status
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.setGroupByColumn('Status')
      await memex.viewOptionsMenu.close()
      await expect(memex.roadmapPage.getGroup(sourceGroup)).toBeVisible()

      await memex.roadmapPage.FILTER_BAR_INPUT.fill('override')
      await expect(memex.roadmapPage.ROADMAP_ITEM_ROWS).toHaveCount(10)
      const backlogTitleCell = memex.roadmapPage.getTitleCell(0, sourceGroup)
      await expect(backlogTitleCell).toContainText('override')

      const dropTargetRowTitle = await memex.roadmapPage.getTitleCell(0, targetGroup).textContent()
      const dropTargetRowCenter = await mustGetCenter(memex.roadmapPage.getRowDragHandle(0, targetGroup))

      const draggingRow = memex.roadmapPage.getRowDragHandle(0, sourceGroup)
      const draggingRowTitle = await backlogTitleCell.textContent()
      await dragTo(page, draggingRow, {y: dropTargetRowCenter.y + 10})

      // Row has been dragged to target group
      await expect(memex.roadmapPage.getTitleCell(1, targetGroup)).toContainText(draggingRowTitle)
      // First row is unchanged
      await expect(memex.roadmapPage.getTitleCell(0, targetGroup)).toContainText(dropTargetRowTitle)
    })
  })
})

async function addPillRelativeToToday(memex: MemexApp, page: Page, title: string, daysAfterToday: number) {
  const dayWidth = 16 // Quarter zoomLevel
  const todayX = (await mustGetCenter(page.getByTestId('roadmap-today-marker-nub'))).x
  const row = memex.roadmapPage.getRowByTitle(title)
  const rowY = (await mustGetCenter(row)).y
  await page.mouse.move(todayX + daysAfterToday * dayWidth, rowY, {steps: 5})
  await row.getByTestId('roadmap-add-date-button').click()
  return memex.roadmapPage.getPill({name: title})
}

/** For interactive drag tests, being within 2 pixels verifies the expected behavior without introducing flakiness */
function expectToBeWithin2Pixels(actual: number, expected: number) {
  const diff = Math.abs(actual - expected)
  expect(diff).toBeLessThanOrEqual(2)
}
