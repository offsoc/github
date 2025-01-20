import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {generateRandomName} from '../../helpers/utils'
import {MissingStatusColumn} from '../../types/board'

const EXTENDED_TIMEOUT = 10_000
test.describe('Adding cards', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('omnibar text is not reset when focus is lost', async ({page, memex}) => {
    await memex.boardView.getColumn('Backlog').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(itemName)
    await page.keyboard.press('ArrowUp')

    await expect(memex.omnibar.INPUT).not.toBeFocused()

    await page.keyboard.press('ArrowDown')

    await expect(memex.omnibar.INPUT).toBeFocused()
    await expect(memex.omnibar.INPUT).toHaveValue(itemName)
  })

  test('adding a card as draft issue trims whitespace', async ({page, memex}) => {
    await memex.boardView.getColumn('Ready').ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()
    const itemName = `New Card ${generateRandomName()}`
    await page.keyboard.type(`    ${itemName}   `)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${itemName}`)

    await memex.boardView.getColumn('Ready').expectCardCount(1)
    await memex.boardView.getCard('Ready', 0).expectToContainText(itemName)
  })

  test('adding a card with issue', async ({page, memex}) => {
    await memex.boardView.getColumn('Ready').ADD_ITEM.click()

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

    await memex.boardView.getColumn('Ready').expectCardCount(1)
    await memex.boardView.getCard('Ready', 0).expectToContainText('I am an integration test fixture')
  })

  test('add card to column with other cards adds it to the bottom', async ({page, memex}) => {
    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCardCount(3)
    await memex.boardView.getColumn(MissingStatusColumn.Label).ADD_ITEM.click()

    await expect(memex.omnibar.INPUT).toBeFocused()

    const cardName = generateRandomName()
    await page.keyboard.type(cardName)
    await page.keyboard.press('Enter')
    await page.waitForSelector(`text=${cardName}`)

    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCardCount(4)
    await memex.boardView.getCard(MissingStatusColumn.Label, 3).expectToContainText(cardName)

    await expect(memex.omnibar.INPUT).toBeFocused()
  })
})
