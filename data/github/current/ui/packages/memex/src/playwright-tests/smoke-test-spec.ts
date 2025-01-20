import {randTextRange} from '@ngneat/falso'
import {expect} from '@playwright/test'

import {Resources} from '../client/strings'
import {test} from './fixtures/test-extended'
import {waitForSelectorCount} from './helpers/dom/assertions'
import {submitConfirmDialog} from './helpers/dom/interactions'
import {_} from './helpers/dom/selectors'
import {waitForEmptyTable, waitForRowCount} from './helpers/table/assertions'
import {
  getColumnHeaderMenuOption,
  getColumnMenuTrigger,
  getSelectMenu,
  isSelectMenuOpen,
  selectOption,
  setCellToEditMode,
  setCellToFocusMode,
} from './helpers/table/interactions'
import {
  cellEditorTestId,
  cellTestId,
  getCellMode,
  getTableCell,
  getTableCellText,
  getTableRow,
} from './helpers/table/selectors'
import {eventually, testPlatformMeta} from './helpers/utils'
import {CellMode} from './types/table'

const STATUS_CELL_SELECTOR = _(cellTestId(0, 'Status'))
const STATUS_EDITOR_SELECTOR = _(cellEditorTestId(0, 'Status'))
const EXTENDED_TIMEOUT = 10_000

test.describe('Smoke Tests', () => {
  test.describe('create memex, add items, select & remove items, keyboard navigation', () => {
    test('new draft issues can be added', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await expect(page.getByTestId('closed-project-label')).toBeHidden()
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      const firstItemText = randTextRange({min: 6, max: 12})
      await page.keyboard.insertText(firstItemText)
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      const secondItemText = randTextRange({min: 6, max: 12})
      await page.keyboard.insertText(secondItemText)
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 2)

      await eventually(async () => {
        const firstRow = await getTableRow(page, 1)
        let titleCellText = await getTableCellText(firstRow, 1)
        expect(titleCellText).toBe(firstItemText)

        const secondRow = await getTableRow(page, 2)
        titleCellText = await getTableCellText(secondRow, 1)
        expect(titleCellText).toBe(secondItemText)
      })
    })

    test('a draft issue title can be edited', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      // Add a draft issue.
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Edit the new draft issue's title.
      const draftIssueTitleCellSelector = _(cellTestId(0, 'Title'))
      await setCellToEditMode(page, draftIssueTitleCellSelector)
      await page.keyboard.type('-with-an-edit')
      await page.keyboard.press('Enter')

      await eventually(async () => {
        // Make sure the edit was persisted.
        const editedDraftIssueTitle = await page.textContent(draftIssueTitleCellSelector)
        expect(editedDraftIssueTitle).toBe('hello-there-with-an-edit')
      })
    })

    test('a draft issue render emojis successfully', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      // Add a draft issue.
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Edit the new draft issue's title.
      const draftIssueTitleCellSelector = _(cellTestId(0, 'Title'))
      await setCellToEditMode(page, draftIssueTitleCellSelector)
      await page.keyboard.type('-with-an-emoji :thinking: :octocat:')
      await page.keyboard.press('Enter')

      await eventually(async () => {
        // Make sure the edit was persisted.
        const draftIssueTitleLocator = page.locator(draftIssueTitleCellSelector)
        await expect(draftIssueTitleLocator).toHaveText('hello-there-with-an-emoji 🤔 ')

        // Ensure that custom emojis render as images
        const customEmoji = draftIssueTitleLocator.locator('img.emoji')
        await expect(customEmoji).toHaveAttribute('title', ':octocat:')
      })
    })

    test('new issues can be added', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      // Load repository suggestions.
      await page.keyboard.type('#')
      await page.waitForSelector(_('repo-searcher-list'))
      await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)

      // Filter the list of repository suggestions.
      await page.keyboard.type('gith')
      await waitForSelectorCount(page, _('repo-searcher-item'), 1)

      // Select a repository.
      await page.keyboard.press('Enter')
      await page.waitForSelector(_('issue-picker-list'))

      // Filter the list of issues suggestions.
      await page.keyboard.type('integration test fixture')
      await waitForSelectorCount(page, _('issue-picker-item'), 1)

      // Select the issue.
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      const newRow = await getTableRow(page, 1)
      const newRowTitle = await getTableCellText(newRow, 1)
      expect(newRowTitle).toEqual('I am an integration test fixture #1001')
    })

    test('items can be selected and removed with mouse', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      const firstItemText = randTextRange({min: 6, max: 12})
      await page.keyboard.type(firstItemText)
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      const secondItemText = randTextRange({min: 6, max: 12})
      await page.keyboard.type(secondItemText)
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 2)

      //focus the number row, click the dropdown
      let firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 0)
      await firstCell.getByLabel('Row actions').click()

      //find the displayed menu
      await page.waitForSelector(_('row-menu'))

      //find the delete button on the menu
      const button = page.getByTestId('row-menu-delete')
      await expect(button).toBeVisible()

      //click the remove button
      await button.focus()
      await button.click()

      await submitConfirmDialog(page, 'Delete')

      await waitForRowCount(page, 1)

      // Check that there is now just one data row with the second item text
      firstRow = await getTableRow(page, 1)
      const titleCellText = await getTableCellText(firstRow, 1)
      expect(titleCellText).toBe(secondItemText)
    })

    test('Items can be selected and removed with keyboard', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      await page.keyboard.insertText(randTextRange({min: 6, max: 12}))
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      //focus the title cell in the first row
      const firstRow = await getTableRow(page, 1)
      const titleCell = await getTableCell(firstRow, 1)
      await titleCell.click({position: {x: 1, y: 1}})

      await page.keyboard.press(`${testPlatformMeta}+Shift+\\`)

      // arrow down twice to skip the "Convert to Issue" menu item
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')

      //there should be a confirmation dialog
      await expect(page.getByRole('alertdialog')).toBeVisible()

      // the "Cancel" action is focused by default, tab to "Delete", hit enter.
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')

      await waitForEmptyTable(page)
    })
  })

  test.describe('HTML title rendering', () => {
    test('renders html for title cells', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')
      const cellSelector = _(cellTestId(7, 'Title'))
      const cellAnchorElement = page.locator(`${cellSelector} a`)

      await expect(cellAnchorElement).toHaveAttribute('href', 'https://google.com')
      await expect(cellAnchorElement).toHaveAttribute('target', '_blank')
      await expect(cellAnchorElement).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  test.describe('default status column', () => {
    test('status value on an issue can be manipulated', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      // Focus the Status cell.
      await setCellToFocusMode(page, STATUS_CELL_SELECTOR)
      await eventually(() => expect(getCellMode(page, STATUS_CELL_SELECTOR)).resolves.toBe(CellMode.FOCUSED))

      // Activate the Status cell editor.
      await page.keyboard.press('Enter')

      await eventually(async () => {
        expect(await getCellMode(page, STATUS_CELL_SELECTOR)).toBe(CellMode.EDITING)
        expect(await isSelectMenuOpen(page, STATUS_EDITOR_SELECTOR)).toBe(true)
      })

      // Make a selection.
      let menu = await getSelectMenu(page, STATUS_EDITOR_SELECTOR)
      await selectOption(menu, 'Backlog')

      await eventually(async () => {
        // Ensure the UI was updated with the selection.
        expect(await getCellMode(page, STATUS_CELL_SELECTOR)).toBe(CellMode.FOCUSED)
        expect(await isSelectMenuOpen(page, STATUS_EDITOR_SELECTOR)).toBe(false)
        expect(await page.textContent(STATUS_CELL_SELECTOR)).toEqual('Backlog')
      })

      // Make a different selection and ensure the UI was again updated to reflect it.
      // cell is already focused after last edit, so just hit enter to re-open editor
      await page.keyboard.press('Enter')
      menu = await getSelectMenu(page, STATUS_EDITOR_SELECTOR)
      await selectOption(menu, 'Ready')
      await eventually(() => expect(page.textContent(STATUS_CELL_SELECTOR)).resolves.toEqual('Ready'))
    })

    test('status value on a draft issue can be manipulated', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      // Add a draft issue.
      const firstItemText = randTextRange({min: 6, max: 12})
      await page.keyboard.insertText(firstItemText)
      await page.keyboard.press('Enter')
      await waitForRowCount(page, 1)

      // Focus the Status cell.
      await setCellToFocusMode(page, STATUS_CELL_SELECTOR)
      await eventually(() => expect(getCellMode(page, STATUS_CELL_SELECTOR)).resolves.toBe(CellMode.FOCUSED))

      // Activate the Status cell editor.
      await page.keyboard.press('Enter')

      await eventually(async () => {
        expect(await getCellMode(page, STATUS_CELL_SELECTOR)).toBe(CellMode.EDITING)
        expect(await isSelectMenuOpen(page, STATUS_EDITOR_SELECTOR)).toBe(true)
      })

      // Make a selection.
      let menu = await getSelectMenu(page, STATUS_EDITOR_SELECTOR)
      await selectOption(menu, 'Backlog')

      await eventually(async () => {
        // Ensure the UI was updated with the selection.
        expect(await getCellMode(page, STATUS_CELL_SELECTOR)).toBe(CellMode.FOCUSED)
        expect(await isSelectMenuOpen(page, STATUS_EDITOR_SELECTOR)).toBe(false)
        expect(await page.textContent(STATUS_CELL_SELECTOR)).toEqual('Backlog')
      })

      // Make a different selection and ensure the UI was again updated to reflect it.
      // cell is already focused after last edit, so just hit enter to re-open editor
      await page.keyboard.press('Enter')
      menu = await getSelectMenu(page, STATUS_EDITOR_SELECTOR)
      await selectOption(menu, 'Ready')
      await eventually(() => expect(page.textContent(STATUS_CELL_SELECTOR)).resolves.toEqual('Ready'))
    })

    test('settings view displays correctly', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

      // Open the menu.
      await menuTrigger.click()

      // Open the settings view.
      const editColumnOption = getColumnHeaderMenuOption(page, 'Stage', Resources.tableHeaderContextMenu.fieldSettings)
      await editColumnOption.click()

      // Make sure column name is visible.
      await expect(page.getByRole('textbox', {name: 'Field name'})).toBeVisible()

      // Make sure options are visible
      await waitForSelectorCount(page, 'button[data-testid="single-select-item-menu-button"]', 4)
    })
  })

  test('closed project displays closed label', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsClosed')
    await expect(page.getByTestId('closed-project-label')).toBeVisible()
  })
})
