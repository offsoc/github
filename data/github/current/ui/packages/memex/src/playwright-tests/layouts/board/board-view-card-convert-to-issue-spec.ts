import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustFind} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {BacklogColumn, MissingStatusColumn} from '../../types/board'

test.describe('Convert to issue - Board View Card Context Menu', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('"Convert to issue" is not an option in the context menu for an issue', async ({memex}) => {
    const ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(BacklogColumn.Label, ISSUE_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_CONVERT_TO_ISSUE_OPTION).toBeHidden()
  })

  test('"Convert to issue" is not an option in the context menu for a pull request', async ({memex}) => {
    const PULL_REQUEST_CARD_INDEX = 1

    await memex.boardView.getCard(BacklogColumn.Label, PULL_REQUEST_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_CONVERT_TO_ISSUE_OPTION).toBeHidden()
  })

  test('"Convert to issue" is an option in the context menu for a draft', async ({memex}) => {
    const DRAFT_ISSUE_CARD_INDEX = 0

    await memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_ISSUE_CARD_INDEX).openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_CONVERT_TO_ISSUE_OPTION).toBeVisible()
  })

  test('"Convert to issue" is not an option when multiple draft cards are selected', async ({memex}) => {
    const FIRST_DRAFT_ISSUE_CARD_INDEX = 0
    const SECOND_DRAFT_ISSUE_CARD_INDEX = 2

    const firstDraftCard = memex.boardView.getCard(MissingStatusColumn.Label, FIRST_DRAFT_ISSUE_CARD_INDEX)
    const secondDraftCard = memex.boardView.getCard(MissingStatusColumn.Label, SECOND_DRAFT_ISSUE_CARD_INDEX)
    await firstDraftCard.click()
    await secondDraftCard.click({modifiers: ['Shift']})

    await secondDraftCard.openContextMenu()
    await expect(memex.boardView.CARD_CONTEXT_MENU_CONVERT_TO_ISSUE_OPTION).toBeHidden()
  })

  test('redacted items do not have a context menu', async ({memex}) => {
    const REDACTED_ITEM_CARD_INDEX = 1

    const card = memex.boardView.getCard(MissingStatusColumn.Label, REDACTED_ITEM_CARD_INDEX)

    await expect(card.CARD_CONTEXT_MENU_TRIGGER).toBeHidden()
  })

  test('Clicking "Convert to Issue" shows the repository picker', async ({page, memex}) => {
    const DRAFT_CARD_INDEX = 0

    await memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_CARD_INDEX).openContextMenu()
    await memex.boardView.CARD_CONTEXT_MENU_CONVERT_TO_ISSUE_OPTION.click()

    await mustFind(page, _('repo-picker-repo-list'))
  })
})
