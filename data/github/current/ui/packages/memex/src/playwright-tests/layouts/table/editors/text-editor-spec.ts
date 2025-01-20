import {type ElementHandle, expect, type Page} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {getInputValue, hasDOMFocus} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import {setCellToEditMode, setCellToFocusMode} from '../../../helpers/table/interactions'
import {cellTestId, getCellMode, getRowCountInTable} from '../../../helpers/table/selectors'
import {eventually} from '../../../helpers/utils'
import {CellMode} from '../../../types/table'

// Get the input within the title cell editor that the user edits the value in
const getTitleEditorInput = async (page: Page, testCellId: string): Promise<ElementHandle<HTMLInputElement>> => {
  const input = page.locator(`${testCellId} input`)
  const element = await input.elementHandle()
  if (!element) throw new Error('Could not find title editor input')

  return element as ElementHandle<HTMLInputElement>
}
const TEXT_COLUMN_NAME = 'Team'
const PREV_COLUMN_NAME = 'Stage'
const NEXT_COLUMN_NAME = 'Estimate'

test.describe('Entering edit mode from focus mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  const cellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))

  test('Press Enter starts editing with existing value', async ({page}) => {
    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await page.keyboard.press('Enter')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getTitleEditorInput(page, cellSelector)

    expect(await hasDOMFocus(page, input)).toBe(true)
    expect(await getInputValue(page, input)).toBe(cellTextBeforeEdit)
  })

  test('Pressing [A-z] sets input to the typed key and starts editing', async ({page}) => {
    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('e')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getTitleEditorInput(page, cellSelector)

    expect(await hasDOMFocus(page, input)).toBe(true)
    expect(await getInputValue(page, input)).toBe('e')
  })

  test('Pressing Delete clears the cell', async ({page}) => {
    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(cellSelector)).not.toBe('')

    await page.keyboard.press('Delete')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(cellSelector)).toBe('')
  })

  test('Pressing Backspace clears the cell', async ({page}) => {
    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(cellSelector)).not.toBe('')

    await page.keyboard.press('Backspace')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(cellSelector)).toBe('')
  })
})

test.describe('Exiting edit mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Enter saves new value and focuses on current row', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(4, TEXT_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    await page.keyboard.press('Enter')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}-with-an-edit`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Enter saves new value with emoji successfully', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-emoji :thinking:')
    await page.keyboard.press('Enter')

    const cellTextAfterEdit = await page.textContent(startingCellSelector)
    expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}-with-an-emoji 🤔`)
  })

  test('Pressing Enter on last row leaves edit mode and focuses the omnibar', async ({page, memex}) => {
    const rowCount = await getRowCountInTable(page)
    const lastRowIndex = rowCount - 1
    const cellSelector = _(cellTestId(lastRowIndex, TEXT_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.press('Enter')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.DEFAULT)

    await expect(memex.omnibar.INPUT).toBeFocused()
  })

  test('Pressing Tab saves new value and focuses on next column', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(3, NEXT_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    await page.keyboard.press('Tab')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}-with-an-edit`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Shift+Tab saves new value and focuses on previous column', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(3, PREV_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    await page.keyboard.press('Shift+Tab')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}-with-an-edit`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Escape exits edit mode without saving', async ({page}) => {
    const cellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    await page.keyboard.press('Escape')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    const cellTextAfterEdit = await page.textContent(cellSelector)
    expect(cellTextAfterEdit).toBe(cellTextBeforeEdit)
  })

  test('Clicking a different cell saves the value and focuses that cell', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, TEXT_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(4, TEXT_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('-with-an-edit')
    const finishingCell = page.locator(finishingCellSelector)
    await finishingCell.click()

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}-with-an-edit`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })
})
