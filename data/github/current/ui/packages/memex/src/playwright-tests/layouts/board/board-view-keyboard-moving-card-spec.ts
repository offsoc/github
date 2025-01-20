import {expect} from '@playwright/test'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {CardMove, CardMoveUI} from '../../../client/api/stats/contracts'
import {test} from '../../fixtures/test-extended'
import {testPlatformMeta} from '../../helpers/utils'
import {BacklogColumn, DoneColumn, InProgressColumn, MissingStatusColumn, ReadyColumn} from '../../types/board'

// We are redefining this attribute here instead of importing it from the client code, because
// otherwise we end up with a ES Modules require() error. Might be worth trying again once we
// clean up the drag/drop code and our dependency on lodash.
const COLUMN_HAS_OUTLINE_ATTRIBUTE = 'data-board-column-has-outline'

test.describe('Board view keyboard moving card', () => {
  test('Can move card with keyboard', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    // Select card
    const card = memex.boardView.getCard(BacklogColumn.Label, 0)
    const cardId = await card.getCardId()
    await memex.boardView.getCard(BacklogColumn.Label, 0).focus()

    // Enter selecton mode and move down one card
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Expect the first card to now be the second card
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectDataBoardCardId(cardId)

    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({fieldId: '20e5d8ab', itemId: cardId}),
      ui: CardMoveUI.KeyboardShortcut,
      memexProjectViewNumber: 1,
    })
  })

  test('Cannot move card with keyboard without write permissions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode', {
      viewType: 'board',
    })
    const firstCard = memex.boardView.getCard(BacklogColumn.Label, 0)
    const secondCard = memex.boardView.getCard(BacklogColumn.Label, 1)

    await firstCard.expectDataBoardCardId(3)
    await firstCard.expectNotKeyboardMovingCard()
    await firstCard.expectSelectionState(false)
    await firstCard.expectNotToBeFocused()

    // Attempt to enter selecton mode on the first Backlog card and move down one card
    await firstCard.focus()
    await page.keyboard.press('Enter')
    await firstCard.expectNotKeyboardMovingCard()
    await firstCard.expectSelectionState(false)
    await firstCard.expectToBeFocused()

    // Ensure the previously focused card is not moved
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await secondCard.expectDataBoardCardId(5)
    await secondCard.expectNotKeyboardMovingCard()
    await secondCard.expectSelectionState(false)

    // Focus is moved to the second card
    await firstCard.expectNotToBeFocused()
    await secondCard.expectToBeFocused()
  })

  test('Card updates keyboard moving card state throughout lifecycle', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    const firstCard = memex.boardView.getCard(BacklogColumn.Label, 0)
    const secondCard = memex.boardView.getCard(BacklogColumn.Label, 1)

    await firstCard.expectDataBoardCardId(3)
    await firstCard.expectSelectionState(false)
    await firstCard.expectNotKeyboardMovingCard()
    await firstCard.focus()

    // Enter keyboard moving card state
    await page.keyboard.press('Enter')
    await firstCard.expectKeyboardMovingCard()
    await firstCard.expectSelectionState(true)
    await firstCard.expectToBeFocused()

    // Move the card down and commit the change
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Confirm focus has followed the card that has moved which is now in the second card position
    await firstCard.expectNotKeyboardMovingCard()
    await firstCard.expectNotToBeFocused()
    await secondCard.expectDataBoardCardId(3)
    await secondCard.expectNotKeyboardMovingCard()
    await secondCard.expectSelectionState(true)
    await secondCard.expectToBeFocused()
  })

  test('Can click another card to remove selected focus', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const backlogCard = memex.boardView.getCard(BacklogColumn.Label, 0)
    const doneCard = memex.boardView.getCard(DoneColumn.Label, 0)

    await backlogCard.expectDataBoardCardId(3)
    await backlogCard.expectSelectionState(false)
    await backlogCard.expectNotKeyboardMovingCard()
    await backlogCard.focus()

    // Enter keyboard moving state on focused card
    await page.keyboard.press('Enter')
    await backlogCard.expectKeyboardMovingCard()
    await backlogCard.expectSelectionState(true)

    // Change focus to another card in another column by clicking on it to clear the selection state
    await doneCard.click()
    await doneCard.expectNotKeyboardMovingCard()
    await doneCard.expectSelectionState(false)
    await doneCard.expectToBeFocused()

    // Confirm original keyboard selected card is no longer keyboard selected
    await backlogCard.expectNotKeyboardMovingCard()
    await backlogCard.expectSelectionState(false)
    await backlogCard.expectNotToBeFocused()
  })

  test('Can move card with keyboard to column with no items', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    expect(await memex.boardView.getColumn(InProgressColumn.Label).getCardCount()).toEqual(0)

    // Select card
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectDataBoardCardId(3)
    await memex.boardView.getCard(BacklogColumn.Label, 0).focus()

    // Enter selecton mode and move down one card
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    // Expect the first card in the In Progress column to now be the first card from Backlog column
    expect(await memex.boardView.getColumn(InProgressColumn.Label).getCardCount()).toEqual(1)
    await memex.boardView.getCard(InProgressColumn.Label, 0).expectDataBoardCardId(3)

    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({fieldId: '47fc9ee4', itemId: 3}),
      ui: CardMoveUI.KeyboardShortcut,
      memexProjectViewNumber: 1,
    })
  })

  test('Can move card with keyboard below a redacted item', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectDataBoardCardId(1)
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).focus()

    // Enter selecton mode and move down one card
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Expect the first card to now appear after the redacted card in the same column
    await memex.boardView.getCard(MissingStatusColumn.Label, 1).expectDataBoardCardId(1)
  })

  test('Can move card with keyboard across multiple columns with no cards', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectDataBoardCardId(3)
    await memex.boardView.getCard(BacklogColumn.Label, 0).focus()

    // Enter selecton mode and move down one card
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    // Expect the first card from Backlog column to now be the first card in Ready column
    await memex.boardView.getCard(ReadyColumn.Label, 0).expectDataBoardCardId(3)
  })

  test('When moving card with keyboard across multiple columns, card will be inserted at top of column', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectDataBoardCardId(5)
    await memex.boardView.getCard(BacklogColumn.Label, 1).focus()

    // Enter selecton mode and move card to Done column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    // Expect the card that moved to now be the first card in Done column
    await memex.boardView.getCard(DoneColumn.Label, 0).expectDataBoardCardId(5)
  })

  test('When moving card with keyboard is canceled using the escape key while in the same column, focus is returned to selected card', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(BacklogColumn.Label, 1).focus()
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToBeFocused()

    // Enter selecton mode
    await page.keyboard.press('Enter')
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectSelectionState(true)

    // Focus is moved to first card
    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectNotToBeFocused()

    // Ensure focus is reverted to original card
    await page.keyboard.press('Escape')
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectNotToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectNotKeyboardMovingCard()
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectSelectionState(false)
  })

  test('When moving card with keyboard is canceled using the escape key on column with no cards, focus is returned to selected card', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const backlogCard = memex.boardView.getCard(BacklogColumn.Label, 0)

    // Select card
    await backlogCard.expectDataBoardCardId(3)
    await backlogCard.focus()
    await backlogCard.expectToBeFocused()

    // Enter selecton mode and move card to In Progress column that has 0 cards
    expect(await memex.boardView.getColumn(InProgressColumn.Label).getCardCount()).toEqual(0)
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await backlogCard.expectNotToBeFocused()

    // Ensure focus is reverted to original card in backlog column
    await page.keyboard.press('Escape')
    await backlogCard.expectToBeFocused()
  })

  test('When moving card with keyboard is canceled using the tab key on column with no cards, focus is returned to the original card context menu', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const backlogCard = memex.boardView.getCard(BacklogColumn.Label, 0)

    // Select card
    await backlogCard.expectDataBoardCardId(3)
    await backlogCard.focus()
    await backlogCard.expectToBeFocused()

    // Enter selecton mode and move card to Done column
    await backlogCard.expectSelectionState(false)
    await page.keyboard.press('Enter')
    await backlogCard.expectSelectionState(true)

    // Exit keyboard moving card mode using Tab and focus is turned to the context menu button within the original card
    await page.keyboard.press('ArrowRight')
    await backlogCard.expectNotToBeFocused()
    await page.keyboard.press('Tab')
    await expect(backlogCard.CARD_CONTEXT_MENU_TRIGGER).toBeFocused()
  })

  test('When moving card with keyboard is canceled using the tab key while focused on another card, focus is returned to the original card context menu', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const backlogCard = memex.boardView.getCard(BacklogColumn.Label, 0)

    // Select card
    await backlogCard.expectDataBoardCardId(3)
    await backlogCard.focus()
    await backlogCard.expectToBeFocused()

    // Enter selecton mode and move card to Done column
    await backlogCard.expectSelectionState(false)
    await page.keyboard.press('Enter')
    await backlogCard.expectSelectionState(true)

    // Exit keyboard moving card mode using Tab and focus is turned to the context menu button within the original card
    await page.keyboard.press('ArrowDown')
    await backlogCard.expectNotToBeFocused()
    await page.keyboard.press('Tab')
    await expect(backlogCard.CARD_CONTEXT_MENU_TRIGGER).toBeFocused()
  })

  test('When moving card with keyboard is canceled using the escape key on a card in another column, focus is returned to selected card', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).focus()
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectToBeFocused()

    // Enter selecton mode and move card to Backlog column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')

    // Ensure focus has been moved to another column
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectNotToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Exit keyboard moving card mode using Exit and focus is returned to the original card
    await page.keyboard.press('Escape')
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectNotToBeFocused()
  })

  test('When moving card with keyboard the user can select a new card to move by pressing shift+space key binding', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(DoneColumn.Label, 0).expectDataBoardCardId(2)
    await memex.boardView.getCard(DoneColumn.Label, 0).focus()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectNotKeyboardMovingCard()

    // Enter selecton mode
    await page.keyboard.press('Enter')
    await memex.boardView.getCard(DoneColumn.Label, 0).expectSelectionState(true)

    // Move focus and select the next card
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+ ')

    // New card is selected using Shift+Space key binding
    await memex.boardView.getCard(DoneColumn.Label, 1).expectDataBoardCardId(4)
    await memex.boardView.getCard(DoneColumn.Label, 0).expectNotKeyboardMovingCard()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectSelectionState(false)
    await memex.boardView.getCard(DoneColumn.Label, 1).expectKeyboardMovingCard()
    await memex.boardView.getCard(DoneColumn.Label, 1).expectSelectionState(true)
  })

  test('When moving card with keyboard the user can exit keyboard moving mode by selecting another card using shift+down key binding', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(DoneColumn.Label, 0).expectDataBoardCardId(2)
    await memex.boardView.getCard(DoneColumn.Label, 0).focus()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectNotKeyboardMovingCard()

    // Enter selecton mode and move to the next card
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowDown')

    await memex.boardView.getCard(DoneColumn.Label, 0).expectSelectionState(true)
    await memex.boardView.getCard(DoneColumn.Label, 0).expectKeyboardMovingCard()
    await memex.boardView.getCard(DoneColumn.Label, 1).expectDataBoardCardId(4)
    await memex.boardView.getCard(DoneColumn.Label, 1).expectSelectionState(false)
    await page.keyboard.press('Shift+ArrowDown')

    // Neither card is in keyboard moving mode but are both selected
    await memex.boardView.getCard(DoneColumn.Label, 0).expectNotKeyboardMovingCard()
    await memex.boardView.getCard(DoneColumn.Label, 1).expectNotKeyboardMovingCard()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectSelectionState(true)
    await memex.boardView.getCard(DoneColumn.Label, 1).expectSelectionState(true)
  })

  test('Can move card with keyboard to top of same column', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    // Select card
    const card = memex.boardView.getCard(BacklogColumn.Label, 1)
    const cardId = await card.getCardId()
    await memex.boardView.getCard(BacklogColumn.Label, 1).focus()

    // Enter selecton mode and move card up to top of row
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')

    // Expect the second card to now be the first card
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectDataBoardCardId(cardId)
  })

  test('Can move card with keyboard to the top of another column', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectDataBoardCardId(1)
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).focus()

    // Enter selecton mode and move card to the top of the Backlog column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')

    // Expect the first card to now be the first card from Missing Status column
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectDataBoardCardId(1)
  })

  test('Can move card with keyboard to bottom of nearby column that has less cards than original column', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    expect(await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()).toEqual(3)
    expect(await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()).toEqual(2)

    // Select last card in Done column which has more cards than nearby Backlog column
    await memex.boardView.getCard(MissingStatusColumn.Label, 2).expectDataBoardCardId(11)
    await memex.boardView.getCard(MissingStatusColumn.Label, 2).focus()

    // Enter selecton mode and move card to the left, entering the bottom of Backlog column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    // Expect the last card to now be the selected card from Missing Status column
    await memex.boardView.getCard(BacklogColumn.Label, 2).expectDataBoardCardId(11)
    expect(await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()).toEqual(2)
    expect(await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()).toEqual(3)
  })

  test('Limits upwards keyboard navigation while moving card with keyboard', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(BacklogColumn.Label, 1).focus()

    // Enter selecton mode and attempt to move card beyond number of cards in column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')

    // Expect the first card to maintain focus, not the search input
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()
  })

  test('Limits downwards keyboard navigation while moving card with keyboard', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select second to last card in Backlog column
    await memex.boardView.getCard(BacklogColumn.Label, 0).focus()
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Enter selecton mode and attempt to move card past end of column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')

    // Expect the last card in column to maintain focus, not the Omnibar
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToBeFocused()
  })

  test('Limits left keyboard navigation while moving card with keyboard to avoid an empty, hidden MissingVerticalGroupId column', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    // Select a card in the leftmost visible Backlog column
    await memex.boardView.getCard(BacklogColumn.Label, 1).focus()

    // Enter selecton mode and attempt to move card to the left into the hidden MissingVerticalGroupId column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowLeft')

    // Expect the original card to maintain focus, not lost in the empty, hidden MissingVerticalGroupId column
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToBeFocused()

    // Ensure that focus can still be moved afterwards
    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()
  })

  test('Limits first (ctrl+left) keyboard navigation while moving card with keyboard to avoid an empty, hidden MissingVerticalGroupId column', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
    })

    // Select a card in the rightmost visible Done column
    const card = memex.boardView.getCard(DoneColumn.Label, 2)
    const cardId = await card.getCardId()
    await memex.boardView.getCard(DoneColumn.Label, 2).focus()

    // Enter selecton mode and move focus to the leftmost visible Backlog column using Ctrl+Left
    await page.keyboard.press('Enter')
    await page.keyboard.press(`${testPlatformMeta}+ArrowLeft`)

    // Expect the focus in the Backlog column, not lost in the empty, hidden MissingVerticalGroupId column
    await memex.boardView.getCard(BacklogColumn.Label, 2).expectToBeFocused()

    // Hit Enter to move the card, and expect it to be focused in the Backlog column
    await page.keyboard.press('Enter')
    await memex.boardView.getCard(BacklogColumn.Label, 3).expectToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 3).expectDataBoardCardId(cardId)
  })

  test('Can move card with keyboard to top of column using meta+up', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select second to last card in Done column
    const card = memex.boardView.getCard(DoneColumn.Label, 2)
    const cardId = await card.getCardId()
    await memex.boardView.getCard(DoneColumn.Label, 2).focus()
    await memex.boardView.getCard(DoneColumn.Label, 2).expectToBeFocused()

    // Enter selecton mode and move card down to end of column
    await page.keyboard.press('Enter')
    await page.keyboard.press(`${testPlatformMeta}+ArrowUp`)
    await page.keyboard.press('Enter')

    // Expect the last card to be the new first card of Done column
    await memex.boardView.getCard(DoneColumn.Label, 0).expectDataBoardCardId(cardId)
  })

  test('Can move card with keyboard to bottom of column using meta+down', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select first card in Done column
    await memex.boardView.getCard(DoneColumn.Label, 0).expectDataBoardCardId(2)
    await memex.boardView.getCard(DoneColumn.Label, 0).focus()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectToBeFocused()

    // Enter selecton mode and move card down to end of column
    await page.keyboard.press('Enter')
    await page.keyboard.press(`${testPlatformMeta}+ArrowDown`)
    await page.keyboard.press('Enter')

    // Expect the first card to now be the new last card of Done column
    await memex.boardView.getCard(DoneColumn.Label, 2).expectDataBoardCardId(2)
  })

  test('Clicking another card after attempting to move a card with a keyboard exits mode', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    // Select card
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectDataBoardCardId(3)
    await memex.boardView.getCard(BacklogColumn.Label, 0).focus()
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Enter selecton mode on top card in Backlog column
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectSelectionState(false)
    await page.keyboard.press('Enter')
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectSelectionState(true)

    // Focus on another card without using keyboard navigation
    await memex.boardView.getCard(DoneColumn.Label, 0).expectSelectionState(false)
    await memex.boardView.getCard(DoneColumn.Label, 0).click()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectToBeFocused()
    await memex.boardView.getCard(DoneColumn.Label, 0).expectSelectionState(true)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectNotToBeFocused()
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectSelectionState(false)
  })
})

test.describe('Board view moving multiple cards with keyboard', () => {
  test('Can move multiple cards with keyboard', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'board'})

    await memex.boardView.getColumn(InProgressColumn.Label).expectCardCount(0)

    // Focus a card, then press shift+arrow down to select multiple cards
    const card = memex.boardView.getCard(BacklogColumn.Label, 0)
    await card.expectDataBoardCardId(3)
    await card.focus()
    await page.keyboard.press(`Shift+ArrowDown`)

    // Press enter to start moving, left/right to move focus to another column, and enter to move cards to other column
    await page.keyboard.press('Enter')
    await card.expectToBeFocused() // first focused card should still be focused while moving
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    // expect cards to be moved
    await memex.boardView.getColumn(InProgressColumn.Label).expectCardCount(2)
    await memex.boardView.getCard(InProgressColumn.Label, 0).expectDataBoardCardId(3)
    await memex.boardView.getCard(InProgressColumn.Label, 1).expectDataBoardCardId(5)

    // focus should be on first focused card
    await memex.boardView.getCard(InProgressColumn.Label, 0).expectToBeFocused()

    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({fieldId: '47fc9ee4', itemIds: [3, 5]}),
      ui: CardMoveUI.KeyboardShortcut,
      memexProjectViewNumber: 1,
    })
  })

  test('Shows column outline when moving multiple cards', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'board'})

    // Focus a card
    const card1 = memex.boardView.getCard(BacklogColumn.Label, 0)
    await card1.expectDataBoardCardId(3)
    await card1.focus()
    await card1.expectToBeFocused()

    // Select multiple cards
    await page.keyboard.press(`Shift+ArrowDown`)

    const backlogColumn = memex.boardView.getColumn(BacklogColumn.Label).columnLocator
    await expect(backlogColumn).toHaveAttribute(COLUMN_HAS_OUTLINE_ATTRIBUTE, 'false')

    // Press enter to start moving
    await page.keyboard.press('Enter')
    await expect(backlogColumn).toHaveAttribute(COLUMN_HAS_OUTLINE_ATTRIBUTE, 'true')

    // Move to another column
    await page.keyboard.press('ArrowRight')
    await expect(backlogColumn).toHaveAttribute(COLUMN_HAS_OUTLINE_ATTRIBUTE, 'false')
    await expect(memex.boardView.getColumn(InProgressColumn.Label).columnLocator).toHaveAttribute(
      COLUMN_HAS_OUTLINE_ATTRIBUTE,
      'true',
    )
  })

  test('Focus is returned to first focused card after canceling movement', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'board'})

    // Focus a card
    const card1 = memex.boardView.getCard(BacklogColumn.Label, 0)
    await card1.expectDataBoardCardId(3)
    await card1.focus()
    await card1.expectToBeFocused()

    // Select multiple cards
    await page.keyboard.press(`Shift+ArrowDown`)

    // Press enter to start moving and move to another column
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')

    // Cancel movement
    await page.keyboard.press('Escape')

    // Expect focus to be on first focused card
    await card1.expectDataBoardCardId(3)
    await card1.expectToBeFocused()
  })
})

test.describe('Sash when moving cards with keyboard', () => {
  test('Moving cards when sorted only shows column outline', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      sortedBy: {columnId: SystemColumnId.Status, direction: 'asc'},
    })

    await expect(memex.boardView.getColumn(DoneColumn.Label).columnLocator).toHaveAttribute(
      COLUMN_HAS_OUTLINE_ATTRIBUTE,
      'false',
    )

    await memex.boardView.getCard(DoneColumn.Label, 2).focus()
    await memex.boardView.getCard(DoneColumn.Label, 2).expectToBeFocused()

    await page.keyboard.press('Enter')

    await expect(memex.boardView.getColumn(DoneColumn.Label).columnLocator).toHaveAttribute(
      COLUMN_HAS_OUTLINE_ATTRIBUTE,
      'true',
    )

    await page.keyboard.press('ArrowLeft')

    await expect(memex.boardView.getColumn(ReadyColumn.Label).columnLocator).toHaveAttribute(
      COLUMN_HAS_OUTLINE_ATTRIBUTE,
      'true',
    )
    await expect(memex.boardView.getColumn(DoneColumn.Label).columnLocator).toHaveAttribute(
      COLUMN_HAS_OUTLINE_ATTRIBUTE,
      'false',
    )
  })

  test('Moving cards when not sorted shows sash', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const column = memex.boardView.getColumn(DoneColumn.Label).columnLocator
    await expect(memex.boardView.SASH).toBeHidden()
    await expect(column).toHaveAttribute(COLUMN_HAS_OUTLINE_ATTRIBUTE, 'false')

    await memex.boardView.getCard(DoneColumn.Label, 2).focus()
    await memex.boardView.getCard(DoneColumn.Label, 2).expectToBeFocused()

    await page.keyboard.press('Enter')

    await expect(memex.boardView.SASH).toBeVisible()
    await expect(column).toHaveAttribute(COLUMN_HAS_OUTLINE_ATTRIBUTE, 'false')
  })
})
