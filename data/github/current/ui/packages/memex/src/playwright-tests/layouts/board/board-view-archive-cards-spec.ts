import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'
import {BacklogColumn, DoneColumn, MissingStatusColumn} from '../../types/board'

test.describe('Archive - Board View', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('archives a card from the context menu', async ({page, memex}) => {
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, 0).openContextMenu()
    await memex.boardView.clickCardContextMenuItem('archive-item')
    await submitConfirmDialog(page, 'Archive')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(countBefore - 1)
  })

  test('archive is an option in the context menu for a draft issue', async ({page, memex}) => {
    const DRAFT_ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_ISSUE_CARD_INDEX).openContextMenu()

    const archiveOption = page.getByTestId('card-context-menu-archive-item')

    await expect(archiveOption).toBeVisible()
  })

  test('archive is not an option in the context menu for a redacted item', async ({memex}) => {
    const REDACTED_ITEM_CARD_INDEX = 1
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_ITEM_CARD_INDEX)

    await expect(firstCard.CARD_CONTEXT_MENU_TRIGGER).toBeHidden()
  })

  test('keyboard shortcut can archive a draft issue', async ({page, memex}) => {
    const DRAFT_ISSUE_CARD_INDEX = 0
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, DRAFT_ISSUE_CARD_INDEX).openContextMenu()
    await memex.boardView.clickCardContextMenuItem('archive-item')
    await submitConfirmDialog(page, 'Archive')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(countBefore - 1)
  })

  test('keyboard shortcut prevents archive action for a redacted item', async ({page, memex}) => {
    const REDACTED_ITEM_CARD_INDEX = 1

    await memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_ITEM_CARD_INDEX).click()
    await page.keyboard.press('e')

    await expect(page.getByRole('alertdialog')).toBeHidden()
  })

  test('keyboard shortcut to archive a card from the board', async ({page, memex}) => {
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    await page.keyboard.press('e')

    await submitConfirmDialog(page, 'Archive')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(countBefore - 1)
  })

  test('archiving can be undone', async ({page, memex}) => {
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await page.keyboard.press('e')
    await submitConfirmDialog(page, 'Archive')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(countBefore - 1)

    await page.keyboard.press('Control+z')

    const countAfterUndo = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfterUndo).toEqual(countBefore)
  })
})
test.describe('Archive - Board View lots of items', () => {
  test('keyboard shortcut archives multiple items including draft issues', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    const countBefore = await memex.boardView.getColumn(DoneColumn.Label).getCardCount()

    await memex.boardView.getCard(DoneColumn.Label, 0).click() // select card 1
    await page.keyboard.press('Shift+ArrowDown') // select card 2
    await page.keyboard.press('Shift+ArrowDown') // select card 3

    await page.keyboard.press('e')

    await submitConfirmDialog(page, 'Archive')

    const countAfter = await memex.boardView.getColumn(DoneColumn.Label).getCardCount()
    expect(countAfter).toBeLessThan(countBefore)
  })
})
