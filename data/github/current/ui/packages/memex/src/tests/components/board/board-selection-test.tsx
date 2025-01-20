import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {asMockHook} from '../../mocks/stub-utilities'
import {
  clickCard,
  expectCardNotToBeSelected,
  expectCardNotToHaveFocus,
  expectCardToBeSelected,
  expectCardToHaveFocus,
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
 * Without mocking this hook we will asynchronously make a call to fetch respositories after
 * rendering the omnibar. This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test sutie, so we just
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

describe('Board Selection', () => {
  beforeAll(() => {
    mockGetBoundingClientRect()

    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
  })

  async function shiftClickCard(columnName: string, cardIndex: number) {
    const keyboardState = await userEvent.keyboard('{Shift>}', {skipAutoClose: true})
    await clickCard(columnName, cardIndex, {keyboardState})
    await userEvent.keyboard('{/Shift}')
  }

  async function metaClickCard(columnName: string, cardIndex: number) {
    const keyboardState = await userEvent.keyboard('{Meta>}', {skipAutoClose: true})
    await clickCard(columnName, cardIndex, {keyboardState})
    await userEvent.keyboard('{/Meta}')
  }

  describe('Selecting cards', () => {
    it('shift + space selects a card', async () => {
      renderBoardWithCardConfiguration({Todo: 3, 'In Progress': 0, Done: 0})

      await clickCard('Todo', 1)
      await expectCardNotToBeSelected('Todo', 1)

      await userEvent.keyboard('{Shift>} {/Shift}')
      await expectCardToBeSelected('Todo', 1)

      await userEvent.keyboard('{Escape}')

      await expectCardNotToBeSelected('Todo', 1)
    })

    it('shift + arrow keys changes selection state', async () => {
      renderBoardWithCardConfiguration({Todo: 3, 'In Progress': 0, Done: 0})

      await expectCardToHaveFocus('Todo', 0)
      await expectCardNotToBeSelected('Todo', 0)
      await expectCardNotToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)

      await userEvent.keyboard('{Shift>} {/Shift}')
      await expectCardToBeSelected('Todo', 0)
      await expectCardNotToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)

      await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}')
      await expectCardToBeSelected('Todo', 0)
      await expectCardToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)

      await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}')
      await expectCardToBeSelected('Todo', 0)
      await expectCardToBeSelected('Todo', 1)
      await expectCardToBeSelected('Todo', 2)

      await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}')
      await expectCardToBeSelected('Todo', 0)
      await expectCardToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)
    })

    it('shift + click selects multiple cards', async () => {
      renderBoardWithCardConfiguration({Todo: 3, 'In Progress': 0, Done: 0})

      await expectCardToHaveFocus('Todo', 0)
      await expectCardNotToBeSelected('Todo', 0)
      await expectCardNotToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)

      await shiftClickCard('Todo', 2)

      await expectCardToBeSelected('Todo', 0)
      await expectCardToBeSelected('Todo', 1)
      await expectCardToBeSelected('Todo', 2)
    })

    it('meta + click selects multiple cards, skipping cards in column', async () => {
      renderBoardWithCardConfiguration({Todo: 3, 'In Progress': 0, Done: 0})

      await expectCardToHaveFocus('Todo', 0)
      await expectCardNotToBeSelected('Todo', 0)
      await expectCardNotToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)

      await metaClickCard('Todo', 2)

      await expectCardToBeSelected('Todo', 0)
      await expectCardNotToBeSelected('Todo', 1)
      await expectCardToBeSelected('Todo', 2)
    })

    it('meta + click only focuses when no card has focus', async () => {
      renderBoardWithCardConfiguration({Todo: 3, 'In Progress': 0, Done: 0})

      await expectCardToHaveFocus('Todo', 0)

      const board = screen.getByTestId('board-view')
      await userEvent.click(board)

      await expectCardNotToHaveFocus('Todo', 0)
      await expectCardNotToHaveFocus('Todo', 2)

      await metaClickCard('Todo', 2)

      await expectCardToHaveFocus('Todo', 2)

      await expectCardNotToBeSelected('Todo', 0)
      await expectCardNotToBeSelected('Todo', 1)
      await expectCardNotToBeSelected('Todo', 2)
    })
  })
})
