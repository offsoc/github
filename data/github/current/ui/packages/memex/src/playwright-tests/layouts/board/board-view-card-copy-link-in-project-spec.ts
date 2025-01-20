import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {BacklogColumn, MissingStatusColumn} from '../../types/board'

test.describe('Copy link in project - Board View Card Context Menu', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('"Copy Link in project" is an option in the context menu for an issue', async ({memex}) => {
    const ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(BacklogColumn.Label, ISSUE_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_COPY_LINK_IN_PROJECT_OPTION).toBeVisible()
  })

  test('"Copy Link in project" is not an option in the context menu for a pull request', async ({memex}) => {
    const PULL_REQUEST_CARD_INDEX = 1

    await memex.boardView.getCard(BacklogColumn.Label, PULL_REQUEST_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_COPY_LINK_IN_PROJECT_OPTION).toBeHidden()
  })

  test('"Copy Link in project" is not an option when multiple cards are selected', async ({memex}) => {
    const ISSUE_CARD_INDEX = 0
    const PULL_REQUEST_CARD_INDEX = 1

    const issueCard = memex.boardView.getCard(BacklogColumn.Label, ISSUE_CARD_INDEX)
    const pullRequestCard = memex.boardView.getCard(BacklogColumn.Label, PULL_REQUEST_CARD_INDEX)
    await issueCard.click()
    await pullRequestCard.click({modifiers: ['Shift']})

    await pullRequestCard.openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_COPY_LINK_IN_PROJECT_OPTION).toBeHidden()
  })

  test('"Copy Link in project" is an option in the context menu for a draft', async ({memex}) => {
    const DRAFT_ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_ISSUE_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_COPY_LINK_IN_PROJECT_OPTION).toBeVisible()
  })

  test('redacted items do not have a context menu', async ({memex}) => {
    const REDACTED_ITEM_CARD_INDEX = 1

    const card = memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_ITEM_CARD_INDEX)

    await expect(card.CARD_CONTEXT_MENU_TRIGGER).toBeHidden()
  })

  test('Clicking "Copy Link in project" copies the project panel URL for the content', async ({clipboard, memex}) => {
    const ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(BacklogColumn.Label, ISSUE_CARD_INDEX).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_COPY_LINK_IN_PROJECT_OPTION.click()

    const clipboardText = await clipboard.getText()
    expect(clipboardText).toBe('http://localhost:9091/orgs/integration/projects/1?layout=board&pane=issue&itemId=3')
  })
})
