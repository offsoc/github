import {expect} from '@playwright/test'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {ItemType, MissingStatusColumn} from '../../types/board'

test.describe('Edit card title', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test('Cannot edit the title of cards for issues', async ({memex}) => {
    const ISSUE_CARD_INDEX = 0

    const issueCard = memex.boardView.getCard('Backlog', ISSUE_CARD_INDEX)
    await issueCard.expectCardType(ItemType.Issue)

    const sidePanelTrigger = issueCard.getSidePanelTrigger()
    await expect(sidePanelTrigger).toBeVisible()

    await expect(sidePanelTrigger).toHaveAttribute('target', '_blank')
    await expect(sidePanelTrigger).toHaveAttribute('rel', 'noreferrer')
  })

  test('Can edit the title of cards for draft issues', async ({memex}) => {
    const DRAFT_ISSUE_CARD_INDEX = 0
    const draftIssueCard = memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_ISSUE_CARD_INDEX)

    await draftIssueCard.expectCardType(ItemType.DraftIssue)

    // assert that do not have an external link in the card title
    const externalLink = draftIssueCard.getExternalLink()
    await expect(externalLink).toBeHidden()

    // assert that we have the card item pane element to interact with
    const cartSidePanelTrigger = draftIssueCard.getSidePanelTrigger()
    await expect(cartSidePanelTrigger).toBeVisible()

    const draftTitleText = await cartSidePanelTrigger.textContent()

    await cartSidePanelTrigger.click()

    // Expect the item pane to be visible
    await expect(memex.sidePanel.getDraftSidePanel(draftTitleText)).toBeVisible()
  })

  const setupEditDraftIssueTests = async (memex: MemexApp) => {
    const DRAFT_ISSUE_CARD_INDEX = 0
    const draftIssueCard = memex.boardView.getCard(MissingStatusColumn.Label, DRAFT_ISSUE_CARD_INDEX)

    await draftIssueCard.expectCardType(ItemType.DraftIssue)

    // assert that we have the card item pane element to interact with
    const cartSidePanelTrigger = draftIssueCard.getSidePanelTrigger()

    const initialTitleText = await cartSidePanelTrigger.textContent()

    await cartSidePanelTrigger.click()

    await expect(memex.sidePanel.getDraftSidePanel('Here is a Draft Issue!')).toBeVisible()
    await memex.sidePanel.expectTitleEditButtonToBeVisible()

    await memex.sidePanel.getTitleEditButton().click()
    return {draftIssueCard, initialTitleText}
  }

  test.describe('editing draft issue', () => {
    test('Blurring text area will persist title changes in input mode', async ({memex, page}) => {
      const {initialTitleText} = await setupEditDraftIssueTests(memex)
      await page.keyboard.insertText('-suffix')
      await page.keyboard.press('Tab')

      const inputValue = await memex.sidePanel.getTitleInput().inputValue()
      expect(inputValue).toEqual(`${initialTitleText}-suffix`)
    })

    test('Enter will persist title changes', async ({memex, page}) => {
      const {draftIssueCard, initialTitleText} = await setupEditDraftIssueTests(memex)
      await page.keyboard.insertText('-suffix')
      await page.keyboard.press(`Enter`)

      await expect(draftIssueCard.getSidePanelTrigger()).toHaveText(`${initialTitleText}-suffix`)
    })

    test('Escape will not persist title changes', async ({memex, page}) => {
      const {draftIssueCard, initialTitleText} = await setupEditDraftIssueTests(memex)
      // textarea should now be focused
      await page.keyboard.insertText('-suffix')
      // revert the changes by hitting ESCAPE
      await page.keyboard.press('Escape')

      await expect(draftIssueCard.getSidePanelTrigger()).toHaveText(initialTitleText)
    })

    test('Navigation / focus events will not fire when textarea in edit mode', async ({memex, page}) => {
      await setupEditDraftIssueTests(memex)
      // text input should now be focused
      const sidePanelTitleContainer = memex.sidePanel.getTitleInput()

      await expect(sidePanelTitleContainer).toBeFocused()
      // test navigation events
      await page.keyboard.press('ArrowUp')
      await expect(sidePanelTitleContainer).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(sidePanelTitleContainer).toBeFocused()
      await page.keyboard.press('ArrowLeft')
      await expect(sidePanelTitleContainer).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(sidePanelTitleContainer).toBeFocused()

      // click in the textarea should not be handled as a focus event by the card
      await sidePanelTitleContainer.click()
    })
  })
})
