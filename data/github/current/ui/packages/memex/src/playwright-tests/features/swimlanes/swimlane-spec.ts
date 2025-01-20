import {expect} from '@playwright/test'

import {TeamColumnId} from '../../../mocks/data/columns'
import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {eventually, generateRandomName, testPlatformMeta} from '../../helpers/utils'
import {TestsResources} from '../../types/resources'

const EXTENDED_TIMEOUT = 10_000

test.describe('Swimlanes', () => {
  test('when the board has horizontal grouping, swimlanes are visible', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Assignees'},
    })

    await memex.boardView.expectSwimlanesVisible()
  })

  test('Can add item to Milestone group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Milestone'},
    })

    await memex.boardView.getColumnByHorizontalGroup('Sprint 9', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()

    await page.keyboard.type('#')
    await page.waitForSelector(_('repo-searcher-list'))
    await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)
    await page.keyboard.press('Enter')

    await expect(memex.omnibar.SELECTED_REPOSITORY).toHaveText('repo:memex')

    await page.keyboard.type('integration')
    await waitForSelectorCount(page, _('issue-picker-item'), 1)
    await page.keyboard.press('Enter')

    const card = memex.boardView.getCardByHorizontalGroup('Sprint 9', 'Ready', 0)
    await card.expectDataBoardCardId(100000)
  })

  test('Can add item to No Milestone group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Milestone'},
    })

    await memex.boardView.getColumnByHorizontalGroup('No Milestone', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${itemName}`)

    await memex.boardView.getColumnByHorizontalGroup('No Milestone', 'Ready').expectCardCount(1)
    await memex.boardView.getCardByHorizontalGroup('No Milestone', 'Ready', 0).expectToContainText(itemName)
  })

  test('Can add item to IssueType group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Type'},
    })

    await memex.boardView.getColumnByHorizontalGroup('Batch', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()

    await page.keyboard.type('#')
    await page.waitForSelector(_('repo-searcher-list'))
    await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)
    await page.keyboard.press('Enter')

    await expect(memex.omnibar.SELECTED_REPOSITORY).toHaveText('repo:memex')

    await page.keyboard.type('integration')
    await waitForSelectorCount(page, _('issue-picker-item'), 1)
    await page.keyboard.press('Enter')

    const card = memex.boardView.getCardByHorizontalGroup('Batch', 'Ready', 0)
    await card.expectDataBoardCardId(100000)
  })

  test('Can add item to No IssueType group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Type'},
    })

    await memex.boardView.getColumnByHorizontalGroup('No Type', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${itemName}`)

    await memex.boardView.getColumnByHorizontalGroup('No Type', 'Ready').expectCardCount(1)
    await memex.boardView.getCardByHorizontalGroup('No Type', 'Ready', 0).expectToContainText(itemName)
  })

  test('Can add item to repository group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Repository'},
    })

    await memex.boardView.getColumnByHorizontalGroup('github/memex', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    await expect(memex.omnibar.SELECTED_REPOSITORY).toHaveText('repo:memex')

    await page.keyboard.type('integration')
    await expect(memex.omnibar.issuePicker.ISSUE_PICKER_ITEM).toHaveCount(1)
    await page.keyboard.press('Enter')

    const card = memex.boardView.getCardByHorizontalGroup('github/memex', 'Ready', 0)
    await card.expectDataBoardCardId(100000)
  })

  test('Can add item to No Repository group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Repository'},
    })

    await memex.boardView.getColumnByHorizontalGroup('No Repository', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${itemName}`)

    await memex.boardView.getColumnByHorizontalGroup('No Repository', 'Ready').expectCardCount(1)
    await memex.boardView.getCardByHorizontalGroup('No Repository', 'Ready', 0).expectToContainText(itemName)
  })

  test('Can add item to parent issue group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      viewType: 'board',
      groupedBy: {columnId: 'Parent issue'},
    })

    await memex.boardView.getColumnByHorizontalGroup('github/sriracha-4#10', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()

    await page.keyboard.type('#')
    await page.waitForSelector(_('repo-searcher-list'))
    await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)
    await page.keyboard.press('Enter')

    await expect(memex.omnibar.SELECTED_REPOSITORY).toHaveText('repo:memex')

    await page.keyboard.type('integration')
    await waitForSelectorCount(page, _('issue-picker-item'), 1)
    await page.keyboard.press('Enter')

    const card = memex.boardView.getCardByHorizontalGroup('github/sriracha-4#10', 'Ready', 0)
    await card.expectDataBoardCardId(100000)
  })

  test('Can add item to No Parent issue group', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      viewType: 'board',
      groupedBy: {columnId: 'Parent issue'},
    })

    await memex.boardView.getColumnByHorizontalGroup('No Parent issue', 'Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${itemName}`)

    await memex.boardView.getColumnByHorizontalGroup('No Parent issue', 'Ready').expectCardCount(12)
    await memex.boardView.getCardByHorizontalGroup('No Parent issue', 'Ready', 11).expectToContainText(itemName)
  })

  test('Can add item', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: '11'},
    })

    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Backlog').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${itemName}`)

    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Backlog').expectCardCount(2)
    await memex.boardView.getCardByHorizontalGroup('Novelty Aardvarks', 'Backlog', 1).expectToContainText(itemName)
  })

  test('Can still add item when filter hides all horizontal groups', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: '10'},
      filterQuery: 'sssssssss',
    })

    await page.keyboard.press('Escape')
    await memex.boardView.getColumn('Backlog').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')

    await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)

    await memex.filter.CLEAR_FILTER_BUTTON.click()

    await memex.boardView.getColumnByHorizontalGroup('No Stage', 'Backlog').expectCardCount(2)
    await memex.boardView.getCardByHorizontalGroup('No Stage', 'Backlog', 1).expectToContainText(itemName)
  })

  test('Can add issue', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: '11'},
    })

    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Backlog').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()

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
    await page.click('[data-testid=issue-picker-item]')

    await page.waitForSelector(`text=I am an integration test fixture`)

    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Backlog').expectCardCount(2)
    await memex.boardView
      .getCardByHorizontalGroup('Novelty Aardvarks', 'Backlog', 1)
      .expectToContainText('I am an integration test fixture')
  })

  test('Moves card when dragging to another column and group', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      groupedBy: {columnId: '20'}, // iteration
      filterQuery: '-status:"Backlog"',
    })

    const dragCard = memex.boardView.getCardByHorizontalGroup('Iteration 0', 'No Status', 0)
    const dragCardText = await dragCard.getCardTitle()
    const targetCard = memex.boardView.getCardByHorizontalGroup('Iteration 4', 'Done', 0)
    const targetCardCenter = await mustGetCenter(targetCard.cardLocator)

    // Drag slightly above the vertical center of the target card.
    await dragTo(page, dragCard.cardLocator, {...targetCardCenter, y: targetCardCenter.y - 25})
    await memex.boardView.getCardByHorizontalGroup('Iteration 4', 'Done', 0).expectToContainText(dragCardText)

    await memex.boardView.expectHorizontalGroupToBeHidden('Iteration 0')
    await memex.boardView.getColumnByHorizontalGroup('Iteration 4', 'Done').expectCardCount(2)
  })

  test('Moves cards when dragging to another column and group', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      groupedBy: {columnId: '20'}, // iteration
      filterQuery: '-status:"Backlog"',
    })

    const dragCard = memex.boardView.getCardByHorizontalGroup('Iteration 0', 'No Status', 0)
    await dragCard.click()

    const secondCard = memex.boardView.getCardByHorizontalGroup('Iteration 4', 'Done', 0)
    await secondCard.click({modifiers: [testPlatformMeta]})

    const targetColumn = memex.boardView.getColumnByHorizontalGroup('No Iteration', 'In Progress')
    const targetCenter = await mustGetCenter(targetColumn.columnLocator)

    // Drag slightly above the vertical center of the target card.
    await dragTo(page, dragCard.cardLocator, targetCenter)

    await memex.boardView.expectHorizontalGroupToBeHidden('Iteration 0')
    await memex.boardView.getColumnByHorizontalGroup('No Iteration', 'In Progress').expectCardCount(2)
    await memex.boardView.getColumnByHorizontalGroup('Iteration 4', 'Done').expectCardCount(0)
  })

  test('Moves card when dragging to empty column and group', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      groupedBy: {columnId: '20'}, // iteration
      filterQuery: '-status:"Backlog"',
    })

    const dragCard = memex.boardView.getCardByHorizontalGroup('Iteration 0', 'No Status', 0)
    const dragCardText = await dragCard.getCardTitle()
    const targetColumn = memex.boardView.getColumnByHorizontalGroup('Iteration 4', 'In Progress')
    const targetColumnCenter = await mustGetCenter(targetColumn.columnLocator)

    await dragTo(page, dragCard.cardLocator, targetColumnCenter)
    await memex.boardView.getCardByHorizontalGroup('Iteration 4', 'In Progress', 0).expectToContainText(dragCardText)

    await memex.boardView.expectHorizontalGroupToBeHidden('Iteration 0')
    await memex.boardView.getColumnByHorizontalGroup('Iteration 4', 'In Progress').expectCardCount(1)
  })

  test('can move items across vertical groups within the same horizontal group via keyboard', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: '11'}, // team
    })

    const doneColumn = memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Done')
    await doneColumn.expectCardCount(1)

    const card = memex.boardView.getCardByHorizontalGroup('Novelty Aardvarks', 'Backlog', 0)
    await card.expectDataBoardCardId(3)
    await card.click()

    // Start moving the card
    await page.keyboard.press('Enter')
    // Expect sash to be visible
    await expect(memex.boardView.SASH).toHaveCount(1)
    // Move focus over to the "Done" column
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    // Move the card
    await page.keyboard.press('Enter')

    await doneColumn.expectCardCount(2)
    await memex.boardView.getCardByHorizontalGroup('Novelty Aardvarks', 'Done', 1).expectDataBoardCardId(3)
  })

  test('can move multiple items across vertical groups within the same horizontal group via keyboard', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Repository'},
    })

    const inProgressColumn = memex.boardView.getColumnByHorizontalGroup('github/memex', 'In Progress')
    const backlogColumn = memex.boardView.getColumnByHorizontalGroup('github/memex', 'Backlog')

    await inProgressColumn.expectCardCount(0)
    await backlogColumn.expectCardCount(2)

    const card = memex.boardView.getCardByHorizontalGroup('github/memex', 'Backlog', 0)
    await card.click()

    // Select card and card below
    await page.keyboard.press('Shift+ArrowDown')
    // Start moving the card
    await page.keyboard.press('Enter')
    // Move cards to the "In Progress" column
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    await inProgressColumn.expectCardCount(2)
    await backlogColumn.expectCardCount(0)
  })

  test('Can navigate items via keyboard navigation', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: TeamColumnId},
    })

    await memex.boardView.getCardByHorizontalGroup('Design Systems', 'Done', 0).focus()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getColumnByHorizontalGroup('Design Systems', 'Done').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getCardByHorizontalGroup('Novelty Aardvarks', 'Done', 0).expectToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Ready').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'In Progress').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('Novelty Aardvarks', 'Backlog').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCardByHorizontalGroup('Novelty Aardvarks', 'Backlog', 0).expectToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getColumnByHorizontalGroup('Design Systems', 'Backlog').expectAddItemToBeFocused()
  })

  test('Can navigate items via keyboard navigation skipping collapsed groups', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: TeamColumnId},
    })

    await memex.boardView.toggleHorizontalGroup('Novelty Aardvarks')
    await memex.boardView.getCardByHorizontalGroup('Design Systems', 'Done', 0).click()

    await memex.boardView.getCardByHorizontalGroup('Design Systems', 'Done', 0).expectToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getColumnByHorizontalGroup('Design Systems', 'Done').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getCardByHorizontalGroup('No Team', 'Done', 0).expectToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('No Team', 'Ready').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('No Team', 'In Progress').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('No Team', 'Backlog').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCardByHorizontalGroup('No Team', 'Backlog', 0).expectToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getColumnByHorizontalGroup('Design Systems', 'Backlog').expectAddItemToBeFocused()
  })

  test('Can navigate items via keyboard navigation when grouped by milestone', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: 'Milestone'},
    })

    await memex.boardView.getCardByHorizontalGroup('Sprint 9', 'Backlog', 0).focus()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getColumnByHorizontalGroup('Sprint 9', 'Backlog').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getCardByHorizontalGroup('v0.1 - Prioritized Lists?', 'Backlog', 0).expectToBeFocused()

    await page.keyboard.press('ArrowRight')
    await memex.boardView
      .getColumnByHorizontalGroup('v0.1 - Prioritized Lists?', 'In Progress')
      .expectAddItemToBeFocused()

    await page.keyboard.press('ArrowRight')
    await memex.boardView.getColumnByHorizontalGroup('v0.1 - Prioritized Lists?', 'Ready').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowRight')
    await memex.boardView.getColumnByHorizontalGroup('v0.1 - Prioritized Lists?', 'Done').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCardByHorizontalGroup('v0.1 - Prioritized Lists?', 'Done', 1).expectToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getColumnByHorizontalGroup('v0.1 - Prioritized Lists?', 'Done').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getCardByHorizontalGroup('No Milestone', 'Done', 0).expectToBeFocused()

    await page.keyboard.press('ArrowDown')
    await memex.boardView.getColumnByHorizontalGroup('No Milestone', 'Done').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await memex.boardView.getColumnByHorizontalGroup('No Milestone', 'Backlog').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getColumnByHorizontalGroup('v0.1 - Prioritized Lists?', 'Backlog').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCardByHorizontalGroup('v0.1 - Prioritized Lists?', 'Backlog', 0).expectToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getColumnByHorizontalGroup('Sprint 9', 'Backlog').expectAddItemToBeFocused()

    await page.keyboard.press('ArrowUp')
    await memex.boardView.getCardByHorizontalGroup('Sprint 9', 'Backlog', 0).expectToBeFocused()
  })

  test('Hide swimlane from view when no items are visible', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
      groupedBy: {columnId: '10'}, // Stage
      filterQuery: '-stage:"On Hold"',
    })

    await memex.boardView.expectHorizontalGroupToBeHidden('On Hold')
    await memex.boardView.expectHorizontalGroupToBeVisible('Up Next')
  })

  test('Virtualizes offscreen groups', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
      groupedBy: {columnId: 'Milestone'},
    })

    const offscreenColumn = memex.boardView.getColumnLocatorByHorizontalGroup('No Milestone', 'In Progress')
    await expect(offscreenColumn).toBeHidden()
    await page.getByTestId('board-view').evaluate(element => {
      element.scrollTop = element.scrollHeight
    })
    await eventually(async () => await expect(offscreenColumn).toBeVisible())
  })

  test('Scrolls to the top of a group after expanding', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsP50', {
      viewType: 'board',
      groupedBy: {columnId: 'Milestone'},
    })

    await page.getByTestId('board-view').evaluate(element => {
      element.scrollTop = 50
    })

    const card = memex.boardView.getCardByHorizontalGroup('Sprint 9', 'Backlog', 0)
    await card.expectToBeVisible()

    await memex.boardView.toggleHorizontalGroup('Sprint 9')
    await card.expectToBeHidden()

    await memex.boardView.toggleHorizontalGroup('Sprint 9')
    await card.expectToBeVisible()

    const scrollTop = await page.getByTestId('board-view').evaluate(element => element.scrollTop)
    expect(scrollTop).toBe(0)
  })
})
