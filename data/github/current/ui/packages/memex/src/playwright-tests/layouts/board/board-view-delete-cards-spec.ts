import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'
import {BacklogColumn, ItemType, MissingStatusColumn} from '../../types/board'

test.describe('Delete cards', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('Deleting a card removes it from the board', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const firstCardID = await firstCard.cardLocator.getAttribute('data-board-card-id')

    await memex.boardView.getCard(MissingStatusColumn.Label, 0).openContextMenu()
    await memex.boardView.clickCardContextMenuItem('delete')

    //confirm the removal in the alert dialog
    await submitConfirmDialog(page, 'Delete')

    const nextCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const nextCardID = await nextCard.cardLocator.getAttribute('data-board-card-id')

    expect(nextCardID).not.toEqual(firstCardID)
    await nextCard.expectToBeFocused()
  })

  test('Deleting multiple cards with keyboard removes them from the board', async ({page, memex}) => {
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await page.keyboard.down('Shift')
    await memex.boardView.getCard(BacklogColumn.Label, 1).click()
    await page.keyboard.up('Shift')

    await page.keyboard.press(`Delete`)

    //confirm the removal in the alert dialog
    await submitConfirmDialog(page, 'Delete')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    expect(countAfter).toBe(countBefore - 2)
  })

  test('Deleting multiple cards with mouse removes them from the board', async ({page, memex}) => {
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await page.keyboard.down('Shift')
    await memex.boardView.getCard(BacklogColumn.Label, 1).click()
    await page.keyboard.up('Shift')

    await memex.boardView.getCard(BacklogColumn.Label, 0).openContextMenu()
    await memex.boardView.clickCardContextMenuItem('delete')

    //confirm the removal in the alert dialog
    await submitConfirmDialog(page, 'Delete')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    expect(countAfter).toBe(countBefore - 2)
  })

  test('Cancelling deletion of multiple cards preserves selection', async ({page, memex}) => {
    const countBefore = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await page.keyboard.down('Shift')
    await memex.boardView.getCard(BacklogColumn.Label, 1).click()
    await page.keyboard.up('Shift')

    await page.keyboard.press(`Delete`)

    //confirm the removal in the alert dialog
    await submitConfirmDialog(page, 'Cancel')

    await memex.boardView.getCard(BacklogColumn.Label, 0).expectSelectionState(true)
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectSelectionState(true)

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(countBefore)
  })

  test('Canceling a card deletion returns focus to the card', async ({page, memex}) => {
    const beforeCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const beforeCardID = await beforeCard.cardLocator.getAttribute('data-board-card-id')

    await memex.boardView.getCard(MissingStatusColumn.Label, 0).openContextMenu()
    await memex.boardView.clickCardContextMenuItem('delete')

    //cancel the removal in the alert dialog
    await submitConfirmDialog(page, 'Cancel')

    const afterCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const afterCardID = await afterCard.cardLocator.getAttribute('data-board-card-id')

    expect(afterCardID).toBe(beforeCardID)
    await afterCard.expectToBeFocused()
  })

  test('Hitting delete on a focused card shows delete confirmation dialog', async ({page, memex}) => {
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).click()

    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const firstCardID = await firstCard.cardLocator.getAttribute('data-board-card-id')

    await page.keyboard.press(`Delete`)

    //confirm the removal in the alert dialog
    await submitConfirmDialog(page, 'Delete')

    const nextCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const nextCardID = await nextCard.cardLocator.getAttribute('data-board-card-id')

    expect(nextCardID).not.toEqual(firstCardID)
    await nextCard.expectToBeFocused()
  })

  test('Hitting delete on a focused redacted item card do nothing', async ({page, memex}) => {
    // Verify the item is a redacted item
    const REDACTED_CARD_INDEX = 1

    await memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_CARD_INDEX).expectCardType(ItemType.RedactedItem)
    await memex.boardView.getCard(MissingStatusColumn.Label, 1).click()
    await page.keyboard.press(`Delete`)
    await memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_CARD_INDEX).expectToBeFocused()
  })
})
