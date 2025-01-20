import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {getInputValue, hasDOMFocus} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import {expectValidationMessage} from '../../../helpers/table/assertions'
import {setCellToEditMode, setCellToFocusMode} from '../../../helpers/table/interactions'
import {cellTestId, getCellMode, getEditorInput, getRowCountInTable} from '../../../helpers/table/selectors'
import {eventually} from '../../../helpers/utils'
import {CellMode} from '../../../types/table'

const NUMBER_COLUMN_NAME = 'Estimate'
const PREV_COLUMN_NAME = 'Team'

test.describe('Entering edit mode from focus mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Press Enter starts editing with existing value', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await page.keyboard.press('Enter')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await hasDOMFocus(page, input)).toBe(true)
    expect(await getInputValue(page, input)).toBe(cellTextBeforeEdit)
  })

  test('Pressing [0-9] sets input to the typed key and starts editing', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('2')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await hasDOMFocus(page, input)).toBe(true)
    expect(await getInputValue(page, input)).toBe('2')
  })

  test('Pressing - sets input to the typed key and starts editing', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('-')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await hasDOMFocus(page, input)).toBe(true)
    expect(await getInputValue(page, input)).toBe('-')
  })

  test('Pressing Delete clears the cell', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(cellSelector)).not.toBe('')

    await page.keyboard.press('Delete')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(cellSelector)).toBe('')
  })

  test('Pressing Backspace clears the cell', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

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

  test('Pressing Enter saves new value and focuses on the next row', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(4, NUMBER_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('2')
    await page.keyboard.press('Enter')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}2`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Enter with number with comma saves number value new value and focuses on current row', async ({
    page,
  }) => {
    const startingCellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(4, NUMBER_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('2,000')
    await page.keyboard.press('Enter')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}2000`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Enter with invalid value remains in edit mode without saving', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)
    const input = await getEditorInput(page, cellSelector)

    await page.keyboard.type('Boop!')
    expect(await input.getAttribute('aria-invalid')).toBe('true')
    await page.keyboard.press('Enter')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)
    expect(await input.getAttribute('aria-invalid')).toBe('true')

    expect(await getInputValue(page, input)).toBe(`${cellTextBeforeEdit}Boop!`)
  })

  test('Pressing Enter on last row leaves edit mode and focuses the omnibar', async ({page, memex}) => {
    const rowCount = await getRowCountInTable(page)
    const lastRowIndex = rowCount - 1
    const cellSelector = _(cellTestId(lastRowIndex, NUMBER_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.press('Enter')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.DEFAULT)

    await expect(memex.omnibar.INPUT).toBeFocused()
  })

  // TODO: as this is currently the last column in the view, we don't test that Tab moves focus to the next column

  test('Pressing Shift+Tab saves new value and focuses on previous column', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(3, 'Team'))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('2')
    await page.keyboard.press('Shift+Tab')

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}2`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Pressing Shift+Tab with invalid value does not submit value and remains in edit mode', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('Boop!')
    await page.keyboard.press('Shift+Tab')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await getInputValue(page, input)).toBe(`${cellTextBeforeEdit}Boop!`)
  })

  test('Pressing Escape exits edit mode without saving', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(cellSelector)

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('2')
    await page.keyboard.press('Escape')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    const cellTextAfterEdit = await page.textContent(cellSelector)
    expect(cellTextAfterEdit).toBe(cellTextBeforeEdit)
  })

  test('Clicking a different cell saves a vaild value and focuses that cell', async ({page}) => {
    const startingCellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(3, 'Team'))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('2')
    const finishingCell = page.locator(finishingCellSelector)
    await finishingCell.click()

    await eventually(async () => {
      const cellTextAfterEdit = await page.textContent(startingCellSelector)
      expect(cellTextAfterEdit).toBe(`${cellTextBeforeEdit}2`)
    })

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)
  })

  test('Clicking a different cell discards an invalid value and focuses that cell and resets the validation state', async ({
    page,
  }) => {
    const startingCellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))
    const finishingCellSelector = _(cellTestId(3, PREV_COLUMN_NAME))

    const cellTextBeforeEdit = await page.textContent(startingCellSelector)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.type('Boop!')
    const finishingCell = page.locator(finishingCellSelector)
    await finishingCell.click()

    const cellTextAfterEdit = await page.textContent(startingCellSelector)
    expect(cellTextAfterEdit).toBe(cellTextBeforeEdit)

    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, finishingCellSelector)).toBe(CellMode.FOCUSED)

    await setCellToEditMode(page, startingCellSelector)
    expect(await getCellMode(page, startingCellSelector)).toBe(CellMode.EDITING)
    const input = await getEditorInput(page, startingCellSelector)
    expect(await input.getAttribute('aria-invalid')).toBe('false')
  })
})

test.describe('Cell validation', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Entering a non-numeric value displays an error message', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await input.getAttribute('aria-invalid')).toBe('false')

    await page.keyboard.type('Boop!')

    expect(await input.getAttribute('aria-invalid')).toBe('true')

    await expectValidationMessage(page, input, 'This field must be a number')
  })

  test('Entering a non-numeric value in an empty cell does not persist', async ({page}) => {
    const cellSelector = _(cellTestId(2, NUMBER_COLUMN_NAME))

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.type('b')
    await page.keyboard.press('Enter')

    expect(await page.textContent(cellSelector)).toBe('')
  })

  test('Entering a non-numeric value in a cell with an existing value rolls back to the previous value', async ({
    page,
  }) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))
    const prevValue = (await page.locator(cellSelector).innerText()).trim()

    await setCellToFocusMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.type('b')
    await page.keyboard.press('Enter')

    expect(await page.textContent(cellSelector)).toBe(prevValue)
  })

  test('Entering a too large numeric value displays an error message', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await input.getAttribute('aria-invalid')).toBe('false')

    await page.keyboard.type('1E100')

    expect(await input.getAttribute('aria-invalid')).toBe('true')

    await expectValidationMessage(page, input, 'This value must be between -2147483647 and 2147483647')
  })

  test('Entering a numeric value with too high precision displays an error message', async ({page}) => {
    const cellSelector = _(cellTestId(3, NUMBER_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    const input = await getEditorInput(page, cellSelector)

    expect(await input.getAttribute('aria-invalid')).toBe('false')

    await page.keyboard.type('4.1111111111111111111111111')

    expect(await input.getAttribute('aria-invalid')).toBe('true')

    await expectValidationMessage(page, input, 'This floating point value is too precise')
  })
})
