import userEvent from '@testing-library/user-event'

import {useUpdateAndReorderItem, useUpdateItem} from '../../../client/hooks/use-update-item'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {asMockHook} from '../../mocks/stub-utilities'
import {
  clickCell,
  expectCellNotToHaveFocus,
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
 * Without mocking this hook we will asynchronously make a call to fetch repositories after
 * rendering the omnibar. This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../client/state-providers/repositories/use-repositories')

/**
 * Without mocking this hook we will asynchronously make a call to update the item.
 * This call will often return _after_ the test has completed, causing noise
 * in the test console when we try to `setState` outside of an `act` block.
 *
 * This behavior isn't really what we're focusing on testing in this test suite, so we just
 * mock out this hook entirely.
 */
jest.mock('../../../client/hooks/use-update-item')

describe('Title Cell', () => {
  const columns = [
    systemColumnFactory.title().build(),
    systemColumnFactory.assignees().build(),
    systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
    systemColumnFactory.milestone().build(),
  ]
  const updateItemMock = jest.fn()

  function renderTable(itemsCount: number) {
    renderTableWithRows(itemsCount, columns)
  }

  function getUpdatedValue() {
    return updateItemMock.mock.calls[0][1].value.title.raw
  }

  beforeEach(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
    asMockHook(useUpdateItem).mockReturnValue({updateItem: updateItemMock})
    asMockHook(useUpdateAndReorderItem).mockReturnValue({updateAndReorderItem: updateItemMock})
  })

  beforeEach(() => {
    updateItemMock.mockReset()
  })

  describe('With Mouse', () => {
    it('should enter editing mode when double clicked', async () => {
      renderTable(2)

      const cell = await getCell('Title', 0)
      await userEvent.dblClick(cell)

      await expectCellToBeInEditingMode('Title', 0)
    })

    it('should exit editing mode when another cell is clicked', async () => {
      renderTable(2)

      const cell = await getCell('Title', 0)
      await userEvent.dblClick(cell)

      await expectCellToBeInEditingMode('Title', 0)

      await clickCell('Assignees', 0)

      await expectCellNotToHaveFocus('Title', 0)
    })
  })

  describe('With Keyboard', () => {
    it('should append to title when typing after pressing Enter', async () => {
      renderTable(2)

      const cell = await getCell('Title', 0)
      const title = cell.textContent

      await userEvent.keyboard('{enter}')
      await expectCellToBeInEditingMode('Title', 0)

      await userEvent.keyboard(' editing cell{enter}')
      await expectCellNotToHaveFocus('Title', 0)

      expect(getUpdatedValue()).toBe(`${title} editing cell`)
    })

    it('should not override title when typing without pressing Enter', async () => {
      renderTable(2)

      await userEvent.keyboard('new')

      await expectCellToHaveFocus('Title', 0)

      expect(updateItemMock).not.toHaveBeenCalled()
    })

    it('should save and focus on cell in next row after editing cell', async () => {
      renderTable(2)

      await userEvent.keyboard('{enter}')
      await userEvent.keyboard('new title{enter}')
      expect(getUpdatedValue()).toBe('Cell 1new title')
      await expectCellToHaveFocus('Title', 1)
    })

    it('should save and focus on omnibar after editing cell in last row', async () => {
      renderTable(2)

      await clickCell('Title', 1)
      await userEvent.keyboard('{enter}')
      await userEvent.keyboard('new title{enter}')
      expect(getUpdatedValue()).toBe('Cell 2new title')

      await expectOmnibarToHaveFocus()
    })

    it('should save and focus on cell in next column after editing when pressing Tab', async () => {
      renderTable(2)

      await userEvent.keyboard('{enter}')
      await userEvent.keyboard('new title')
      await userEvent.tab()

      expect(getUpdatedValue()).toBe('Cell 1new title')
      await expectCellToHaveFocus('Assignees', 0)
    })

    it('should save and focus on cell in previous column when pressing Shift+Tab', async () => {
      renderTableWithRows(2, [
        systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
        systemColumnFactory.title().build(),
      ])

      await clickCell('Title', 0)

      await userEvent.keyboard('{enter}')
      await userEvent.keyboard('new title')
      await userEvent.tab({shift: true})

      expect(getUpdatedValue()).toBe('Cell 1new title')
      await expectCellToHaveFocus('Status', 0)
    })
  })
})
