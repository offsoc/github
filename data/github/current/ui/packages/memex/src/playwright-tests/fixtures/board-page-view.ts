import {expect, type Locator} from '@playwright/test'

import {ItemType} from '../types/board'
import {BasePageViewWithMemexApp} from './base-page-view'
import {CardAssignees} from './fields/assignees'
import {LinkedPullRequestLabel} from './fields/linked-prs'
import {ReviewersLabel} from './fields/reviewers'
import {test} from './test-extended'

export class BoardView extends BasePageViewWithMemexApp {
  BOARD_VIEW = this.page.getByTestId('board-view')
  ADD_NEW_COLUMN_MENU = this.page.getByTestId('add-new-column-menu')
  ADD_NEW_COLUMN_MENU_PLUS_BUTTON = this.ADD_NEW_COLUMN_MENU.getByRole('menuitem', {name: 'New column'})
  ADD_NEW_COLUMN_BUTTON = this.page.getByTestId('add-new-column-button')
  BOARD_VISIBILITY_COLUMN_BACKLOG = this.ADD_NEW_COLUMN_MENU.getByRole('menuitemcheckbox', {name: 'Backlog'})
  BOARD_VISIBILITY_COLUMN_READY = this.ADD_NEW_COLUMN_MENU.getByRole('menuitemcheckbox', {name: 'Ready'})
  COLUMN_CONTEXT_MENU_HIDE_COLUMN = this.page.getByRole('menuitem', {name: 'Hide from view'})
  CARD_CONTEXT_MENU = this.page.getByRole('menu', {name: 'More actions'})
  CARD_CONTEXT_MENU_CONVERT_TO_ISSUE_OPTION = this.CARD_CONTEXT_MENU.getByTestId('card-context-menu-convert-to-issue')
  CARD_CONTEXT_MENU_COPY_LINK_OPTION = this.CARD_CONTEXT_MENU.getByTestId('card-context-menu-copy-link')
  CARD_CONTEXT_MENU_COPY_LINK_IN_PROJECT_OPTION = this.CARD_CONTEXT_MENU.getByTestId(
    'card-context-menu-copy-link-in-project',
  )
  CARD_CONTEXT_MENU_OPEN_IN_NEW_TAB_OPTION = this.CARD_CONTEXT_MENU.getByTestId('card-context-menu-open-in-new-tab')
  CARD_CONTEXT_MENU_MOVE_TO_TOP_OPTION = this.CARD_CONTEXT_MENU.getByRole('menuitem', {name: 'Move to top'})
  CARD_CONTEXT_MENU_MOVE_TO_BOTTOM_OPTION = this.CARD_CONTEXT_MENU.getByRole('menuitem', {name: 'Move to bottom'})
  CARD_CONTEXT_MENU_MOVE_TO_COLUMN_OPTION = this.CARD_CONTEXT_MENU.getByRole('menuitem', {name: 'Move to column'})
  MOVE_TO_SINGLE_SELECT_FIELD_MENU = this.page.getByTestId('move-to-single-select-field-menu')
  MOVE_TO_ITERATION_FIELD_MENU = this.page.getByTestId('move-to-iteration-field-menu')
  ADD_NEW_COLUMN_TEXT_INPUT = this.page.getByTestId('single-select-option-text-input')
  CARD_CONTEXT_MENU_SET_COLUMN_LIMIT_OPTION = this.page.getByRole('menuitem', {name: 'Set limit'})
  COLUMNS = this.page.getByTestId('board-view-column')
  COLUMN_TITLE_TEXTS = this.page.getByTestId('board-view-column-title-text')

  /** Locator for the element that currently has a sash shown */
  SASH = this.BOARD_VIEW.locator('.show-sash')

  SWIMLANES_CONTAINER = this.page.getByTestId('swimlanes-container')

  /** Get the button to activate the column actions menu button */
  COLUMN_MENU_TRIGGER = (column: string) => this.page.getByRole('button', {name: `Actions for column: ${column}`})
  COLUMN_MENU = (column: string) => this.page.getByRole('menu', {name: `Actions for column: ${column}`})

  public expectSwimlanesVisible() {
    return expect(this.SWIMLANES_CONTAINER).toBeVisible()
  }

  public expectSwimlanesNotVisible() {
    return expect(this.SWIMLANES_CONTAINER).toBeHidden()
  }

  public getColumn(columnName: string): BoardColumn {
    return new BoardColumn(this.getColumnLocator(columnName))
  }

  public getColumnByHorizontalGroup(horizontalGroupName: string, columnName: string): BoardColumn {
    return new BoardColumn(this.getColumnLocatorByHorizontalGroup(horizontalGroupName, columnName))
  }

  public getCardByHorizontalGroup(horizontalGroupName: string, columnName: string, index: number): BoardColumnCard {
    return this.getColumnByHorizontalGroup(horizontalGroupName, columnName).getCard(index)
  }

  public getCard(columnName: string, index: number): BoardColumnCard {
    return this.getColumn(columnName).getCard(index)
  }

  public async expectVisible() {
    return expect(this.BOARD_VIEW).toBeVisible()
  }

  public async expectFocusedCardCount(count: number) {
    return expect(this.BOARD_VIEW.locator('[data-test-card-is-focused="true"]')).toHaveCount(count)
  }

  public async click() {
    await this.BOARD_VIEW.click()
  }

  public async clickCardContextMenuItem(item: string) {
    return this.page.getByTestId(`card-context-menu-${item}`).click()
  }

  public async clickAddColumnButton() {
    await this.page.getByTestId('add-new-column-button').click()
  }

  public async clickConfirmAddColumnButton() {
    await this.ADD_NEW_COLUMN_MENU_PLUS_BUTTON.click()
  }

  public async clickColumnLimitDialogSubmitButton() {
    await this.getColumnLimitDialog().locator('button[type="submit"]').click()
  }

  public async clickColumnLimitDialogButton() {
    await this.getColumnLimitDialog().locator('button[type="button"]', {hasText: 'Cancel'}).click()
  }

  public async openColumnLimitDialog(columnName: string) {
    await this.getColumn(columnName).openContextMenu()
    await this.CARD_CONTEXT_MENU_SET_COLUMN_LIMIT_OPTION.click()
    await expect(this.getColumnLimitDialog()).toBeVisible()
  }

  public async setColumnLimit(limit: string) {
    await this.getColumnLimitDialog().getByTestId('column-limit-text-input').fill(limit)
  }

  public getColumnLocatorByHorizontalGroup(horizontalGroupName: string, columnName: string) {
    return this.page.locator(
      `[data-board-horizontal-group="${horizontalGroupName}"] > [data-board-column="${columnName}"]`,
    )
  }

  private getColumnLocator(columnName: string) {
    return this.page.locator(`[data-board-column="${columnName}"]`)
  }

  private getColumnLimitDialog() {
    return this.page.getByRole('dialog', {name: 'column limit'})
  }

  public async expectHorizontalGroupToBeHidden(groupName: string) {
    return expect(this.page.getByTestId(`group-by-toggle-collapsed-${groupName}`)).toBeHidden()
  }

  public async expectHorizontalGroupToBeVisible(groupName: string) {
    return expect(this.page.getByTestId(`group-by-toggle-collapsed-${groupName}`)).toBeVisible()
  }

  public async toggleHorizontalGroup(groupName: string) {
    await this.page.getByTestId(`group-by-toggle-collapsed-${groupName}`).click()
  }

  public getCardIdsInColumn(columnName: string, numCards: number) {
    return [...Array(numCards).keys()].map(async i => {
      return await this.getColumn(columnName).getCard(i).getCardId()
    })
  }
}

class BoardColumn {
  private CARDS: Locator
  public columnLocator: Locator
  public ADD_ITEM: Locator
  public COLUMN_DROP_ZONE: Locator
  private COLUMN_CONTEXT_MENU_TRIGGER: Locator
  private COLUMN_COUNTER_LABEL: Locator
  public COLUMN_TITLE: Locator
  public COLUMN_TITLE_INPUT: Locator

  constructor(columnLocator: Locator) {
    this.columnLocator = columnLocator
    this.CARDS = columnLocator.getByTestId('board-view-column-card')
    this.ADD_ITEM = columnLocator.getByTestId('board-view-add-card-button')
    this.COLUMN_CONTEXT_MENU_TRIGGER = columnLocator.getByRole('button', {name: /actions for column:/i})
    this.COLUMN_COUNTER_LABEL = columnLocator.getByTestId('column-items-counter')
    this.COLUMN_DROP_ZONE = columnLocator.locator('[data-dnd-drop-type="card"]')
    this.COLUMN_TITLE = columnLocator.getByTestId('board-view-column-title')
    this.COLUMN_TITLE_INPUT = this.COLUMN_TITLE.locator('input[type="text"]')
  }

  public async openContextMenu() {
    return this.COLUMN_CONTEXT_MENU_TRIGGER.click()
  }

  public async expectVisible() {
    return expect(this.columnLocator).toBeVisible()
  }

  public async expectHidden() {
    return expect(this.columnLocator).toBeHidden()
  }

  public getCard(index: number): BoardColumnCard {
    return new BoardColumnCard(this.CARDS.nth(index))
  }

  public async getCardCount() {
    // There is a weird bug that we're seeing in Chromium where the Playwright APIs
    // are indicating that there are more cards in the column than there actually are.

    // By filtering out cards that are not visible, we can get a more accurate count.
    let visibleCards = 0
    const cards = this.CARDS
    const cardCount = await cards.count()
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i)
      const boundingBox = await card.boundingBox()
      if (boundingBox?.height > 0) {
        visibleCards++
      }
    }
    return visibleCards
  }

  public async expectCardCount(count: number) {
    return expect(this.CARDS).toHaveCount(count)
  }

  public async expectCountInCounterLabel(count: number | string) {
    return expect(this.COLUMN_COUNTER_LABEL).toHaveText(count.toString())
  }

  public expectAddItemToBeFocused() {
    return expect(this.ADD_ITEM).toBeFocused()
  }

  public async clickAddItem() {
    // Force parameter is here to account for the Omnibar's placement over the Add Item button
    return this.ADD_ITEM.click({force: true})
  }
}

class BoardColumnCard {
  private REVIEWERS_LABEL: Locator
  private LINKED_PR_LABEL: Locator
  private ASSIGNEES_GROUP: Locator
  private ISSUE_TYPE_LABEL: Locator
  private PARENT_ISSUE_LABEL: Locator
  private SUB_ISSUES_PROGRESS: Locator
  private ITEM_PANE_TRIGGER: Locator
  private CARD_TITLE_EXTERNAL_LINK: Locator
  public CARD_CONTEXT_MENU_TRIGGER: Locator
  public CARD_LABELS_LIST: Locator
  public CARD_LABELS: Locator

  public cardLocator: Locator

  constructor(cardLocator: Locator) {
    this.REVIEWERS_LABEL = cardLocator.getByTestId('reviewers-token')
    this.LINKED_PR_LABEL = cardLocator.getByTestId('linked-pr-token')
    this.ISSUE_TYPE_LABEL = cardLocator.getByTestId('issue-type-token')
    this.PARENT_ISSUE_LABEL = cardLocator.getByTestId('parent-issue-token')
    this.SUB_ISSUES_PROGRESS = cardLocator.getByTestId('progress-bar-solid')
    this.ASSIGNEES_GROUP = cardLocator.getByTestId('board-card-assignees')
    this.ITEM_PANE_TRIGGER = cardLocator.getByTestId('card-side-panel-trigger')
    this.CARD_TITLE_EXTERNAL_LINK = cardLocator.getByTestId('card-title-external-link')
    this.CARD_CONTEXT_MENU_TRIGGER = cardLocator.getByTestId('card-context-menu-trigger')
    this.CARD_LABELS_LIST = cardLocator.getByRole('list', {name: 'Fields'})
    this.CARD_LABELS = this.CARD_LABELS_LIST.getByRole('listitem')

    this.cardLocator = cardLocator
  }

  public async click(options?: Omit<Parameters<Locator['click']>[0], 'position'>) {
    // We override where the mouse clicks so that we can ensure the cursor clicks on an area that
    // does not contain any other clickable elements, and just focuses the card.
    return this.cardLocator.click({
      ...options,
      position: {
        x: 3,
        y: 3,
      },
      // We are forcing the click here, because a card can be a disabled button, but still
      // focusable. For example: redacted items cannot be interacted with, but they can
      // still be focused.
      force: true,
    })
  }

  public async focus() {
    return this.cardLocator.focus()
  }

  public async openContextMenu() {
    return this.CARD_CONTEXT_MENU_TRIGGER.click()
  }

  public async expectToBeVisible() {
    return expect(this.cardLocator).toBeVisible()
  }

  public async expectToBeHidden() {
    return expect(this.cardLocator).toBeHidden()
  }

  public async expectToBeFocused() {
    return expect(this.cardLocator).toBeFocused()
  }

  public async expectNotToBeFocused() {
    return expect(this.cardLocator).not.toBeFocused()
  }

  public async expectSelectionState(selectionState: boolean) {
    return (await this.cardLocator.getAttribute('data-test-card-is-selected')) === selectionState.toString()
  }

  public async expectKeyboardMovingCard() {
    return expect(await this.cardLocator.getAttribute('data-test-keyboard-moving-card')).toEqual('true')
  }

  public async expectNotKeyboardMovingCard() {
    return expect(await this.cardLocator.getAttribute('data-test-keyboard-moving-card')).toBeNull()
  }

  public async expectCardLabels() {
    return expect(this.CARD_LABELS_LIST).toBeVisible()
  }

  public async getCardTitle() {
    return await this.ITEM_PANE_TRIGGER.textContent()
  }

  public async getCardLabelContent() {
    // Instead of reading the text content of the card labels, we read the text content of the tooltip
    // associated with the card labels. If there is no tooltip, then we default back to the text content.
    // This somewhat mimics the experience that a screen reader user might have.
    const labels = await this.CARD_LABELS.all()
    const textContents = Promise.all(
      labels.map(async label => {
        const tooltipTextContent = await label.evaluate(el => el.querySelector('[popover]')?.textContent)
        return tooltipTextContent ?? (await label.textContent())
      }),
    )
    return textContents
  }

  public async expectReviewerLabelCount(count: number) {
    return expect(this.REVIEWERS_LABEL).toHaveCount(count)
  }

  public async expectLinkedPullRequestLabelCount(count: number) {
    return expect(this.LINKED_PR_LABEL).toHaveCount(count)
  }

  public async expectIssueTypeLabel(text: string) {
    return expect(this.ISSUE_TYPE_LABEL).toContainText(text)
  }

  public async expectParentIssueLabel(text: string) {
    return expect(this.PARENT_ISSUE_LABEL).toContainText(text)
  }

  public async expectSubIssuesProgressLabel(text: string) {
    return expect(this.SUB_ISSUES_PROGRESS).toContainText(text)
  }

  public async expectToHaveText(text: string) {
    return expect(this.cardLocator).toHaveText(text)
  }

  public async expectToContainText(text: string) {
    return expect(this.cardLocator).toContainText(text)
  }

  public async expectDataHovercardSubjectTag(expectedValue: string | null) {
    if (expectedValue == null) {
      const attributeValue = await this.cardLocator.getAttribute('data-hovercard-subject-tag')
      expect(attributeValue).toBeNull()
    } else {
      return expect(this.cardLocator).toHaveAttribute('data-hovercard-subject-tag', expectedValue)
    }
  }

  public async expectDataBoardCardId(expectedValue: number) {
    return expect(this.cardLocator).toHaveAttribute('data-board-card-id', `${expectedValue}`)
  }

  public async expectCardType(itemType: ItemType) {
    switch (itemType) {
      case ItemType.RedactedItem: {
        return expect(this.cardLocator).toContainText("You don't have permission to access this item")
      }
      case ItemType.DraftIssue: {
        return expect(this.cardLocator).toContainText('Draft')
      }
      case ItemType.Issue:
        {
          const icon = this.cardLocator.locator('svg').first()
          const label = await icon.getAttribute('aria-label')
          test.fail(
            label !== 'Open issue' && label !== 'Closed issue',
            `Expected label to mention issue, but instead found '${label}'`,
          )
        }
        break
      case ItemType.PullRequest: {
        const icon = this.cardLocator.locator('svg').first()
        const label = await icon.getAttribute('aria-label')
        test.fail(
          label !== 'Open pull request' && label !== 'Closed pull request',
          `Expected label to mention pull request, but instead found '${label}'`,
        )
        break
      }
      default:
        throw new Error('Not implemented')
    }
  }

  public getSidePanelTrigger() {
    return this.ITEM_PANE_TRIGGER
  }

  public getExternalLink() {
    return this.CARD_TITLE_EXTERNAL_LINK
  }

  public getReviewersLabel(): ReviewersLabel {
    return new ReviewersLabel(this.REVIEWERS_LABEL)
  }

  public getLinkedPullRequestLabel(index: number): LinkedPullRequestLabel {
    return new LinkedPullRequestLabel(this.LINKED_PR_LABEL.nth(index))
  }

  public getAssignees(): CardAssignees {
    return new CardAssignees(this.ASSIGNEES_GROUP)
  }

  public getIssueTypeLabel() {
    return this.ISSUE_TYPE_LABEL
  }

  public getParentIssueLabel() {
    return this.PARENT_ISSUE_LABEL
  }

  public async getCardId(): Promise<number> {
    return parseInt(await this.cardLocator.getAttribute('data-board-card-id'))
  }
}
