import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {mustFind, waitForSelectorCount} from '../../../helpers/dom/assertions'
import {getInputValue, hasDOMFocus} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import {selectMenuOptionsAreLoaded} from '../../../helpers/table/assertions'
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

const CELL_SELECTOR = _(cellTestId(3, 'Milestone'))
const NEXT_ROW_CELL_SELECTOR = _(cellTestId(4, 'Milestone'))
const CELL_EDITOR_SELECTOR = _(cellEditorTestId(3, 'Milestone'))

test.describe('Entering edit mode when cell is not focused', () => {
  test('Single clicking on the caret in an unfocused cell puts it in edit mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)

    const caret = await getDropdownCaret(page, CELL_SELECTOR)
    await caret.click()

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
  })

  test('Double clicking on an unfocused cell puts it in edit mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
  })
})

test.describe('Entering edit mode from focus mode', () => {
  test('Pressing Enter opens select menu with focus on empty filter input', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    expect(await getInputValue(page, filterInput)).toBe('')
  })

  test('Pressing [A-z] opens select menu with focus on filter input with typed character', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.type('h')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    expect(await getInputValue(page, filterInput)).toBe('h')
  })

  test('Pressing Backspace clears the cell without opening edit mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await page.textContent(CELL_SELECTOR)).not.toBe('')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Backspace')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(CELL_SELECTOR)).toBe('')
  })

  test('Pressing Delete clears the cell without opening edit mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await page.textContent(CELL_SELECTOR)).not.toBe('')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Delete')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await page.textContent(CELL_SELECTOR)).toBe('')
  })

  test('Filtering cell returns filtered options', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)
    await waitForSelectorCount(page, _('table-cell-editor-row'), 5)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    await page.keyboard.insertText('Limited Beta')
    await waitForSelectorCount(page, _('table-cell-editor-row'), 1)
  })

  test('Filtering cell returns empty results if no results exist', async ({page, memex}) => {
    const fakeMilestone = 'Non Existent Milestone'
    await memex.navigateToStory('integrationTestsWithItems')

    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)
    await page.keyboard.insertText(fakeMilestone)
    await waitForSelectorCount(page, _('table-cell-editor-row'), 0)
    await waitForSelectorCount(page, _('table-cell-editor-empty-row'), 1)
    await waitForSelectorCount(page, _('add-column-option'), 0) // New milestones can't be created
  })
})

test.describe('Exiting edit mode', () => {
  test('Pressing Escape returns to focus mode without saving', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await page.textContent(CELL_SELECTOR)).toMatch(/v0.1/)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    await page.keyboard.press('Escape')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toMatch(/v0.1/)
  })

  test('Clicking a selection returns to focus button and updates value', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await page.textContent(CELL_SELECTOR)).toMatch(/v0.1/)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const menu = await getSelectMenu(page, CELL_EDITOR_SELECTOR)
    await selectOption(menu, '/v1.0/')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toMatch(/v1.0/)
  })

  test('Pressing Enter on a selection focuses next row and updates value', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    expect(await page.textContent(CELL_SELECTOR)).toMatch(/v0.1/)

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const menu = await getSelectMenu(page, CELL_EDITOR_SELECTOR)
    await selectMenuOptionsAreLoaded(menu)
    await page.keyboard.insertText('1.0')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, NEXT_ROW_CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toMatch(/v1.0/)
  })

  test('Pressing Enter while focused on filter input selects first item', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await setCellToEditMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(true)

    const menu = await getSelectMenu(page, CELL_EDITOR_SELECTOR)
    await selectMenuOptionsAreLoaded(menu)

    const filterInput = await getSelectMenuFilterInput(page, CELL_EDITOR_SELECTOR)
    expect(await hasDOMFocus(page, filterInput)).toBe(true)

    await filterInput.press('Enter')

    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.DEFAULT)
    expect(await getCellMode(page, NEXT_ROW_CELL_SELECTOR)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, CELL_EDITOR_SELECTOR)).toBe(false)
    expect(await page.textContent(CELL_SELECTOR)).toMatch('')
  })

  test('Pressing any Arrow keys while focused on filter input does not leave edit mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

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

  test('Clicking outside the table while the editor menu is open leaves both edit and focus mode', async ({
    page,
    memex,
  }) => {
    test.fixme()

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

test.describe('Blankslate', () => {
  test('shows custom message when an item does not have any milestones from repository', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithoutMilestoneData')
    const milestoneCell = _(cellTestId(0, 'Milestone'))
    const milestoneCellEditor = _(cellEditorTestId(0, 'Milestone'))

    await setCellToEditMode(page, milestoneCell)
    expect(await getCellMode(page, milestoneCell)).toBe(CellMode.EDITING)
    expect(await isSelectMenuOpen(page, milestoneCellEditor)).toBe(true)

    await waitForSelectorCount(page, _('table-cell-editor-blankslate-row'), 1)

    const blankslateItemElement = await mustFind(page, _('table-cell-editor-blankslate-row'))
    const blankslateItemElementValue = await blankslateItemElement.textContent()
    expect(blankslateItemElementValue).toMatch('No milestones to show.')
  })
})

test.describe('Error handling', () => {
  test('showing error message when failing to load suggestions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInErrorMode')
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
