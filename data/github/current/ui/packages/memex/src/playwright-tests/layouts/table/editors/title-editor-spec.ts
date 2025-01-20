import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {setCellToEditMode, setCellToFocusMode} from '../../../helpers/table/interactions'
import {cellTestId, getCellMode, getTitleTextParts} from '../../../helpers/table/selectors'
import {eventually} from '../../../helpers/utils'
import {CellMode} from '../../../types/table'

test.describe('Entering edit mode from focus mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Delete does not delete the title, pops a toast', async ({page, memex}) => {
    const cellSelector = _(cellTestId(3, 'Title'))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Delete')
    await memex.toasts.expectErrorMessageVisible('Title cannot be deleted')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Backspace does not delete the title, pops a toast', async ({page, memex}) => {
    const cellSelector = _(cellTestId(3, 'Title'))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Backspace')

    await memex.toasts.expectErrorMessageVisible('Title cannot be deleted')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
  })
})

test.describe('Exiting edit mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Enter does not save empty values, pops a toast', async ({page, memex}) => {
    const startingCellSelector = _(cellTestId(3, 'Title'))
    const finishingCellSelector = _(cellTestId(4, 'Title'))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    // delete all the letters in the cell
    const textChars = cellTextBeforeEdit?.split('') || []
    for (const _char of textChars) {
      await page.keyboard.press('Backspace')
    }

    // attempt to save
    await page.keyboard.press('Enter')

    // toast
    await memex.toasts.expectErrorMessageVisible('Title cannot be blank')

    const cellTextAfterEdit = await page.textContent(startingCellSelector)
    expect(cellTextAfterEdit).toBe(cellTextBeforeEdit)

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Clicking a different cell saves the value and focuses that cell', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, 'Title'))
    const finishingCellSelector = _(cellTestId(3, 'Assignees'))
    const titlePartsBeforeEdit = await getTitleTextParts(page, 3)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    const finishingCell = page.locator(finishingCellSelector)
    await finishingCell.click()

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${titlePartsBeforeEdit.name}-with-an-edit${titlePartsBeforeEdit.number}`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Escape exits edit mode without saving', async ({page}) => {
    const cellSelector = _(cellTestId(3, 'Title'))

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    await page.keyboard.press('Escape')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    const cellTextAfterEdit = await page.textContent(cellSelector)
    expect(cellTextAfterEdit).toBe(cellTextBeforeEdit)
  })
})

test.describe('Exiting edit mode', () => {
  test('Pressing Tab saves new value and focuses on next row if single column', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithOnlyTitleColumn')
    const startingCellSelector = _(cellTestId(3, 'Title'))
    const finishingCellSelector = _(cellTestId(4, 'Title'))
    const titlePartsBeforeEdit = await getTitleTextParts(page, 3)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    await page.keyboard.press('Tab')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${titlePartsBeforeEdit.name}-with-an-edit${titlePartsBeforeEdit.number}`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })
})
