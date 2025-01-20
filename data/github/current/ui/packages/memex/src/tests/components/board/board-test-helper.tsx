import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import type {DraftIssue, Issue, PullRequest} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {CardGrid} from '../../../client/components/board/navigation'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {Resources} from '../../../client/strings'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {buildSystemColumns} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'
import {pullRequestFactory} from '../../factories/memex-items/pull-request-factory'
import {setupBoardView} from '../../test-app-wrapper'

export function createCardGrid(columns: Array<{id: string; items?: Array<number>}>): {
  cardGrid: CardGrid
} {
  return {
    cardGrid: [
      {
        horizontalGroupId: Resources.undefined,
        isCollapsed: false,
        isFooterDisabled: false,
        verticalGroups: columns.map(col => {
          return {
            verticalGroupId: col.id,
            items:
              col.items?.map(item =>
                createMemexItemModel({
                  id: item,
                  contentType: ItemType.DraftIssue,
                  content: {id: item},
                  memexProjectColumnValues: [],
                  priority: null,
                  updatedAt: new Date().toISOString(),
                }),
              ) ?? [],
          }
        }),
      },
    ],
  }
}

/**
 * Needed to ensure that board items are visible via components/board/hooks/use-is-visible.tsx
 * TODO: Examine better ways of mocking this
 */
export function mockGetBoundingClientRect({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  top = 0,
  bottom = 0,
  left = 0,
  right = 0,
} = {}) {
  jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    x,
    y,
    top,
    bottom,
    left,
    right,
    width,
    height,
    toJSON: jest.fn(),
  }))
}

/**
 * Builds up the columns and items for a board view. Uses the optionsWithCounts to
 * build the Status column with the provided options, as well as a list of items
 * whose values match the number indicated in optionsWithCounts.  Use itemType to specify
 * the type of card to create, defaults to draft issue.
 *
 * To create an option which would appear in the `No Status` column, use the optionName `No Status`.
 * We will not explicitly create an option in the column for this option name
 * @param optionsWithCounts
 * @param itemType
 * @returns
 */
export function buildCardsWithStatusValues(
  optionsWithCounts: {[optionName: string]: number} = {},
  itemType: ItemType = ItemType.DraftIssue,
) {
  const columns = buildSystemColumns({
    statusColumnOptionNames: Object.keys(optionsWithCounts).filter(name => name !== 'No Status'),
  })
  const items: Array<DraftIssue | Issue | PullRequest> = []

  for (const optionName in optionsWithCounts) {
    for (let i = 0; i < optionsWithCounts[optionName]; i++) {
      const memexProjectColumnValues = [columnValueFactory.title(`Card ${items.length + 1}`, itemType).build()]
      if (optionName !== 'No Status') {
        memexProjectColumnValues.push(columnValueFactory.status(optionName, columns).build())
      }

      switch (itemType) {
        case ItemType.Issue:
          items.push(
            issueFactory.build({
              memexProjectColumnValues,
            }),
          )
          break
        case ItemType.PullRequest:
          items.push(
            pullRequestFactory.build({
              memexProjectColumnValues,
            }),
          )
          break
        case ItemType.DraftIssue:
        default:
          items.push(
            draftIssueFactory.build({
              memexProjectColumnValues,
            }),
          )
          break
      }
    }
  }
  return {columns, items}
}

/**
 * Builds a board view and renders it with cards based on the optionsWithCounts and itemType parameter
 * @param optionsWithCounts Dictionary mapping the name of an option for the Status column, to the
 * number of cards which should be rendered in in that column
 * @param itemType Type of card to render, defaults to DraftIssue
 */
export function renderBoardWithCardConfiguration(
  optionsWithCounts: {[optionName: string]: number} = {},
  itemType: ItemType = ItemType.DraftIssue,
) {
  const {items, columns} = buildCardsWithStatusValues(optionsWithCounts, itemType)
  const {Board} = setupBoardView({
    items,
    columns,
    viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
  })
  render(<Board />)
}

export async function getCard(columnName: string, cardIndex: number) {
  const boardColumns = await screen.findAllByTestId('board-view-column')
  const column = boardColumns.find(columnElement => columnElement.getAttribute('data-board-column') === columnName)!
  const cards = await within(column).findAllByTestId('board-view-column-card')
  return cards[cardIndex]
}

export async function expectCardToBeSelected(columnName: string, cardIndex: number) {
  const card = await getCard(columnName, cardIndex)
  expect(card).toHaveAttribute('data-test-card-is-selected')
}

export async function expectCardNotToBeSelected(columnName: string, cardIndex: number) {
  const card = await getCard(columnName, cardIndex)
  expect(card).not.toHaveAttribute('data-test-card-is-selected')
}

export async function expectCardToHaveFocus(columnName: string, cardIndex: number) {
  await waitFor(async () => {
    const card = await getCard(columnName, cardIndex)
    expect(card).toHaveFocus()
  })
}

export async function expectCardNotToHaveFocus(columnName: string, cardIndex: number) {
  const card = await getCard(columnName, cardIndex)
  expect(card).not.toHaveFocus()
}

export async function clickCard(
  columnName: string,
  cardIndex: number,
  options?: Parameters<typeof userEvent.click>[1],
) {
  const card = await getCard(columnName, cardIndex)
  await userEvent.click(card, options)
}
