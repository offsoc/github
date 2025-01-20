import {expect} from '@playwright/test'

import {CardMove, CardMoveUI} from '../../../client/api/stats/contracts'
import {test} from '../../fixtures/test-extended'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'
import {BacklogColumn, InProgressColumn, ItemType, MissingStatusColumn} from '../../types/board'

test.describe('Move cards', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('moveUp changes the position of a card within a column', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const thirdCard = memex.boardView.getCard(MissingStatusColumn.Label, 2).cardLocator
    const initialCardText = await thirdCard.textContent()

    const firstBoxCenter = await mustGetCenter(firstCard)
    await dragTo(page, thirdCard, {y: firstBoxCenter.y - 10})

    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectToHaveText(initialCardText)

    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({fieldId: 'no_vertical_group', itemId: 11}),
      ui: CardMoveUI.MouseMove,
      memexProjectViewNumber: 1,
    })
  })

  test('moveUp above the column hides the sash', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const thirdCard = memex.boardView.getCard(MissingStatusColumn.Label, 2).cardLocator

    const firstBoxCenter = await mustGetCenter(firstCard)
    await dragTo(page, thirdCard, {y: firstBoxCenter.y - 500}, {steps: 50}, false)

    await expect(memex.boardView.SASH).toBeHidden()
  })

  test('moveDown changes the position of a card within a column', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const secondCard = memex.boardView.getCard(MissingStatusColumn.Label, 1).cardLocator
    const initialCardText = await firstCard.textContent()

    const secondBoxCenter = await mustGetCenter(secondCard)
    await dragTo(page, firstCard, {y: secondBoxCenter.y + 10})

    await memex.boardView.getCard(MissingStatusColumn.Label, 1).expectToHaveText(initialCardText)
  })

  test('moveRight changes the column for a card', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const firstCardText = await firstCard.textContent()

    const firstBacklogCard = memex.boardView.getCard('Backlog', 0).cardLocator
    const targetCardCenter = await mustGetCenter(firstBacklogCard)

    // Drag slightly above the vertical center of the target card.
    await dragTo(page, firstCard, {...targetCardCenter, y: targetCardCenter.y - 25})
    await memex.boardView.getCard('Backlog', 0).expectToHaveText(firstCardText)

    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCardCount(2)
    await memex.boardView.getColumn('Backlog').expectCardCount(3)
  })

  test('moveRight into an empty column', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const firstCardText = await firstCard.textContent()

    // Empty column
    const targetColumn = memex.boardView.getColumn('In Progress').columnLocator
    const targetColumnCenter = await mustGetCenter(targetColumn)

    // Drag slightly above the vertical center of the target card.
    await dragTo(page, firstCard, {...targetColumnCenter, y: targetColumnCenter.y - 25})
    await memex.boardView.getCard('In Progress', 0).expectToHaveText(firstCardText)

    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCardCount(2)
    await memex.boardView.getColumn('In Progress').expectCardCount(1)
  })

  test('Moving a redacted item is blocked', async ({page, memex}) => {
    const REDACTED_CARD_INDEX = 1
    const redactedCard = memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_CARD_INDEX).cardLocator

    await memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_CARD_INDEX).expectCardType(ItemType.RedactedItem)

    const redactedCardText = await redactedCard.textContent()

    const backlogDropBox = await memex.boardView.getColumn('Backlog').COLUMN_DROP_ZONE.boundingBox()
    await dragTo(page, redactedCard, backlogDropBox)

    await memex.boardView.getCard(MissingStatusColumn.Label, 1).expectToHaveText(redactedCardText)
    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCardCount(3)
  })

  test('Card is focused after drop', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const thirdCard = memex.boardView.getCard(MissingStatusColumn.Label, 2).cardLocator

    const initialCardText = await thirdCard.textContent()

    const firstBoxCenter = await mustGetCenter(firstCard)
    await dragTo(page, thirdCard, {y: firstBoxCenter.y - 10})

    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectToHaveText(initialCardText)
    await memex.boardView.getCard(MissingStatusColumn.Label, 0).expectToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getCard(MissingStatusColumn.Label, 1).expectToBeFocused()

    await page.keyboard.press('ArrowRight')
    await memex.boardView.getCard('Backlog', 1).expectToBeFocused()
  })

  test('drag overlay cannot be focused', async ({page, memex}) => {
    const firstCard = memex.boardView.getCard(BacklogColumn.Label, 0).cardLocator

    await firstCard.hover()
    await page.mouse.down()
    await page.mouse.move(0, 100)

    const repositoryToken = page.getByTestId('drag-overlay').getByTestId('repository-token')

    await repositoryToken.focus()

    await expect(repositoryToken).not.toBeFocused()
  })
})

test.describe('Move cards', () => {
  test('moving all cards from no_vertical_group hides column', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems', {
      viewType: 'board',
    })

    // Since we're passing along the locators, we always want to use the firstCard
    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    const firstCardText = await firstCard.textContent()

    const backlogDropBox = await memex.boardView.getColumn('Backlog').COLUMN_DROP_ZONE.boundingBox()

    await dragTo(page, firstCard, {x: backlogDropBox.x + backlogDropBox.width / 2, y: backlogDropBox.y})
    await dragTo(page, firstCard, {x: backlogDropBox.x + backlogDropBox.width / 2, y: backlogDropBox.y})
    await dragTo(page, firstCard, {x: backlogDropBox.x + backlogDropBox.width / 2, y: backlogDropBox.y})

    const newLastCard = memex.boardView.getCard('Backlog', 2).cardLocator
    const backlogItemText = await newLastCard.textContent()

    await memex.boardView.getColumn(MissingStatusColumn.Label).expectHidden()
    expect(backlogItemText.includes(firstCardText)).toBeTruthy()
  })
})

test.describe('Drag cards between columns using selection', () => {
  test('multiple cards can be dragged using Shift click selection', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithCustomItems', {
      viewType: 'board',
    })

    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    await firstCard.focus()
    const firstCardText = await firstCard.textContent()
    const secondCard = memex.boardView.getCard(MissingStatusColumn.Label, 1).cardLocator
    const secondCardText = await secondCard.textContent()
    const lastCard = memex.boardView.getCard(MissingStatusColumn.Label, 2).cardLocator
    const lastCardText = await lastCard.textContent()

    // shift+click the third card in the no-status column
    await memex.boardView.getCard(MissingStatusColumn.Label, 2).click({modifiers: ['Shift']})

    const backlogDropBox = await memex.boardView.getColumn(BacklogColumn.Label).COLUMN_DROP_ZONE.boundingBox()

    await dragTo(page, firstCard, {x: backlogDropBox.x + backlogDropBox.width / 2, y: backlogDropBox.y})

    await memex.boardView.getCard(BacklogColumn.Label, 0).expectToHaveText(firstCardText)
    await memex.boardView.getCard(BacklogColumn.Label, 1).expectToHaveText(secondCardText)
    await memex.boardView.getCard(BacklogColumn.Label, 2).expectToHaveText(lastCardText)

    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({fieldId: '20e5d8ab', itemIds: [53, 54, 55]}),
      ui: CardMoveUI.MouseMove,
      memexProjectViewNumber: 1,
    })
  })

  test('multiple cards can be dragged using Shift click selection while ignoring redacted items', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    const firstCard = memex.boardView.getCard(MissingStatusColumn.Label, 0).cardLocator
    await firstCard.focus()
    const firstCardText = await firstCard.textContent()
    const lastCard = memex.boardView.getCard(MissingStatusColumn.Label, 2).cardLocator
    const lastCardText = await lastCard.textContent()

    // shift+click the third card in the no-status column
    await memex.boardView.getCard(MissingStatusColumn.Label, 2).click({modifiers: ['Shift']})

    const inProgressDropBox = await memex.boardView.getColumn(InProgressColumn.Label).COLUMN_DROP_ZONE.boundingBox()

    await dragTo(page, firstCard, {x: inProgressDropBox.x + inProgressDropBox.width / 2, y: inProgressDropBox.y})

    await memex.boardView.getCard(InProgressColumn.Label, 0).expectToHaveText(firstCardText)
    await memex.boardView.getCard(InProgressColumn.Label, 1).expectToHaveText(lastCardText)
    // ensure that the redacted item is not dragged
    await memex.boardView
      .getCard(MissingStatusColumn.Label, 0)
      .expectToContainText(`You don't have permission to access this item`)
  })
})
