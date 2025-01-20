import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {BacklogColumn, MissingStatusColumn} from '../../types/board'

test.describe('Open in new tab - Board View Card Context Menu', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('"Open in new tab" is an option in the context menu for an issue', async ({memex}) => {
    const ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(BacklogColumn.Label, ISSUE_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION).toBeVisible()
  })

  test('"Open in new tab" is an option in the context menu for a pull request', async ({memex}) => {
    const PULL_REQUEST_CARD_INDEX = 1

    await memex.boardView.getCard(BacklogColumn.Label, PULL_REQUEST_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION).toBeVisible()
  })

  test('"Open in new tab" is not an option in the context menu for a draft', async ({memex}) => {
    const DRAFT_ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_ISSUE_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION).toBeHidden()
  })

  test('redacted items do not have a context menu', async ({memex}) => {
    const REDACTED_ITEM_CARD_INDEX = 1

    const card = memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_ITEM_CARD_INDEX)
    await expect(card.CARD_CONTEXT_MENU_TRIGGER).toBeHidden()
  })

  test('Clicking "Open in new tab" shows the repository selector', async ({memex}) => {
    const ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(BacklogColumn.Label, ISSUE_CARD_INDEX).openContextMenu()

    const tagName = await memex.boardView.CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION.evaluate(element => element.tagName)
    const target = await memex.boardView.CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION.getAttribute('target')
    const href = await memex.boardView.CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION.getAttribute('href')

    expect(tagName).toBe('A')
    expect(target).toBe('_blank')
    expect(href).toBe('https://github.com/github/memex/issues/336')
  })
})
