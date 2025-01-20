import {expect, type Page} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'

const cardSelector = 'div[data-testid=board-view-column-card]:visible'
const countBySelector = (page: Page, selector: string) => page.$$eval(selector, elements => elements.length)

test.describe('Clickable filters', () => {
  let totalCards: number | null = null

  test.beforeEach(async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    if (!totalCards) {
      totalCards = await countBySelector(page, cardSelector)
    }
  })

  test('Toggles label filter when clicking on a card label', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('issue-label').click()
    await waitForSelectorCount(page, cardSelector, 3)
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('issue-label').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles milestone filter when clicking on a card milestone', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('milestone-token').click()
    await waitForSelectorCount(page, cardSelector, 1)
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('milestone-token').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles assignee filter when clicking on a card avatar', async ({memex}) => {
    const assigneeLabel = memex.boardView.getCard('Backlog', 0).cardLocator.locator('.memex-AvatarItem')
    await assigneeLabel.click()
    const assignee = await assigneeLabel.locator('img').getAttribute('alt')
    await expect(memex.filter.INPUT).toHaveValue(`assignee:${assignee}`)
    await memex.boardView.getCard('Backlog', 0).cardLocator.locator('.memex-AvatarItem').click()
    await expect(memex.filter.INPUT).toHaveValue('')
  })

  test('Toggles custom text field filter when clicking on custom text field on card', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('custom-label-Team').click()
    await waitForSelectorCount(page, cardSelector, 2)
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('custom-label-Team').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles custom date field filter when clicking on custom date field on card', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 1).cardLocator.getByTestId('custom-label-Due Date').click()
    await waitForSelectorCount(page, cardSelector, 1)
    // Index 0 on the second click because there is now only a single card in the column
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('custom-label-Due Date').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles custom number field filter when clicking on custom number field on card', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('custom-label-Estimate').click()
    await waitForSelectorCount(page, cardSelector, 1)
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('custom-label-Estimate').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles tracked by field filter when clicking on tracked by field on card', async ({page, memex}) => {
    await memex.navigateToStory('appWithTrackedByField', {
      viewType: 'board',
    })
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('tracked-by-label-2').click()
    await waitForSelectorCount(page, cardSelector, 1)
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('tracked-by-label-2').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Dragging that starts with a click on a clickable item does not activate filter', async ({page, memex}) => {
    const card = memex.boardView.getCard('Backlog', 0).cardLocator
    const secondCard = memex.boardView.getCard('Backlog', 1).cardLocator
    const initialCardText = await secondCard.textContent()
    const label = card.getByTestId('custom-label-Team')

    const firstBoxCenter = await mustGetCenter(label)
    await dragTo(page, secondCard, {y: firstBoxCenter.y - 90}, {steps: 5})

    await memex.boardView.getCard('Backlog', 0).expectToHaveText(initialCardText)
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles repository label filter when clicking on a repository card label', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('repository-token').click()
    await waitForSelectorCount(page, cardSelector, 5)
    await memex.boardView.getCard('Backlog', 0).cardLocator.getByTestId('repository-token').click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })

  test('Toggles issue type filter when clicking on a card issue type', async ({page, memex}) => {
    await memex.boardView.getCard('Backlog', 0).getIssueTypeLabel().click()
    await waitForSelectorCount(page, cardSelector, 1)
    await memex.boardView.getCard('Backlog', 0).getIssueTypeLabel().click()
    await waitForSelectorCount(page, cardSelector, totalCards)
  })
})
