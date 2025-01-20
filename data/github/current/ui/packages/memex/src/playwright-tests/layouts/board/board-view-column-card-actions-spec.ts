import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'
import {BacklogColumn, ReadyColumn} from '../../types/board'

test.describe('Archive column from context menu', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('Archives only cards in a column that are visible', async ({page, memex}) => {
    const cardSelector = 'div[data-testid=board-view-column-card]:visible'

    await memex.boardView.getColumn('Backlog').expectCardCount(2)
    await memex.sharedInteractions.filterToExpectedCount('team:"Novelty Aardvarks"', cardSelector, 2)
    await memex.boardView.getColumn('Backlog').expectCardCount(1)

    await memex.boardView.getColumn(BacklogColumn.Label).openContextMenu()
    await memex.boardView.COLUMN_MENU(BacklogColumn.Label).getByRole('menuitem', {name: 'Archive all'}).click()
    await submitConfirmDialog(page, 'Archive')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(0)

    await memex.filter.CLEAR_FILTER_BUTTON.click()
    await memex.boardView.getColumn('Backlog').expectCardCount(1)
  })

  test('Deletes only cards in a column that are visible', async ({page, memex}) => {
    const cardSelector = 'div[data-testid=board-view-column-card]:visible'

    await memex.boardView.getColumn('Backlog').expectCardCount(2)
    await memex.sharedInteractions.filterToExpectedCount('team:"Novelty Aardvarks"', cardSelector, 2)
    await memex.boardView.getColumn('Backlog').expectCardCount(1)

    await memex.boardView.getColumn(BacklogColumn.Label).openContextMenu()
    await memex.boardView.COLUMN_MENU(BacklogColumn.Label).getByRole('menuitem', {name: 'Delete all'}).click()

    await submitConfirmDialog(page, 'Delete')

    const countAfter = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
    expect(countAfter).toEqual(0)

    await memex.filter.CLEAR_FILTER_BUTTON.click()
    await memex.boardView.getColumn('Backlog').expectCardCount(1)
  })

  test('Disables archive and delete menu option when there are no cards in the column', async ({page, memex}) => {
    await memex.boardView.getColumn(ReadyColumn.Label).openContextMenu()

    await expect(page.getByRole('menuitem', {name: 'Archive all'})).toBeDisabled()
    await expect(page.getByRole('menuitem', {name: 'Delete all'})).toBeDisabled()
  })
})
