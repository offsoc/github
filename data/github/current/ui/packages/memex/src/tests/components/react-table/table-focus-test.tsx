import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {act, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useUpdateAndReorderItem, useUpdateItem} from '../../../client/hooks/use-update-item'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {useFetchSuggestedAssignees} from '../../../client/state-providers/suggestions/use-fetch-suggested-assignees'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {mockSelectPanel} from '../../mocks/components/select-panel-component'
import {asMockComponent, asMockHook} from '../../mocks/stub-utilities'
import {
  clickCell,
  clickCellWithKeyHeld,
  expectCellNotToBeBulkSelected,
  expectCellNotToHaveFocus,
  expectCellToBeBulkSelected,
  expectCellToBeInEditingMode,
  expectCellToHaveFocus,
  expectOmnibarToHaveFocus,
  getCell,
  renderTableWithRows,
} from './table-test-helper'

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
 * Without mocking this hook we will asynchronously make a call to fetch repositories and assignees after
 * rendering the omnibar. This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../client/state-providers/repositories/use-repositories')
jest.mock('../../../client/state-providers/suggestions/use-fetch-suggested-assignees')

/**
 * Without mocking this hook we will asynchronously make a call to update the item.
 * This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../client/hooks/use-update-item')
jest.mock('@primer/react/lib-esm/SelectPanel/SelectPanel')
/**
 * Without mocking this call, we won't get a consistent environment for our Meta keys
 */
jest.mock('@github-ui/get-os', () => ({
  ...jest.requireActual('@github-ui/get-os'),
  isMacOS: () => true,
}))

jest.mock('../../../client/hooks/use-enabled-features')

const defaultColumns = [
  systemColumnFactory.title().build(),
  systemColumnFactory.assignees().build(),
  systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
  systemColumnFactory.repository().build(),
  systemColumnFactory.milestone().build(),
]

function renderTable(itemsCount: number) {
  renderTableWithRows(itemsCount, defaultColumns)
}

beforeAll(() => {
  asMockHook(useEnabledFeatures).mockReturnValue({})
  asMockComponent(SelectPanel).mockImplementation(mockSelectPanel())
  asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
  asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
  asMockHook(useUpdateItem).mockReturnValue({updateItem: jest.fn()})
  asMockHook(useUpdateAndReorderItem).mockReturnValue({updateAndReorderItem: jest.fn()})
  asMockHook(useFetchSuggestedAssignees).mockReturnValue({fetchSuggestedAssignees: jest.fn()})
})

describe('Table Cell Focus', () => {
  describe('Initial focus', () => {
    it('should focus the omnibar for a table with no items', async () => {
      renderTable(0)

      await expectOmnibarToHaveFocus()
    })

    it('should focus on the title cell of the first row for a table with items', async () => {
      renderTable(1)

      await expectCellToHaveFocus('Title', 0)
    })
  })

  describe('With Mouse', () => {
    it('should focus on a cell in same column when clicked', async () => {
      renderTable(2)

      await clickCell('Title', 1)

      await expectCellToHaveFocus('Title', 1)
    })

    it('should focus on a cell in different column when clicked', async () => {
      renderTable(2)

      await clickCell('Assignees', 1)

      await expectCellToHaveFocus('Assignees', 1)
      await expectCellNotToHaveFocus('Title', 0)
    })

    it('should enter editing mode when a focused cell is clicked', async () => {
      renderTable(2)

      await clickCell('Assignees', 1)

      await expectCellToHaveFocus('Assignees', 1)

      await clickCell('Assignees', 1)

      await expectCellToBeInEditingMode('Assignees', 1)
    })

    it('should enter editing mode when an focused cell is double clicked', async () => {
      renderTable(2)

      await clickCell('Assignees', 1)

      await expectCellToHaveFocus('Assignees', 1)

      const cell = await getCell('Assignees', 1)
      await userEvent.dblClick(cell)

      await expectCellToBeInEditingMode('Assignees', 1)
    })

    it('should enter editing mode when an unfocused cell is double clicked', async () => {
      renderTable(2)

      const cell = await getCell('Status', 1)
      await userEvent.dblClick(cell)

      await expectCellToBeInEditingMode('Status', 1)
    })

    it('should select additional cells when clicked while holding down the meta key', async () => {
      renderTable(3)

      await clickCell('Status', 2)

      await expectCellToHaveFocus('Status', 2)
      await expectCellNotToHaveFocus('Status', 0)

      await clickCellWithKeyHeld('Status', 0, 'meta')

      await expectCellToBeBulkSelected('Status', 0)
      await expectCellToBeBulkSelected('Status', 2)
      await expectCellNotToBeBulkSelected('Status', 1)
    })

    it('should select all cells in between start and end cells when clicked while holding down the shift key', async () => {
      renderTable(4)

      await clickCell('Status', 3)

      await expectCellToHaveFocus('Status', 3)
      await expectCellNotToHaveFocus('Status', 0)

      await clickCellWithKeyHeld('Status', 1, 'Shift')

      await expectCellNotToBeBulkSelected('Status', 0)
      await expectCellToBeBulkSelected('Status', 3)
      await expectCellToBeBulkSelected('Status', 2)
      await expectCellToBeBulkSelected('Status', 1)
    })

    it('should deselect cells when clicked while holding down the meta key', async () => {
      renderTable(3)

      await clickCell('Status', 1)
      await clickCellWithKeyHeld('Status', 0, 'meta')
      await expectCellToBeBulkSelected('Status', 0)
      await expectCellToBeBulkSelected('Status', 1)

      await clickCellWithKeyHeld('Status', 1, 'meta')
      await expectCellNotToBeBulkSelected('Status', 1)
    })

    it('should deselect all bulk select cells if a different column is clicked', async () => {
      renderTable(3)

      await clickCell('Status', 1)
      await clickCellWithKeyHeld('Status', 2, 'meta')

      await expectCellToBeBulkSelected('Status', 1)

      await clickCellWithKeyHeld('Title', 1, 'meta')

      await expectCellNotToBeBulkSelected('Status', 1)
      await expectCellToHaveFocus('Title', 1)
    })

    it('selects range of cells on drag', async () => {
      renderTable(7)

      await userEvent.pointer([
        {keys: '[MouseLeft>]', target: await getCell('Status', 1)},
        {target: await getCell('Assignees', 2)},
        {target: await getCell('Status', 3)},
        {target: await getCell('Assignees', 4)},
        {keys: '[/MouseLeft]'},
      ])

      // even though we skipped 2, it should be selected based on range logic
      for (const i of [1, 2, 3]) await expectCellToBeBulkSelected('Status', i)
      await expectCellNotToBeBulkSelected('Status', 4)
      await expectCellNotToBeBulkSelected('Assignees', 4)
    })
  })

  describe('With Keyboard', () => {
    it('should enter editing mode when pressing Enter', async () => {
      renderTable(2)

      await userEvent.keyboard('{enter}')

      await expectCellToBeInEditingMode('Title', 0)
    })

    it('should focus on cell in next column when pressing Tab', async () => {
      renderTable(2)

      await clickCell('Title', 1)
      await userEvent.tab()

      await expectCellToHaveFocus('Assignees', 1)
    })

    it('should focus on cell in previous column when pressing Shift+Tab', async () => {
      renderTable(2)

      await clickCell('Assignees', 1)
      await userEvent.tab({shift: true})

      await expectCellToHaveFocus('Title', 1)
    })

    describe('Arrow down', () => {
      it('should focus cell in next row when not in the last row', async () => {
        renderTable(2)

        await expectCellToHaveFocus('Title', 0)

        await userEvent.keyboard('{arrowdown}')

        await expectCellToHaveFocus('Title', 1)
      })

      it('should focus omnibar when in cell in last row', async () => {
        renderTable(1)

        await expectCellToHaveFocus('Title', 0)

        await userEvent.keyboard('{arrowdown}')

        await expectOmnibarToHaveFocus()
      })
    })

    describe('Arrow up', () => {
      it('should focus cell in previous row when not the first row', async () => {
        renderTable(2)

        await clickCell('Status', 1)
        await expectCellToHaveFocus('Status', 1)

        await userEvent.keyboard('{arrowup}')

        await expectCellToHaveFocus('Status', 0)
      })

      it('should focus filter bar button when in cell in first row', async () => {
        renderTable(2)

        await clickCell('Status', 0)
        await expectCellToHaveFocus('Status', 0)

        await userEvent.keyboard('{arrowup}{enter}')

        const filterbar = await screen.findByTestId('filter-bar-input')
        await waitFor(() => expect(filterbar).toHaveFocus())
      })
    })

    describe('Arrow right', () => {
      it('should move focus to cell in the next column', async () => {
        renderTable(2)

        await clickCell('Assignees', 1)
        await expectCellToHaveFocus('Assignees', 1)

        await userEvent.keyboard('{arrowright}')

        await expectCellToHaveFocus('Status', 1)
      })

      it('should do nothing if already in last column', async () => {
        renderTable(2)

        await clickCell('Milestone', 1)
        await expectCellToHaveFocus('Milestone', 1)

        await userEvent.keyboard('{arrowright}')

        await expectCellToHaveFocus('Milestone', 1)
      })
    })

    describe('Arrow left', () => {
      it('should move focus to cell in the next column', async () => {
        renderTable(2)

        await clickCell('Assignees', 1)
        await expectCellToHaveFocus('Assignees', 1)

        await userEvent.keyboard('{arrowleft}')

        await expectCellToHaveFocus('Title', 1)
      })

      it('should do nothing if already in first column', async () => {
        renderTable(2)

        await clickCell('Title', 1)
        await expectCellToHaveFocus('Title', 1)

        await userEvent.keyboard('{arrowleft}')

        await expectCellToHaveFocus('Title', 1)
      })
    })

    describe('Meta keys', () => {
      it('only Home moves to the first cell in the same row', async () => {
        renderTable(4)

        await clickCell('Status', 1)
        await expectCellToHaveFocus('Status', 1)

        await userEvent.keyboard('{Home}')
        await expectCellToHaveFocus('Title', 1)
      })

      it('only End moves to the last cell in the same row', async () => {
        renderTable(4)

        await clickCell('Status', 1)
        await expectCellToHaveFocus('Status', 1)

        await userEvent.keyboard('{End}')
        await expectCellToHaveFocus('Milestone', 1)
      })

      it('meta+Home moves to the first cell in the first row', async () => {
        renderTable(4)

        await clickCell('Status', 1)
        await expectCellToHaveFocus('Status', 1)

        await userEvent.keyboard('{Meta>}{Home}{/Meta}')
        await expectCellToHaveFocus('Title', 0)
      })

      it('meta+End moves to the last cell in the last row', async () => {
        renderTable(4)

        await clickCell('Assignees', 0)
        await expectCellToHaveFocus('Assignees', 0)

        await userEvent.keyboard('{Meta>}{End}{/Meta}')
        await expectCellToHaveFocus('Milestone', 3)
      })

      it('meta+ArrowLeft moves to cell with the same row in the first column', async () => {
        renderTable(4)

        await clickCell('Status', 1)
        await expectCellToHaveFocus('Status', 1)

        await userEvent.keyboard('{Meta>}{ArrowLeft}{/Meta}')

        await expectCellToHaveFocus('Title', 1)
      })

      it('meta+ArrowRight moves to cell in the same row in the last column', async () => {
        renderTable(4)

        await clickCell('Assignees', 1)
        await expectCellToHaveFocus('Assignees', 1)

        await userEvent.keyboard('{Meta>}{ArrowRight}{/Meta}')

        await expectCellToHaveFocus('Milestone', 1)
      })

      it('meta+ArrowDown moves to cell in the last row in the same column', async () => {
        renderTable(4)

        await expectCellToHaveFocus('Title', 0)

        await userEvent.keyboard('{Meta>}{ArrowDown}{/Meta}')

        await expectCellToHaveFocus('Title', 3)
      })

      it('meta+ArrowUp moves to cell in the first row in the same column', async () => {
        renderTable(4)

        await clickCell('Title', 2)
        await expectCellToHaveFocus('Title', 2)

        await userEvent.keyboard('{Meta>}{ArrowUp}{/Meta}')

        await expectCellToHaveFocus('Title', 0)
      })
    })

    describe('selection', () => {
      it('deselects all cells if escape is pressed', async () => {
        renderTable(3)

        await clickCell('Status', 1)
        await clickCellWithKeyHeld('Status', 2, 'Meta')
        await expectCellToBeBulkSelected('Status', 1)

        await userEvent.keyboard('{Escape}')
        await expectCellNotToBeBulkSelected('Status', 1)
      })

      it('selects current and next cell on shift + down', async () => {
        renderTable(3)

        await clickCell('Status', 1)
        await userEvent.keyboard('{Escape}')
        await expectCellNotToBeBulkSelected('Status', 1)

        await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}')
        await expectCellToBeBulkSelected('Status', 1)
        await expectCellToBeBulkSelected('Status', 2)
      })

      it('selects current and previous cell on shift + up', async () => {
        renderTable(3)

        await clickCell('Status', 2)
        await userEvent.keyboard('{Escape}')
        await expectCellNotToBeBulkSelected('Status', 2)

        await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}')
        await expectCellToBeBulkSelected('Status', 2)
        await expectCellToBeBulkSelected('Status', 1)
      })

      it('toggle-selects additional focused cell on meta + enter', async () => {
        renderTable(5)

        await clickCell('Status', 1)
        await userEvent.keyboard('{Meta>}{Enter}{/Meta}')
        await expectCellToBeBulkSelected('Status', 1)

        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Meta>}{Enter}{/Meta}')
        await expectCellToBeBulkSelected('Status', 1)
        await expectCellToBeBulkSelected('Status', 3)

        await userEvent.keyboard('{Meta>}{Enter}{/Meta}')
        await expectCellToBeBulkSelected('Status', 1)
        await expectCellNotToBeBulkSelected('Status', 3)
      })

      it('selects range of cells on shift + enter', async () => {
        renderTable(5)

        await clickCell('Status', 1)
        await userEvent.keyboard('{Meta>}{Enter}{/Meta}')

        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Shift>}{Enter}{/Shift}')

        for (const i of [1, 2, 3]) await expectCellToBeBulkSelected('Status', i)
      })
    })
  })
})

describe('Table Header Cells Focus', () => {
  it('should focus add field button after last column', async () => {
    renderTable(1)

    act(() => screen.getByLabelText('Milestone column options').focus())
    await userEvent.tab()
    expect(screen.getByRole('button', {name: 'Add field'})).toHaveFocus()
  })
  it('should focus first row action menu after add field button', async () => {
    renderTable(1)

    act(() => screen.getByRole('button', {name: 'Add field'}).focus())
    await userEvent.tab()
    expect(screen.getByRole('button', {name: 'Row actions'})).toHaveFocus()
  })
})

describe('Keyboard shortcuts', () => {
  describe('Filtering', () => {
    beforeEach(() => {
      asMockHook(useEnabledFeatures).mockReturnValue({})
    })

    it('should focus the filter bar on meta+/', async () => {
      renderTable(1)

      await userEvent.keyboard('{Meta>}/{/Meta}')
      const input = await screen.findByTestId('filter-bar-input')
      expect(input).toHaveFocus()
    })
  })
})
