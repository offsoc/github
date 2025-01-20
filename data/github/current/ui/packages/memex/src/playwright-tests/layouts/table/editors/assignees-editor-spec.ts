import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {mustFind} from '../../../helpers/dom/assertions'
import {getInputValue, hasDOMFocus, tab} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import {
  getSelectMenu,
  getSelectMenuFilterInput,
  isSelectMenuOpen,
  selectOption,
  setCellToEditMode,
  setCellToFocusMode,
} from '../../../helpers/table/interactions'
import {cellEditorTestId, cellTestId, getCellMode, getDropdownCaret} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

const CELL_SELECTOR = _(cellTestId(3, 'Assignees'))
const CELL_EDITOR_SELECTOR = _(cellEditorTestId(3, 'Assignees'))

test.describe('Entering edit mode when cell is not focused', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Single clicking on the caret in an unfocused cell puts it in edit mode', async ({page}) => {
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)

    const caret = await getDropdownCaret(page, CELL_SELECTOR)
    await caret.click()

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
  })

  test('Double clicking on an unfocused cell puts it in edit mode', async ({page}) => {
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
  })
})

test.describe('Entering edit mode from focus mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Enter opens select menu with focus on empty filter input', async ({page}) => {
    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    expect(await getInputValue(page, filterInput)).toBe('')
  })

  test('Pressing [A-z] opens select menu with focus on filter input with typed character', async ({page}) => {
    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.type('h')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    expect(await getInputValue(page, filterInput)).toBe('h')
  })

  test('Pressing Backspace clears the cell without opening edit mode', async ({page}) => {
    expect(await page.textContent(CELL_SELECTOR)).not.toBe('')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Backspace')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(CELL_SELECTOR)).toBe('')
  })

  test('Pressing Delete clears the cell without opening edit mode', async ({page}) => {
    expect(await page.textContent(CELL_SELECTOR)).not.toBe('')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Delete')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(CELL_SELECTOR)).toBe('')
  })
})

test.describe('Exiting edit mode', () => {
  test('Clicking outside the table while the editor menu is open leaves both edit and focus mode', async ({
    page,
    memex,
  }) => {
    test.skip()
    await memex.navigateToStory('integrationTestsWithItems')

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    await memex.tableView.expectVisible()

    // Assert that the title input is outside of the table.
    await expect(memex.tableView.TABLE_ROOT.getByRole('heading', {level: 1})).toHaveCount(0)

    await page.getByRole('heading', {level: 1}).click()

    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)
  })
})

test.describe('Exiting edit mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Pressing Escape returns to focus mode and saves', async ({page}) => {
    const cellTextBefore = await page.textContent(CELL_SELECTOR)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const menu = await getSelectMenu(page, CELL_EDITOR_SELECTOR)
    await selectOption(menu, 'dmarcey')
    await page.keyboard.press('Escape')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    // Temporary space at the beginning due to https://github.com/github/memex/issues/16409
    expect(await page.textContent(CELL_SELECTOR)).toEqual(` dmarcey and ${cellTextBefore}`)
  })

  test('Clicking on another cell updates value', async ({page}) => {
    const cellTextBefore = await page.textContent(CELL_SELECTOR)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const menu = await getSelectMenu(page, CELL_EDITOR_SELECTOR)
    await selectOption(menu, 'katestud')
    await selectOption(menu, 'dmarcey')

    const newCellSelector = _(cellTestId(0, 'Assignees'))

    await setCellToFocusMode(page, newCellSelector)
    expect(await getCellMode(page, newCellSelector)).toBe(CellMode.FOCUSED)

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    // Temporary space at the beginning due to https://github.com/github/memex/issues/16409
    expect(await page.textContent(CELL_SELECTOR)).toEqual(` dmarcey, katestud, and ${cellTextBefore}`)
  })

  test('Pressing Enter while focused on filter input does not leave edit mode', async ({page}) => {
    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)

    await filterInput.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)
    expect(await hasDOMFocus(page, await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR))).toBe(true)
  })

  test('Pressing Tab while focused on filter input does not leave edit mode', async ({page, browserName}) => {
    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)

    await tab(browserName, filterInput)

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)
  })

  test('Clicking on the filter input and then selecting options does not leave edit mode', async ({page}) => {
    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    await page.waitForSelector(CELL_EDITOR_SELECTOR)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)

    await filterInput.click()

    const optionSelector = _('table-cell-editor-row')
    await page.waitForFunction(([selector]) => !!document.querySelector(selector), [optionSelector])

    await filterInput.click()

    const filterOptions = page.locator(optionSelector)

    await filterOptions.nth(0).click()

    await filterInput.click()

    await filterOptions.nth(1).click()

    await filterInput.click()

    await filterOptions.nth(2).click()

    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)
  })

  test('Pressing any Arrow keys while focused on filter input does not leave edit mode', async ({page}) => {
    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)

    await filterInput.press('ArrowUp')
    await filterInput.press('ArrowDown')
    await filterInput.press('ArrowLeft')
    await filterInput.press('ArrowRight')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)
  })
})

test.describe('Error handling', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsInErrorMode')
  })

  test('showing error message when failing to load suggestions', async ({page}) => {
    const content = await page.textContent(CELL_SELECTOR)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const errorElement = await mustFind(page, _('table-cell-editor-error'))
    const errorElementValue = await errorElement.textContent()
    expect(errorElementValue).toMatch("You don't have permission to edit this field.")
    expect(content).toEqual(await page.textContent(CELL_SELECTOR))
  })
})
