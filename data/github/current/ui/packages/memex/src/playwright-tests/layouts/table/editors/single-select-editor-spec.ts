import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {mustFind, waitForSelectorCount} from '../../../helpers/dom/assertions'
import {getInputValue, hasDOMFocus} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import {optionsAreLoaded} from '../../../helpers/table/assertions'
import {
  getSelectMenu,
  getSelectMenuFilterInput,
  isSelectMenuOpen,
  selectOption,
  setCellToEditMode,
  setCellToFocusMode,
} from '../../../helpers/table/interactions'
import {
  cellEditorTestId,
  cellTestId,
  getCellMode,
  getDropdownCaret,
  getTableColumnId,
} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

const AARDVARK_COLUMN_NAME = 'Aardvarks'

const CELL_SELECTOR = _(cellTestId(0, AARDVARK_COLUMN_NAME))

test.describe('Entering edit mode when cell is not focused', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems')
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
    await memex.navigateToStory('integrationTestsWithCustomItems')
  })

  test('Pressing Enter opens select menu with focus on empty filter input', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    expect(await getInputValue(page, filterInput)).toBe('')
  })

  test('Pressing [A-z] opens select menu with focus on filter input with typed character', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.type('h')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
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

  test('Filtering cell returns filtered options', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    await page.keyboard.insertText('Aric')
    await waitForSelectorCount(page, _('table-cell-editor-row'), 1)
  })
})

test.describe('Creating new options from cell editor', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems')
  })

  test('Filtering cell allows creation of new option', async ({page, memex}) => {
    const newAardvark = 'New Aardvark'

    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    await page.keyboard.insertText(newAardvark)
    await waitForSelectorCount(page, _('table-cell-editor-row'), 0)
    await waitForSelectorCount(page, _('add-column-option'), 1)

    await page.click(_('add-column-option'))
    await waitForSelectorCount(page, _('add-column-option'), 0)

    await expect(memex.editOptionDialog.DIALOG).toBeVisible()
    await expect(memex.editOptionDialog.NAME_INPUT).toHaveValue(newAardvark)
    await memex.editOptionDialog.SAVE_BUTTON.click()

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toEqual(newAardvark)

    // Cell is focused so just hit enter to start editing
    await page.keyboard.press('Enter')
    const substringToAdd = newAardvark.substring(0, 3)
    await page.keyboard.insertText(substringToAdd)
    await waitForSelectorCount(page, _('add-column-option'), 1)

    await page.click(_('add-column-option'))
    await waitForSelectorCount(page, _('add-column-option'), 0)

    await expect(memex.editOptionDialog.DIALOG).toBeVisible()
    await expect(memex.editOptionDialog.NAME_INPUT).toHaveValue(substringToAdd)
    await memex.editOptionDialog.SAVE_BUTTON.click()

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toEqual(substringToAdd)
  })

  test('Can create new option with emoji 🚀', async ({page, memex}) => {
    const optionWithShortcode = 'Option with :rocket: emoji'
    const optionWithEmoji = 'Option with 🚀 emoji'

    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    await page.keyboard.insertText(optionWithShortcode)
    await waitForSelectorCount(page, _('table-cell-editor-row'), 0)
    await waitForSelectorCount(page, _('add-column-option'), 1)

    await page.click(_('add-column-option'))
    await waitForSelectorCount(page, _('add-column-option'), 0)

    await expect(memex.editOptionDialog.DIALOG).toBeVisible()
    await expect(memex.editOptionDialog.NAME_INPUT).toHaveValue(optionWithEmoji)
    await memex.editOptionDialog.SAVE_BUTTON.click()

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toEqual(optionWithEmoji)
  })
})

test.describe('Draft items', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems')
  })

  test('are single-selectable', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)

    // Add draft issue
    const omnibar = await mustFind(page, _('repo-searcher-input'))
    await omnibar.click()
    await page.keyboard.insertText('i am a draft issue, verify me')
    await page.keyboard.press('Enter')

    // Select an option and save
    const draftCellEditorSelector = _(cellEditorTestId(1, cellEditorId.toString()))
    const draftCellSelector = _(cellTestId(1, AARDVARK_COLUMN_NAME))
    await setCellToEditMode(page, draftCellSelector)
    expect(await getCellMode(page, draftCellSelector)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, draftCellEditorSelector)).toBe(true)

    const otherOption = page.locator('[data-id="2"]')
    const otherName = await otherOption.getAttribute('name')

    const menu = await getSelectMenu(page, draftCellEditorSelector)
    await selectOption(menu, otherName)

    // Assert that cell has single select option
    expect(await page.textContent(draftCellSelector)).toEqual(otherName)
  })
})

test.describe('Exiting edit mode', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems')
  })

  test('Clicking outside the table while the editor menu is open leaves both edit and focus mode', async ({
    page,
    memex,
  }) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    await memex.tableView.expectVisible()

    // Assert that the title input is outside of the table.
    await expect(memex.tableView.TABLE_ROOT.getByTestId('project-menu-button')).toHaveCount(0)

    const projectMenuButton = await mustFind(page, _('project-menu-button'))
    await projectMenuButton.click()

    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)
  })

  test('Pressing Escape returns to focus mode without saving', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    // first, find the currently-selected option by opening the editor
    const cellSelector = _(cellTestId(0, AARDVARK_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const selectedOption = page.locator('[data-id="1"]')
    const selectedName = await selectedOption.getAttribute('name')

    // now back out of the editing state
    await page.keyboard.press('Escape')
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    expect(await page.textContent(CELL_SELECTOR)).toEqual(selectedName)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    await page.keyboard.press('Escape')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toEqual(selectedName)
  })

  test('Selecting an option returns to focus button and updates value', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const otherOption = page.locator('[data-id="2"]')
    const otherName = await otherOption.getAttribute('name')

    const menu = await getSelectMenu(page, cellEditorSeletor)
    await selectOption(menu, otherName)

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toEqual(otherName)
  })

  test('Pressing Enter on filter input while focused on last row updates value and moves to omnibar', async ({
    page,
    memex,
  }) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(2, cellEditorId.toString()))

    // first, find the currently-selected option by opening the editor
    const cellSelector = _(cellTestId(2, AARDVARK_COLUMN_NAME))

    await setCellToEditMode(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const selectedOption = page.locator('[data-id="1"]')
    const selectedName = await selectedOption.getAttribute('name')

    expect(await page.textContent(cellSelector)).toEqual('')

    const menu = await getSelectMenu(page, cellEditorSeletor)
    await optionsAreLoaded(menu)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)

    await page.keyboard.press('Enter')

    expect(await page.textContent(cellSelector)).toEqual(selectedName)

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.DEFAULT)
    await expect(memex.omnibar.INPUT).toBeFocused()

    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(false)
    expect(await page.textContent(cellSelector)).toMatch('')
  })

  test('Pressing any Arrow keys while focused on filter input does not leave edit mode', async ({page}) => {
    const cellEditorId = await getTableColumnId(page, AARDVARK_COLUMN_NAME)
    const cellEditorSeletor = _(cellEditorTestId(0, cellEditorId.toString()))

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, cellEditorSeletor)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)

    await filterInput.press('ArrowUp')
    await filterInput.press('ArrowDown')
    await filterInput.press('ArrowLeft')
    await filterInput.press('ArrowRight')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, cellEditorSeletor)).toBe(true)
  })
})
