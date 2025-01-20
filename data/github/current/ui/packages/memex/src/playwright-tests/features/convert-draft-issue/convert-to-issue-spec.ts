import {expect, type Page} from '@playwright/test'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {mustFind, mustNotFind, waitForSelectorCount} from '../../helpers/dom/assertions'
import {click, doubleClick} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {assertRowMatchesType} from '../../helpers/table/assertions'
import {getSelectMenu, isSelectMenuOpen, selectOption, setCellToFocusMode} from '../../helpers/table/interactions'
import {
  cellEditorTestId,
  cellTestId,
  getCellMode,
  getDropdownCaret,
  getTableCell,
  getTableRow,
} from '../../helpers/table/selectors'
import {eventually} from '../../helpers/utils'
import {ItemType} from '../../types/board'
import {CellMode} from '../../types/table'

const EXTENDED_TIMEOUT = 10_000

test.describe('Convert Card to Issue', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('Draft issue cards can be converted to Issue', async ({page, memex}) => {
    await memex.boardView.getCard('No Status', 0).expectCardType(ItemType.DraftIssue)
    await memex.boardView.getCard('No Status', 0).openContextMenu()
    await memex.boardView.clickCardContextMenuItem('convert-to-issue')

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await memex.boardView.getCard('No Status', 0).expectCardType(ItemType.Issue)
  })

  test.describe('Repo picker', () => {
    test('Search term containing "e" characters should not trigger the Archive shortcut', async ({page, memex}) => {
      await memex.boardView.getCard('No Status', 0).expectCardType(ItemType.DraftIssue)

      await memex.boardView.getCard('No Status', 0).openContextMenu()
      await memex.boardView.clickCardContextMenuItem('convert-to-issue')

      // find the repo picker input
      const repoPicker = await mustFind(page, _('repo-picker-repo-list'))

      // find the input
      // eslint-disable-next-line no-restricted-syntax
      const repoListInput = await repoPicker.$('input')
      await repoListInput.focus()

      await assertRepositoriesVisible(page, 5)

      await page.keyboard.insertText('e')

      await expect(page.getByRole('alertdialog')).toBeHidden()
      expect(await repoListInput.inputValue()).toBe('e')
    })

    test('Delete key press in search field should not trigger the Delete shortcut', async ({page, memex}) => {
      await memex.boardView.getCard('No Status', 0).expectCardType(ItemType.DraftIssue)

      await memex.boardView.getCard('No Status', 0).openContextMenu()
      await memex.boardView.clickCardContextMenuItem('convert-to-issue')

      // find the repo picker input
      const repoPicker = await mustFind(page, _('repo-picker-repo-list'))

      // find the input
      // eslint-disable-next-line no-restricted-syntax
      const repoListInput = await repoPicker.$('input')
      await repoListInput.focus()

      await page.keyboard.insertText('eeee')
      await page.keyboard.press('Delete')

      await expect(page.getByRole('alertdialog')).toBeHidden()
    })
  })
})

async function primeRepositoryStoreCache(page: Page, memex: MemexApp) {
  await expect(memex.tableView.TABLE_ROOT).toBeVisible()

  await memex.omnibar.INPUT.focus()
  await page.keyboard.insertText('#')

  await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)

  // clear the text to put the table back to a known good state
  await memex.omnibar.INPUT.selectText()
  await page.keyboard.press('Backspace')
}

async function clickPromptToStartFlow(page: Page) {
  await page.waitForSelector(_('draft-prompt-convert-to-issue'))
  await click(page, _('draft-prompt-convert-to-issue'))
}

async function assertRepositoriesVisible(page: Page, count: number) {
  const repoListSelector = _('repo-picker-repo-list')
  // if we see this message, we have no repositories listed at all
  await mustNotFind(page, `${repoListSelector} div[text="No Results"]`)
  await waitForSelectorCount(page, `${repoListSelector} div[name]`, count)
}

test.describe('Convert Row to Issue', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {})
  })

  test('Draft issue row can be converted to Issue using row context menu', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)
    const row = await getTableRow(page, 3)
    await click(row, _('row-menu-trigger'))
    await click(page, _('row-menu-convert-to-issue'))

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)

    await assertRowMatchesType(page, 3, ItemType.Issue)
  })

  test('Draft issue row can be converted to Issue by interacting with a restricted cell', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)
    const row = await getTableRow(page, 3)

    await doubleClick(row, _(cellTestId(2, 'Milestone')))

    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    await mustFind(page, _(cellEditorTestId(2, 'Milestone')))
  })

  test('Draft issue row can be converted to Issue by clicking on a labels cell', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const caret = await getDropdownCaret(page, _(cellTestId(2, 'Labels')))
    await caret.click()

    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    await mustFind(page, _(cellEditorTestId(2, 'Labels')))
  })

  test('Draft issue row can be converted to Issue by clicking on an issue type cell', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)
    const row = await getTableRow(page, 3)

    await doubleClick(row, _(cellTestId(2, 'Type')))

    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    await mustFind(page, _(cellEditorTestId(2, 'Type')))
  })

  // The following test is verifying a fix for this bug: https://github.com/github/memex/issues/7714
  test('Labels can be edited on a draft issue that was converted to an issue by clicking the prompt in the labels field', async ({
    page,
  }) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const cellSelector = _(cellTestId(2, 'Labels'))
    const cellTextBefore = await page.textContent(cellSelector)

    const caret = await getDropdownCaret(page, cellSelector)
    await caret.click()
    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    const cellEditorSelector = _(cellEditorTestId(2, 'Labels'))

    await mustFind(page, cellEditorSelector)

    const menu = await getSelectMenu(page, cellEditorSelector)
    await selectOption(menu, 'blocker')

    await setCellToFocusMode(page, cellSelector)

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSelector)).toBe(false)

    await eventually(async () => {
      expect(await page.textContent(cellSelector)).toEqual(`blocker${cellTextBefore}`)
    })
  })

  test('Draft issue row can be converted to Issue by clicking on a milestone cell', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const caret = await getDropdownCaret(page, _(cellTestId(2, 'Milestone')))
    await caret.click()

    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    await mustFind(page, _(cellEditorTestId(2, 'Milestone')))
  })

  // The following test is verifying a fix for this bug: https://github.com/github/memex/issues/7714
  test('Milestone can be edited on a draft issue that was converted to an issue by clicking the prompt in the milestone field', async ({
    page,
  }) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const cellSelector = _(cellTestId(2, 'Milestone'))
    const cellTextBefore = await page.textContent(cellSelector)

    const caret = await getDropdownCaret(page, cellSelector)
    await caret.click()
    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    const cellEditorSelector = _(cellEditorTestId(2, 'Milestone'))

    await mustFind(page, cellEditorSelector)

    const menu = await getSelectMenu(page, cellEditorSelector)
    await selectOption(menu, 'Sprint 9')

    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    expect(await isSelectMenuOpen(page, cellEditorSelector)).toBe(false)

    await eventually(async () => {
      expect(await page.textContent(cellSelector)).toEqual(`Sprint 9${cellTextBefore}`)
    })
  })

  test('Draft issue row can be converted to Issue by clicking on a restricted cell arrow', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const caret = await getDropdownCaret(page, _(cellTestId(2, 'Milestone')))
    await caret.click()

    await clickPromptToStartFlow(page)

    await assertRepositoriesVisible(page, 5)

    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)
    await assertRowMatchesType(page, 3, ItemType.Issue)

    await mustFind(page, _(cellEditorTestId(2, 'Milestone')))
  })

  test('Draft issue row should open repo picker when clicking on Repository cell', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const caret = await getDropdownCaret(page, _(cellTestId(2, 'Repository')))
    await caret.click()

    await assertRepositoriesVisible(page, 5)
  })

  test('Draft issue row should allow interaction with non-restricted cells', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const caret = await getDropdownCaret(page, _(cellTestId(2, 'Status')))
    await caret.click()

    await mustFind(page, _(cellEditorTestId(2, 'Status')))
  })
})

test.describe('Convert Row to Issue in Readonly mode', () => {
  test('Draft issue is not editable in read mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode', {
      viewType: 'table',
    })
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const cell = page.getByTestId(cellTestId(3, 'Assignees'))
    await mustNotFind(cell, 'button')
  })
})

test.describe('Convert Row to Issue', () => {
  test.beforeEach(async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {})

    // we need to prime the repository store before the test by interacting with
    // the omnibar, which will cause the RepositoryStore to have some initial
    // state to get these tests passing
    await primeRepositoryStoreCache(page, memex)
  })

  test('Draft issue row does not need to be converted to assign', async ({page}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const caret = await getDropdownCaret(page, _(cellTestId(2, 'Assignees')))
    await caret.click()

    await mustFind(page, _(cellEditorTestId(2, 'Assignees')))
  })
})

test.describe('Convert from Side Pane', () => {
  test.beforeEach(async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {})

    // we need to prime the repository store before the test by interacting with
    // the omnibar, which will cause the RepositoryStore to have some initial
    // state to get these tests passing
    await primeRepositoryStoreCache(page, memex)
  })

  test('Can convert draft issue from side pane actions and keep the side pane opened', async ({page, memex}) => {
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const thirdRow = await getTableRow(page, 3)
    const firstCell = await getTableCell(thirdRow, 1)
    const text = firstCell.locator(':right-of(svg)')

    await text.click()

    await expect(memex.sidePanel.getDraftSidePanel('Here is a Draft Issue!')).toBeVisible()

    await click(page, `${_('side-pane-convert-to-issue')}`)
    await click(page, `${_('repo-picker-repo-list')} div[data-id="1"]`)

    // Expect the item pane to be visible
    await expect(memex.sidePanel.getIssueSidePanel('Here is a Draft Issue!')).toBeVisible()

    // Expect the issue item rendered after being converted
    await page.waitForSelector(_('side-pane-convert-to-issue'), {state: 'detached'})
  })
})
