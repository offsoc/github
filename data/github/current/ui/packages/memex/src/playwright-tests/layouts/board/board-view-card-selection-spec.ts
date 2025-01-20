import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {testPlatformMeta} from '../../helpers/utils'
import {BacklogColumn, DoneColumn, MissingStatusColumn} from '../../types/board'

test.describe('Board view card selection', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('On click and hold only one card should be selected', async ({memex}) => {
    // Select elements
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await memex.boardView.getCard(BacklogColumn.Label, 1).click({modifiers: [testPlatformMeta]})

    // Start and stop dragging
    await memex.boardView.getCard(BacklogColumn.Label, 0).click({delay: 500})

    // Check if only one element is focused
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()
  })

  test('Tab selection inside card does not break selection by mouse click', async ({page, memex}) => {
    // Select element with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    // Check if only one card is focused
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Change focus using Tab key
    await page.keyboard.press('Tab')
    await memex.boardView.expectFocusedCardCount(0)

    // Select card with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    // Check if only one card is focused
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()
  })

  test('Cards should lose focus after clicking outside of them', async ({page, memex}) => {
    // Select cards with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await memex.boardView.getCard(BacklogColumn.Label, 1).click({modifiers: [testPlatformMeta]})

    // Click on a fixed element outside of the cards.
    await page.getByRole('heading', {level: 1}).click()

    await memex.boardView.expectFocusedCardCount(0)
  })

  test('If card menu is open, cards should lose focus after clicking outside of them', async ({page, memex}) => {
    // Select cards with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()
    await memex.boardView.getCard(BacklogColumn.Label, 1).click({modifiers: [testPlatformMeta]})

    // Open selected card menu
    await memex.boardView.getCard(BacklogColumn.Label, 0).openContextMenu()

    // Click on a fixed element outside of the cards
    await page.getByRole('heading', {level: 1}).click()

    await memex.boardView.expectFocusedCardCount(0)
  })

  test('Card should lose focus if tab key is used to select next element', async ({page, memex}) => {
    // Select cards with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    // Use tab to select next element
    await page.keyboard.press('Tab')

    // No focused cards
    await memex.boardView.expectFocusedCardCount(0)
  })

  test('If card menu is open, and we click "Esc", menu button should be focused', async ({page, memex}) => {
    // Select cards with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    // Open selected card menu
    await memex.boardView.getCard(BacklogColumn.Label, 0).openContextMenu()

    // Click on keyboard "Esc"
    await page.keyboard.press('Escape')

    // Card menu button should be focused
    const dataTestId = await page.evaluate(() => document.activeElement.getAttribute('data-testid'))
    expect(dataTestId).toBe('card-context-menu-trigger')
  })

  test('Arrow keys moves focus to adjacent cards', async ({page, memex}) => {
    // Select to focus card with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    // Check if only one card is focused
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Change focus down.
    await page.keyboard.press('ArrowDown')
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToBeFocused()

    // Change focus up.
    await page.keyboard.press('ArrowUp')
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Change focus right.
    await page.keyboard.press('ArrowRight')
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(DoneColumn.Label, 0).expectToBeFocused()

    // Change focus left.
    await page.keyboard.press('ArrowLeft')
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()
  })

  test('Tab into card contents, Shift+Tab back out, arrow keys still move focus to adjacent cards', async ({
    page,
    memex,
  }) => {
    // Select to focus card with mouse click
    await memex.boardView.getCard(BacklogColumn.Label, 0).click()

    // Check if only one card is focused
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Move focus into the card onto the context menu using Tab key
    await page.keyboard.press('Tab')
    await memex.boardView.expectFocusedCardCount(0)
    const dataTestId = await page.evaluate(() => document.activeElement.getAttribute('data-testid'))
    expect(dataTestId).toBe('card-context-menu-trigger')

    // Change focus back to the card using Shift+Tab key
    await page.keyboard.press('Shift+Tab')
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToBeFocused()

    // Change focus down on next card down
    await page.keyboard.press('ArrowDown')
    await memex.boardView.expectFocusedCardCount(1)
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToBeFocused()
  })

  test('Card selection is reset after selecting an unselected card', async ({memex}) => {
    // the first card is automatically selected/focused
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0)
    const lastCard = memex.boardView.getCard(MissingStatusColumn.Label, 2)
    const newCard = memex.boardView.getCard(BacklogColumn.Label, 0)

    // shift+click the third card in the no-status column
    await lastCard.click({modifiers: ['Shift']})

    await firstCard.expectSelectionState(true)
    await lastCard.expectSelectionState(true)

    // click the first card in the backlog column to reset the selection
    await newCard.click()

    await firstCard.expectSelectionState(true)
    await lastCard.expectSelectionState(true)
    await newCard.expectSelectionState(true)
  })
})
