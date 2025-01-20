import {expect} from '@playwright/test'
import {addDays} from 'date-fns'

import {statusColumn} from '../../../mocks/data/columns'
import {test} from '../../fixtures/test-extended'
import {parseISODateString} from '../../helpers/dates'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'

test.describe('Roadmap add item dates', () => {
  test.describe('with an iterations field', () => {
    const today = new Date()
    const currentIterationStart = parseISODateString(today)
    const currentIterationEnd = parseISODateString(addDays(today, 13))

    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithIterationsField', {
        viewType: 'roadmap',
      })
    })

    test('renders add button for items without dates', async ({memex}) => {
      const title = 'Update styles for table'
      let pill = memex.roadmapPage.getPill({name: title})
      await pill.expectToBeHidden()

      const row = memex.roadmapPage.getRowByTitle(title)
      await expect(row).toBeVisible()

      const addButton = row.getByTestId('roadmap-add-date-button')
      await addButton.click()
      pill = memex.roadmapPage.getPill({name: title})
      await pill.expectToBeVisible()
      await pill.expectVisibleLinkFocused()
    })

    test('does not render add button for items with dates', async ({memex}) => {
      const title = 'Here is a Draft Issue!'
      const pill = memex.roadmapPage.getPill({name: title})
      await pill.expectToBeVisible()

      const row = memex.roadmapPage.getRowByTitle(title)
      await expect(row).toBeVisible()

      const addButton = row.getByTestId('roadmap-add-date-button')
      await expect(addButton).toBeHidden()
    })

    test('does not render add button for redacted items', async ({memex, page}) => {
      await page.getByTestId('roadmap-scroll-container').evaluate(element => {
        element.scrollTop = element.scrollHeight
      })
      const title = "You don't have permission to access this item"
      const pill = memex.roadmapPage.getPill({name: title})
      await pill.expectToBeHidden()

      const row = memex.roadmapPage.getRowByTitle(title)
      await expect(row).toBeVisible()

      const addButton = row.getByTestId('roadmap-add-date-button')
      await expect(addButton).toBeHidden()
    })

    test('adds item to the current iteration', async ({memex}) => {
      const title = 'Update styles for table'
      let pill = memex.roadmapPage.getPill({name: title})
      await pill.expectToBeHidden()

      const row = memex.roadmapPage.getRowByTitle(title)
      await expect(row).toBeVisible()

      const addButton = row.getByTestId('roadmap-add-date-button')
      await addButton.click()
      pill = memex.roadmapPage.getPill({name: title})
      await pill.expectToBeVisible()

      await pill.expectToHaveStartDate(currentIterationStart)
      await pill.expectToHaveEndDate(currentIterationEnd)
      await pill.expectVisibleLinkFocused()
    })
  })

  for (const isSliceBySet of [true, false]) {
    test.describe(`with a date field and the slicer panel open: ${isSliceBySet}`, () => {
      const todayDate = new Date()
      const today = parseISODateString(todayDate)

      test.beforeEach(async ({memex, page}) => {
        await memex.navigateToStory('reactTableWithItems', {
          viewType: 'roadmap',
          sliceBy: isSliceBySet ? {columnId: statusColumn.name} : undefined,
        })

        // Dismiss the 'Welcome to Roadmap' popover and date configuration menu
        await page.getByText('Got it').click()
        await page.keyboard.press('Escape')
      })

      test('renders add button for items without dates', async ({memex}) => {
        const title = 'Fix cell size issues'
        let pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeHidden()

        const row = memex.roadmapPage.getRowByTitle(title)
        await expect(row).toBeVisible()

        const addButton = row.getByTestId('roadmap-add-date-button')
        await addButton.click()
        pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeVisible()
      })

      test('does not render add button for items with dates', async ({memex}) => {
        const title = 'Produce ag-Grid staging demo'
        const pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeVisible()

        const row = memex.roadmapPage.getRowByTitle(title)
        await expect(row).toBeVisible()

        const addButton = row.getByTestId('roadmap-add-date-button')
        await expect(addButton).toBeHidden()
      })

      test('does not render add button for redacted items', async ({memex, page}) => {
        await page.getByTestId('roadmap-scroll-container').evaluate(element => {
          element.scrollTop = element.scrollHeight
        })
        const title = "You don't have permission to access this item"
        const pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeHidden()

        const row = memex.roadmapPage.getRowByTitle(title)
        await expect(row).toBeVisible()

        const addButton = row.getByTestId('roadmap-add-date-button')
        await expect(addButton).toBeHidden()
      })

      test('adds item to today', async ({memex, page}) => {
        const title = 'Fix cell size issues'
        let pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeHidden()

        const row = memex.roadmapPage.getRowByTitle(title)
        await expect(row).toBeVisible()

        const addButton = row.getByTestId('roadmap-add-date-button')
        const addButtonCenter = await mustGetCenter(addButton)

        // We could click the addButton directly as shown in comment below,
        // but mouse clicking at the expected point ensures that the button is correctly positioned under the mouse
        //   await addButton.click()
        await page.mouse.click(addButtonCenter.x, addButtonCenter.y)

        pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeVisible()

        await pill.expectToHaveStartDate(today)
        await pill.expectToHaveEndDate(today)
      })

      test('adds item while hovering over date', async ({memex, page}) => {
        // First, reduce the Roadmap table width by -250px to provide more room within the Roadmap pill area.
        // This is particularly important with the slicer panel open since space is limited.
        const {x: initialTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
        const amountToDragTable = -250
        const sash = memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first()
        const center = await mustGetCenter(sash)
        await dragTo(page, sash, {x: center.x + amountToDragTable, y: center.y}, {steps: 5})
        const {x: newTableWidth} = await mustGetCenter(memex.roadmapPage.ROADMAP_TABLE_DRAG_SASH.first())
        expect(newTableWidth).toBeCloseTo(initialTableWidth + amountToDragTable, -1)

        const title = 'Fix cell size issues'
        let pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeHidden()

        const row = memex.roadmapPage.getRowByTitle(title)
        await expect(row).toBeVisible()

        const addButton = row.getByTestId('roadmap-add-date-button')
        await addButton.hover()
        const addButtonCenter = await mustGetCenter(addButton)

        // Calculate the approximate position of the column that is 5 days before today
        const todayMarkerCenter = await mustGetCenter(addButton.page().getByTestId('roadmap-today-marker-nub'))
        const daysToGoBack = 5
        const approxColumnWidth = 48
        const point = {x: todayMarkerCenter.x - daysToGoBack * approxColumnWidth, y: addButtonCenter.y}

        await page.mouse.move(point.x, point.y, {steps: 5})

        // We could click the addHoverButton directly as shown in comments below,
        // but mouse clicking at the expected point ensures that the button is correctly positioned under the mouse
        //   const addHoverButton = row.getByTestId('roadmap-add-date-button')
        //   await addHoverButton.click()
        await page.mouse.click(point.x, point.y)

        pill = memex.roadmapPage.getPill({name: title})
        await pill.expectToBeVisible()

        const targetDate = new Date()
        // 5 days before today
        targetDate.setDate(targetDate.getDate() - daysToGoBack)

        const target = parseISODateString(targetDate)

        await pill.expectToHaveStartDate(target)
        await pill.expectToHaveEndDate(target)
      })
    })
  }
})
