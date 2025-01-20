import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {forwardRef, type ReactNode} from 'react'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import {Role} from '../../../client/api/common-contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {SidePanelProviderRenderFunction, useBoardSidePanel, useSidePanel} from '../../../client/hooks/use-side-panel'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {buildSystemColumns} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {asMockComponent, asMockHook} from '../../mocks/stub-utilities'
import {setupBoardView} from '../../test-app-wrapper'
import {
  enterFilterText,
  expectAddNewItemButtonToHaveFocus,
  expectClearFilterQueryButtonToHaveFocus,
  expectFilterInputToHaveFocus,
  expectRevertChangesButtonToHaveFocus,
  findRevertChangesButton,
} from '../project-view/project-view-test-helper'
import {
  buildCardsWithStatusValues,
  clickCard,
  expectCardNotToHaveFocus,
  expectCardToHaveFocus,
  getCard,
  mockGetBoundingClientRect,
  renderBoardWithCardConfiguration,
} from './board-test-helper'

/**
 * There isn't much value in trying to determine the picker's position
 * in a jsdom environment and without mocking out this hook, whenever we
 * try to render a picker (like in the omnibar), we go into an infinite rendering
 * loop due to no actual implementation in `getBoundingClientRect`
 */
jest.mock('../../../client/components/common/picker-list', () => ({
  ...jest.requireActual('../../../client/components/common/picker-list'),
  useAdjustPickerPosition: () => ({
    adjustPickerPosition: jest.fn(),
  }),
}))

/**
 * We don't really care about the filter suggestions that are shown when we focus the
 * filter input during these tests, so we'll just stub out the component. Without these,
 * we run into jest warnings for setting state outside after the test has been torn down.
 */
jest.mock('../../../client/components/filter-bar/filter-suggestions', () => ({
  ...jest.requireActual('../../../client/components/filter-bar/filter-suggestions'),
  FilterSuggestions: forwardRef(function MockFilterSuggestions() {
    return <></>
  }),
}))

/**
 * Without mocking this hook we will issue an additional server call because the
 * data that we have for our items does not line up with the columns that are defined for the
 * test. This additional server call is async and will respond _after_ the test has completed,
 * causing noise in the test console when we try to `setState` outside of an `act` block.
 *
 * We could try to always make sure that our column values line up with our columns, to prevent
 * this call; however, since this behavior isn't really what we're focused on testing in
 * this test suite, we instead just mock out the hook entirely.
 */
jest.mock('../../../client/state-providers/columns/use-has-column-data')

/**
 * Without mocking this hook we will asynchronously make a call to fetch repositories after
 * rendering the omnibar. This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../client/state-providers/repositories/use-repositories')

/**
 * Without mocking this call, we won't get a consistent environment for our Meta keys
 */
jest.mock('@github-ui/get-os', () => ({
  ...jest.requireActual('@github-ui/get-os'),
  isMacOS: () => true,
}))

/**
 * Without mocking these hooks and component, we would render the side panel. This
 * behavior isn't what we're focusing on testing in this test suite, so we mock out the hooks entirely.
 */
jest.mock('../../../client/hooks/use-side-panel')
asMockComponent(SidePanelProviderRenderFunction).mockImplementation(function MockSidePanelProvider({
  children,
}: {
  children: ReactNode
}) {
  return children
})
asMockHook(useSidePanel).mockReturnValue({
  supportedItemTypes: new Set([ItemType.DraftIssue, ItemType.Issue]),
})
const openPane = jest.fn()
asMockHook(useBoardSidePanel).mockReturnValue({
  openPane,
})

jest.mock('../../../client/hooks/use-enabled-features')

describe('Board Focus', () => {
  beforeAll(() => {
    mockGetBoundingClientRect()

    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
    asMockHook(useEnabledFeatures).mockReturnValue({})
  })

  /**
   * Renders a board with the number of cards defined in the no status columns.
   * No other columns will be provided
   * @param count number of no status cards to add to the board
   */
  function renderBoardWithCards(count: number) {
    renderBoardWithCardConfiguration({'No Status': count})
  }

  async function expectOmnibarToHaveFocus(columnName: string) {
    const omnibar = await screen.findByTestId('repo-searcher-input')
    await waitFor(() => expect(omnibar).toHaveFocus())

    // ensure the focus corresponds to the correct column
    const boardColumns = await screen.findAllByTestId('board-view-column')
    const column = boardColumns.find(columnElement => columnElement.getAttribute('data-board-column') === columnName)!
    const addCardIndicator = within(column).getByTestId('board-view-add-card-indicator')
    expect(addCardIndicator).toBeInTheDocument()
  }

  async function expectOmnibarNotToHaveFocus() {
    const omnibar = await screen.findByTestId('repo-searcher-input')
    expect(omnibar).not.toHaveFocus()
  }

  async function expectCardActionMenuButtonToHaveFocus(columnName: string, cardIndex: number) {
    const card = await getCard(columnName, cardIndex)
    const actionMenuButton = await within(card).findByLabelText('More actions')
    expect(actionMenuButton).toHaveFocus()
  }

  async function expectCardTitleToHaveFocus(columnName: string, cardIndex: number) {
    const card = await getCard(columnName, cardIndex)
    const cardTitleLink = await within(card).findByTestId('card-side-panel-trigger')
    expect(cardTitleLink).toHaveFocus()
  }

  async function expectCardIssueLabelToHaveFocus(columnName: string, cardIndex: number, labelName: string) {
    const card = await getCard(columnName, cardIndex)
    const labelButton = await within(card).findByRole('button', {name: labelName})
    expect(labelButton).toHaveFocus()
  }

  async function expectAddNewColumnButtonToHaveFocus() {
    const addNewColumnButton = await screen.findByLabelText('Add a new column to the board')
    expect(addNewColumnButton).toHaveFocus()
  }

  async function expectAddItemToColumnButtonToHaveFocus(columnName: string) {
    const boardColumns = await screen.findAllByTestId('board-view-column')
    const column = boardColumns.find(columnElement => columnElement.getAttribute('data-board-column') === columnName)!
    const addItemToColumnButton = await within(column).findByTestId('board-view-add-card-button')
    expect(addItemToColumnButton).toHaveFocus()
  }

  async function focusOmnibarForColumn(columnName: string) {
    const boardColumns = await screen.findAllByTestId('board-view-column')
    const column = boardColumns.find(columnElement => columnElement.getAttribute('data-board-column') === columnName)!
    const addCardButton = within(column).getByTestId('board-view-add-card-button')
    await userEvent.click(addCardButton)
  }

  async function focusCardTitle(columnName: string, cardIndex: number) {
    const card = await getCard(columnName, cardIndex)
    const cardTitleLink = await within(card).findByTestId('card-side-panel-trigger')
    cardTitleLink.focus()
  }

  async function focusCardActionMenuButton(columnName: string, cardIndex: number) {
    const card = await getCard(columnName, cardIndex)
    const actionMenuButton = await within(card).findByLabelText('More actions')
    actionMenuButton.focus()
    expect(actionMenuButton).toHaveFocus()
  }

  async function expectFirstCardFocus() {
    const cards = await screen.findAllByTestId('board-view-column-card')
    const firstCard = cards[0]
    await waitFor(() => expect(firstCard).toHaveFocus())
  }

  describe('Initial focus', () => {
    it('should focus the omnibar for a board with no items', async () => {
      renderBoardWithCards(0)
      await expectOmnibarToHaveFocus('No Status')
    })

    it('should focus the first card in the first column with items', async () => {
      renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 0, Done: 0})
      await expectCardToHaveFocus('Todo', 0)
    })

    it('should focus a card when the first column has no items', async () => {
      renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 1, Done: 0})
      await expectCardToHaveFocus('In Progress', 0)
    })
  })

  describe('With Mouse', () => {
    it('should focus a card when clicked', async () => {
      renderBoardWithCards(2)

      await expectCardToHaveFocus('No Status', 0)
      await clickCard('No Status', 1)
      await expectCardToHaveFocus('No Status', 1)
    })

    it('should un-focus a card when the board is clicked', async () => {
      renderBoardWithCards(2)

      await expectCardToHaveFocus('No Status', 0)
      const board = screen.getByTestId('board-view')

      await userEvent.click(board)

      await expectCardNotToHaveFocus('No Status', 0)
    })

    it('should focus omnibar when `Add cards` button is clicked', async () => {
      renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 2, Done: 0})

      await expectCardToHaveFocus('Todo', 0)

      const addCardButtons = await screen.findAllByTestId('board-view-add-card-button')
      expect(addCardButtons).toHaveLength(4)

      await userEvent.click(addCardButtons[0])

      await expectOmnibarToHaveFocus('No Status')

      // Click a different card so that we can click a different column's add card button
      await clickCard('Todo', 0)
      await expectCardToHaveFocus('Todo', 0)

      // Click the add card button for the 3rd column - In Progress
      await userEvent.click(addCardButtons[2])

      await expectOmnibarToHaveFocus('In Progress')
    })

    it('clicking the board unfocuses the omnibar', async () => {
      renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})

      await focusOmnibarForColumn('No Status')
      await expectOmnibarToHaveFocus('No Status')

      const board = screen.getByTestId('board-view')
      await userEvent.click(board)

      await expectOmnibarNotToHaveFocus()
    })
  })

  describe('With Keyboard', () => {
    describe('Starting from a card', () => {
      describe('Arrow down', () => {
        it('focuses next card in column', async () => {
          renderBoardWithCards(2)

          await expectCardToHaveFocus('No Status', 0)

          await userEvent.keyboard('{arrowdown}')

          await expectCardToHaveFocus('No Status', 1)
        })

        it('on last card in column focuses omnibar', async () => {
          renderBoardWithCards(1)

          await expectCardToHaveFocus('No Status', 0)

          await userEvent.keyboard('{arrowdown}')

          await expectOmnibarToHaveFocus('No Status')
        })
      })

      describe('Arrow up', () => {
        it('focuses previous card in column', async () => {
          renderBoardWithCards(2)

          await clickCard('No Status', 1)
          await expectCardNotToHaveFocus('No Status', 0)

          await userEvent.keyboard('{arrowup}')

          await expectCardToHaveFocus('No Status', 0)
        })

        it('on first card in column focuses filter bar', async () => {
          renderBoardWithCards(1)

          await expectCardToHaveFocus('No Status', 0)

          await userEvent.keyboard('{arrowup}')

          await expectFilterInputToHaveFocus()
        })
      })

      describe('Arrow right', () => {
        it('focus moves to card with same index in next column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 2, Done: 0})

          await clickCard('Todo', 1)
          await expectCardToHaveFocus('Todo', 1)

          await userEvent.keyboard('{arrowright}')

          await expectCardToHaveFocus('In Progress', 1)
        })

        it('does nothing if already in last column', async () => {
          renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 0, Done: 1})

          await expectCardToHaveFocus('Done', 0)

          await userEvent.keyboard('{arrowright}')

          await expectCardToHaveFocus('Done', 0)
        })

        it('skips empty columns', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 0, Done: 2})

          await clickCard('Todo', 1)
          await expectCardToHaveFocus('Todo', 1)

          await userEvent.keyboard('{arrowright}')

          await expectCardToHaveFocus('Done', 1)
        })

        it('moves to last item in next column if not enough items in that column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 1, Done: 0})

          await clickCard('Todo', 1)
          await expectCardToHaveFocus('Todo', 1)

          await userEvent.keyboard('{arrowright}')

          await expectCardToHaveFocus('In Progress', 0)
        })
      })

      describe('Arrow left', () => {
        it('focus moves to card with same index in previous column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 2, Done: 0})

          await clickCard('In Progress', 1)
          await expectCardToHaveFocus('In Progress', 1)

          await userEvent.keyboard('{arrowleft}')

          await expectCardToHaveFocus('Todo', 1)
        })

        it('does nothing if already in first column', async () => {
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})

          await expectFirstCardFocus()

          await userEvent.keyboard('{arrowleft}')

          await expectFirstCardFocus()
        })

        it('skips empty columns', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 0, Done: 2})

          await clickCard('Done', 1)

          await expectCardToHaveFocus('Done', 1)

          await userEvent.keyboard('{arrowleft}')

          await expectCardToHaveFocus('Todo', 1)
        })

        it('moves to last item in previous column if not enough items in that column', async () => {
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 2, Done: 0})

          await clickCard('In Progress', 1)
          await expectCardToHaveFocus('In Progress', 1)

          await userEvent.keyboard('{arrowleft}')

          await expectCardToHaveFocus('Todo', 0)
        })
      })
      describe('Meta keys', () => {
        it('home and End do nothing', async () => {
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 1, Done: 1})

          await clickCard('In Progress', 0)
          await expectCardToHaveFocus('In Progress', 0)

          await userEvent.keyboard('{Home}')
          await expectCardToHaveFocus('In Progress', 0)
          await userEvent.keyboard('{End}')
          await expectCardToHaveFocus('In Progress', 0)
        })

        it('meta+Home moves to the first card in the first column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 0, Done: 2})

          await clickCard('Done', 1)
          await expectCardToHaveFocus('Done', 1)

          await userEvent.keyboard('{Meta>}{Home}{/Meta}')
          await expectCardToHaveFocus('Todo', 0)
        })

        it('meta+End moves to the last card in the last column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 0, Done: 2})

          await expectCardToHaveFocus('Todo', 0)

          await userEvent.keyboard('{Meta>}{End}{/Meta}')
          await expectCardToHaveFocus('Done', 1)
        })

        it('meta+ArrowLeft moves to card with the same index in the first column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 1, Done: 2})

          await clickCard('Done', 1)
          await expectCardToHaveFocus('Done', 1)

          await userEvent.keyboard('{Meta>}{ArrowLeft}{/Meta}')

          await expectCardToHaveFocus('Todo', 1)
        })

        it('meta+ArrowRight moves to card with the same index in the last column', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 1, Done: 2})

          await clickCard('Todo', 1)
          await expectCardToHaveFocus('Todo', 1)

          await userEvent.keyboard('{Meta>}{ArrowRight}{/Meta}')

          await expectCardToHaveFocus('Done', 1)
        })

        it('meta+ArrowDown moves to last card in column', async () => {
          renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 3, Done: 0})

          await clickCard('In Progress', 0)
          await expectCardToHaveFocus('In Progress', 0)

          await userEvent.keyboard('{Meta>}{ArrowDown}{/Meta}')

          await expectCardToHaveFocus('In Progress', 2)
        })

        it('meta+ArrowUp moves to first card in column', async () => {
          renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 3, Done: 0})

          await clickCard('In Progress', 2)
          await expectCardToHaveFocus('In Progress', 2)

          await userEvent.keyboard('{Meta>}{ArrowUp}{/Meta}')

          await expectCardToHaveFocus('In Progress', 0)
        })
      })

      describe('ctrl+space', () => {
        it('focuses omnibar for column of the card that has focus', async () => {
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})

          await expectCardToHaveFocus('Todo', 0)

          await userEvent.keyboard('{Control>} {/Control}')

          await expectOmnibarToHaveFocus('Todo')
        })
      })

      describe('Space', () => {
        it('open side panel for a draft issue', async () => {
          openPane.mockClear()
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})

          await expectCardToHaveFocus('Todo', 0)
          await userEvent.keyboard(' ')

          expect(openPane).toHaveBeenCalled()
        })

        it('open side panel for an issue', async () => {
          openPane.mockClear()
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0}, ItemType.Issue)

          await expectCardToHaveFocus('Todo', 0)
          await userEvent.keyboard(' ')

          expect(openPane).toHaveBeenCalled()
        })

        it('does not open side panel for a pull request', async () => {
          openPane.mockClear()
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0}, ItemType.PullRequest)

          await expectCardToHaveFocus('Todo', 0)
          await userEvent.keyboard(' ')

          expect(openPane).not.toHaveBeenCalled()
        })
      })

      describe('tab navigation', () => {
        function buildTodoItemWithAssigneeAndLabel(
          columns: Array<MemexColumn>,
          assigneeLogin: string,
          labelName: string,
        ) {
          return draftIssueFactory.build({
            memexProjectColumnValues: [
              columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
              columnValueFactory.status('Todo', columns).build(),
              columnValueFactory.assignees([assigneeLogin]).build(),
              columnValueFactory.labels([labelName]).build(),
            ],
          })
        }

        it('tab focuses next card when last focusable element in card has focus', async () => {
          renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 0, Done: 0})
          await expectFirstCardFocus()

          await focusCardTitle('Todo', 0)
          await expectCardTitleToHaveFocus('Todo', 0)

          await userEvent.tab()
          await expectCardToHaveFocus('Todo', 1)
        })

        it('tab focuses first focusable element in card when card has focus', async () => {
          const columns = buildSystemColumns({
            statusColumnOptionNames: ['Todo', 'In Progress', 'Done'],
          })
          const items = [
            buildTodoItemWithAssigneeAndLabel(columns, 'dmarcey', 'Bug'),
            draftIssueFactory.build({
              memexProjectColumnValues: [
                columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
                columnValueFactory.status('Todo', columns).build(),
              ],
            }),
          ]

          const {Board} = setupBoardView({
            items,
            columns,
            viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
          })
          render(<Board />)

          await expectCardToHaveFocus('Todo', 0)

          await userEvent.tab()
          await expectCardActionMenuButtonToHaveFocus('Todo', 0)
        })

        it('shift+tab focuses last focusable element in previous card when card has focus', async () => {
          const columns = buildSystemColumns({
            statusColumnOptionNames: ['Todo', 'In Progress', 'Done'],
          })
          const items = [
            buildTodoItemWithAssigneeAndLabel(columns, 'dmarcey', 'Bug'),
            draftIssueFactory.build({
              memexProjectColumnValues: [
                columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
                columnValueFactory.status('Todo', columns).build(),
              ],
            }),
          ]

          const {Board} = setupBoardView({
            items,
            columns,
            viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
          })
          render(<Board />)

          await clickCard('Todo', 1)
          await expectCardToHaveFocus('Todo', 1)

          await userEvent.tab({shift: true})
          await expectCardIssueLabelToHaveFocus('Todo', 0, 'Label: Bug')
        })

        it('shift+tab focuses card when first focusable element in card has focus', async () => {
          const columns = buildSystemColumns({
            statusColumnOptionNames: ['Todo', 'In Progress', 'Done'],
          })
          const items = [
            buildTodoItemWithAssigneeAndLabel(columns, 'dmarcey', 'Bug'),
            draftIssueFactory.build({
              memexProjectColumnValues: [
                columnValueFactory.title('Card Title', ItemType.DraftIssue).build(),
                columnValueFactory.status('Todo', columns).build(),
              ],
            }),
          ]

          const {Board} = setupBoardView({
            items,
            columns,
            viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
          })
          render(<Board />)
          await expectFirstCardFocus()

          await focusCardActionMenuButton('Todo', 0)
          await expectCardActionMenuButtonToHaveFocus('Todo', 0)

          await userEvent.tab({shift: true})
          await expectCardToHaveFocus('Todo', 0)
        })

        it('focuses Add item button after tabbing from last focusable element in last card in column', async () => {
          renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})
          await expectFirstCardFocus()

          await focusCardTitle('Todo', 0)
          await expectCardTitleToHaveFocus('Todo', 0)

          await userEvent.tab()
          await expectAddItemToColumnButtonToHaveFocus('Todo')
        })

        it('with no active filter or dirty changes, tab and shift+tab behave as expected', async () => {
          renderBoardWithCardConfiguration({'No Status': 1, 'In Progress': 0, Done: 0})

          await expectCardToHaveFocus('No Status', 0)

          await userEvent.tab({shift: true})
          await expectFilterInputToHaveFocus()

          await userEvent.tab()
          await expectCardToHaveFocus('No Status', 0)
        })

        it('with active filter query, but no dirty changes, tab and shift+tab behave as expected', async () => {
          const {items, columns} = buildCardsWithStatusValues({'No Status': 1, 'In Progress': 0, Done: 0})
          const views = [viewFactory.board().build({filter: 'no:status'})]
          const {Board} = setupBoardView({
            items,
            columns,
            viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
            views,
          })
          render(<Board />)

          await expectCardToHaveFocus('No Status', 0)

          await userEvent.tab({shift: true})
          await expectClearFilterQueryButtonToHaveFocus()

          await userEvent.tab()
          await expectCardToHaveFocus('No Status', 0)
        })

        it('with active filter and dirty changes, tab behaves as expected', async () => {
          renderBoardWithCardConfiguration({'No Status': 1, 'In Progress': 0, Done: 0})

          await expectCardToHaveFocus('No Status', 0)

          await enterFilterText('no:status')
          await expectFilterInputToHaveFocus()
          await waitFor(async () => expect(await screen.findByTestId('clear-filter-query')).toBeEnabled())
          await waitFor(async () => expect(await screen.findByText('Save')).toBeEnabled())
          await waitFor(async () => expect(await findRevertChangesButton()).toBeEnabled())
          await userEvent.tab()
          await expectClearFilterQueryButtonToHaveFocus()

          await userEvent.tab()
          await expectRevertChangesButtonToHaveFocus()
        })
      })
    })

    describe('Starting from the omnibar', () => {
      it('ctrl+space unfocuses the omnibar', async () => {
        renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})

        await focusOmnibarForColumn('No Status')
        await expectOmnibarToHaveFocus('No Status')

        await userEvent.keyboard('{Control>} {/Control}')

        await expectOmnibarNotToHaveFocus()
      })

      it('escape unfocuses the omnibar', async () => {
        renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 0, Done: 0})

        await focusOmnibarForColumn('No Status')
        await expectOmnibarToHaveFocus('No Status')

        await userEvent.keyboard('{Escape}')

        await expectOmnibarNotToHaveFocus()
      })

      it('arrowUp sets focus to the last card in the column', async () => {
        renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 2, Done: 0})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.keyboard('{ArrowUp}')

        await expectCardToHaveFocus('In Progress', 1)
      })

      it('arrowUp from Omnibar when no cards in column focuses filter bar', async () => {
        renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 2, Done: 0})

        await focusOmnibarForColumn('Done')
        await expectOmnibarToHaveFocus('Done')

        await userEvent.keyboard('{ArrowUp}')

        await expectFilterInputToHaveFocus()
      })

      it('home and End do nothing', async () => {
        renderBoardWithCardConfiguration({Todo: 1, 'In Progress': 2, Done: 0})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.keyboard('{Home}')
        await expectOmnibarToHaveFocus('In Progress')
        await userEvent.keyboard('{End}')
        await expectOmnibarToHaveFocus('In Progress')
      })

      it('meta+Home moves to the first card in the first column', async () => {
        renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 1, Done: 2})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.keyboard('{Meta>}{Home}{/Meta}')
        await expectCardToHaveFocus('Todo', 0)
      })

      it('meta+End moves to the last card in the last column', async () => {
        renderBoardWithCardConfiguration({Todo: 2, 'In Progress': 1, Done: 2})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.keyboard('{Meta>}{End}{/Meta}')
        await expectCardToHaveFocus('Done', 1)
      })

      it('meta+ArrowDown moves to last card in column', async () => {
        renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 3, Done: 0})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.keyboard('{Meta>}{ArrowDown}{/Meta}')

        await expectCardToHaveFocus('In Progress', 2)
      })

      it('meta+ArrowUp moves to first card in column', async () => {
        renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 3, Done: 0})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.keyboard('{Meta>}{ArrowUp}{/Meta}')

        await expectCardToHaveFocus('In Progress', 0)
      })

      it('shift+tab moves to Add New Column button', async () => {
        renderBoardWithCardConfiguration({Todo: 0, 'In Progress': 3, Done: 0})

        await focusOmnibarForColumn('In Progress')
        await expectOmnibarToHaveFocus('In Progress')

        await userEvent.tab({shift: true})
        await expectAddNewItemButtonToHaveFocus()

        await userEvent.tab({shift: true})
        await expectAddNewColumnButtonToHaveFocus()
      })
    })
  })

  describe('Keyboard shortcuts', () => {
    describe('Filtering', () => {
      beforeEach(() => {
        asMockHook(useEnabledFeatures).mockReturnValue({})
      })

      it('should focus the filter bar on meta+/', async () => {
        renderBoardWithCards(1)

        await userEvent.keyboard('{Meta>}/{/Meta}')
        const input = await screen.findByTestId('filter-bar-input')
        expect(input).toHaveFocus()
      })
    })
  })
})
