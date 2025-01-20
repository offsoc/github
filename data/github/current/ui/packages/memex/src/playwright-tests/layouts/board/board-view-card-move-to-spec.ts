import {expect} from '@playwright/test'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {CardMove, CardMoveUI} from '../../../client/api/stats/contracts'
import {statusOptions} from '../../../mocks/data/single-select'
import {test} from '../../fixtures/test-extended'
import {BacklogColumn, DoneColumn, InProgressColumn} from '../../types/board'

test.describe('Board view card move to top', () => {
  test('Can move cards to the top of a column', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board'})

    // Get ids for first 4 cards in In Progress column
    const cardIds = await Promise.all(memex.boardView.getCardIdsInColumn(InProgressColumn.Label, 4))

    await memex.boardView.getCard(InProgressColumn.Label, 3).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_TOP_OPTION.click()

    await memex.boardView.getCard(InProgressColumn.Label, 0).expectDataBoardCardId(cardIds[3])
    await memex.boardView.getCard(InProgressColumn.Label, 1).expectDataBoardCardId(cardIds[0])
    await memex.boardView.getCard(InProgressColumn.Label, 2).expectDataBoardCardId(cardIds[1])
    await memex.boardView.getCard(InProgressColumn.Label, 3).expectDataBoardCardId(cardIds[2])

    const inProgressId = statusOptions.find(option => option.name === 'In Progress')?.id
    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({type: 'top', fieldId: inProgressId, itemId: cardIds[3]}),
      ui: CardMoveUI.ContextMenu,
    })
  })

  test('Cannot move cards to top if the column is sorted', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {
      viewType: 'board',
      sortedBy: {columnId: SystemColumnId.Status, direction: 'asc'},
    })

    await memex.boardView.getCard(InProgressColumn.Label, 3).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_TOP_OPTION).toBeHidden()
  })

  test('Move to top is disabled when the card is the first in the column', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board'})

    await memex.boardView.getCard(InProgressColumn.Label, 0).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_TOP_OPTION).toBeDisabled()
  })
})

test.describe('Board view card move to bottom', () => {
  test('Can move cards to the bottom of a column', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board'})

    // Get ids for first 4 cards in In Progress column
    const cardIds = await Promise.all(memex.boardView.getCardIdsInColumn(InProgressColumn.Label, 4))

    await memex.boardView.getCard(InProgressColumn.Label, 0).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_BOTTOM_OPTION.click()

    await memex.boardView.getCard(InProgressColumn.Label, 0).expectDataBoardCardId(cardIds[1])
    await memex.boardView.getCard(InProgressColumn.Label, 1).expectDataBoardCardId(cardIds[2])
    await memex.boardView.getCard(InProgressColumn.Label, 2).expectDataBoardCardId(cardIds[3])
    await memex.boardView.getCard(InProgressColumn.Label, 3).expectDataBoardCardId(cardIds[0])

    const inProgressId = statusOptions.find(option => option.name === 'In Progress')?.id
    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({type: 'bottom', fieldId: inProgressId, itemId: cardIds[0]}),
      ui: CardMoveUI.ContextMenu,
    })
  })

  test('Cannot move cards to bottom if the column is sorted', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {
      viewType: 'board',
      sortedBy: {columnId: SystemColumnId.Status, direction: 'asc'},
    })

    await memex.boardView.getCard(InProgressColumn.Label, 0).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_BOTTOM_OPTION).toBeHidden()
  })

  test('Move to bottom is disabled when the card is the last in the column', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board'})

    await memex.boardView.getCard(InProgressColumn.Label, 3).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_BOTTOM_OPTION).toBeDisabled()
  })
})

test.describe('Board view card move to column', () => {
  test('Can move cards to other columns', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board'})

    await memex.boardView.getColumn(DoneColumn.Label).expectCardCount(2)
    await memex.boardView.getColumn(InProgressColumn.Label).expectCardCount(4)

    // Get ids for first 4 cards in In Progress column
    const inProgressCardIds = await Promise.all(memex.boardView.getCardIdsInColumn(InProgressColumn.Label, 4))
    // Get ids for first 2 cards in Done column
    const doneCardIds = await Promise.all(memex.boardView.getCardIdsInColumn(DoneColumn.Label, 2))

    await memex.boardView.getCard(InProgressColumn.Label, 0).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION.click()
    await memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'Done'}).click()

    await memex.boardView.getColumn(DoneColumn.Label).expectCardCount(3)
    await memex.boardView.getColumn(InProgressColumn.Label).expectCardCount(3)

    await memex.boardView.getCard(DoneColumn.Label, 0).expectDataBoardCardId(inProgressCardIds[0])
    await memex.boardView.getCard(DoneColumn.Label, 1).expectDataBoardCardId(doneCardIds[0])
    await memex.boardView.getCard(DoneColumn.Label, 2).expectDataBoardCardId(doneCardIds[1])

    const inProgressId = statusOptions.find(option => option.name === 'In Progress')?.id
    const doneId = statusOptions.find(option => option.name === 'Done')?.id
    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({
        type: 'column',
        itemId: inProgressCardIds[0],
        fieldId: 12,
        nextValue: doneId,
        currentValue: inProgressId,
      }),
      ui: CardMoveUI.ContextMenu,
    })
  })

  test('Does not show options for columns hidden by the current filter', async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board', filterQuery: '-status:Done -no:status '})

    await memex.boardView.getColumn('No Status').expectHidden()
    await memex.boardView.getColumn('Done').expectHidden()

    await memex.boardView.getCard(BacklogColumn.Label, 0).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION.click()
    await expect(memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'Backlog'})).toBeVisible()
    await expect(
      memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'In Progress'}),
    ).toBeVisible()
    await expect(memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'Ready'})).toBeVisible()
    await expect(memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'Done'})).toBeHidden()
    await expect(memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'No Status'})).toBeHidden()
  })

  test('Can move cards to iteration columns', async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      verticalGroupedBy: {columnId: 20},
    })

    const noIteration = 'No Iteration'
    const iteration1 = 'Iteration 1'
    await memex.boardView.getColumn(noIteration).expectCardCount(4)
    await memex.boardView.getColumn(iteration1).expectCardCount(0)

    const card = memex.boardView.getCard(noIteration, 1)
    const cardId = await card.getCardId()
    await memex.boardView.getCard(noIteration, 1).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION.click()
    await memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: iteration1}).click()

    await memex.boardView.getColumn(noIteration).expectCardCount(3)
    await memex.boardView.getColumn(iteration1).expectCardCount(1)
    await memex.boardView.getCard(iteration1, 0).expectDataBoardCardId(cardId)

    await memex.stats.expectStatsToContain({
      name: CardMove,
      context: JSON.stringify({
        type: 'column',
        itemId: cardId,
        fieldId: 33,
        nextValue: 'iteration-1',
        currentValue: null,
      }),
      ui: CardMoveUI.ContextMenu,
    })
  })

  test('Does not show iteration options for columns hidden by the current filter', async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      verticalGroupedBy: {columnId: 20},
      filterQuery: '-no:iteration -iteration:"Iteration 1","Iteration 2","Iteration 3"',
    })

    await memex.boardView.getColumn('No Iteration').expectHidden()
    await memex.boardView.getColumn('Iteration 1').expectHidden()
    await memex.boardView.getColumn('Iteration 2').expectHidden()
    await memex.boardView.getColumn('Iteration 3').expectHidden()

    await memex.boardView.getCard('Iteration 4', 0).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION.click()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 4'})).toBeVisible()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 5'})).toBeVisible()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 6'})).toBeVisible()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 0'})).toBeVisible()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 1'})).toBeHidden()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 2'})).toBeHidden()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'Iteration 3'})).toBeHidden()
    await expect(memex.boardView.MOVE_TO_ITERATION_FIELD_MENU.getByRole('option', {name: 'No Iteration'})).toBeHidden()
  })

  test('Move focus back to parent menu when closed, or context menu trigger when moving item to another column', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('reactTableWithItems', {viewType: 'board'})

    const card = memex.boardView.getCard(InProgressColumn.Label, 0)
    const cardId = await card.getCardId()
    await card.focus()
    await page.keyboard.press('Tab') // Focus context menu
    await page.keyboard.press('Enter')
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown') // Focus the "Move to column" menu item
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION).toBeFocused()

    // Open the menu and then close it
    await page.keyboard.press('Enter')
    await expect(memex.boardView.MOVE_TO_SINGLE_SELECT_FIELD_MENU.getByRole('option', {name: 'Backlog'})).toBeVisible()
    await page.keyboard.press('Escape')
    // Focus should move back to the same menu item when the change field menu is closed
    await expect(memex.boardView.CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION).toBeFocused()

    // Open the menu again and select an option
    await page.keyboard.press('Enter')
    await page.keyboard.type('backlog')
    await page.keyboard.press('Enter') // Select the 'Backlog' option

    await memex.boardView.getCard(BacklogColumn.Label, 0).expectDataBoardCardId(cardId)

    await expect(memex.boardView.getCard(BacklogColumn.Label, 0).CARD_CONTEXT_MENU_TRIGGER).toBeFocused()
  })
})
