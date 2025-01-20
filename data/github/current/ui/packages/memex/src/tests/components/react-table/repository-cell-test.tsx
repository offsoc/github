import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {useUpdateAndReorderItem} from '../../../client/hooks/use-update-item'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {issueFactory} from '../../factories/memex-items/issue-factory'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupTableView} from '../../test-app-wrapper'
import {clickCell, expectCellNotToHaveFocus, expectCellToHaveFocus, getCell} from './table-test-helper'

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

describe('Repository Cell', () => {
  const columns = [
    systemColumnFactory.title().build(),
    systemColumnFactory.repository().build(),
    systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
    systemColumnFactory.milestone().build(),
  ]

  function renderTable() {
    const items = [
      issueFactory.withTitleColumnValue('Cell 1').build(),
      draftIssueFactory.withTitleColumnValue('Cell 2').build(),
    ]
    const {Table} = setupTableView({
      items,
      columns,
      viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    })
    render(<Table />)
  }

  beforeAll(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
    asMockHook(useUpdateAndReorderItem).mockReturnValue({updateAndReorderItem: jest.fn()})
  })

  describe('Repository Cell', () => {
    describe('With Repo', () => {
      describe('With Mouse', () => {
        it('should focus on a cell when clicked', async () => {
          renderTable()

          await clickCell('Repository', 0)

          await expectCellToHaveFocus('Repository', 0)
        })

        it('should not enter editing mode when double clicked', async () => {
          renderTable()

          const cell = await getCell('Repository', 0)
          await userEvent.dblClick(cell)

          await expectCellToHaveFocus('Repository', 0)
        })

        it('should no longer be focused when another cell is clicked', async () => {
          renderTable()

          await clickCell('Repository', 0)
          await expectCellToHaveFocus('Repository', 0)

          await clickCell('Title', 1)
          await expectCellNotToHaveFocus('Repository', 0)
        })
      })

      describe('With Keyboard', () => {
        it('should not enter edit mode when pressing Enter', async () => {
          renderTable()

          await clickCell('Repository', 0)
          await userEvent.keyboard('{enter}')

          await expectCellToHaveFocus('Repository', 0)
        })

        it('should not enter edit mode when typing', async () => {
          renderTable()

          await clickCell('Repository', 0)
          await userEvent.keyboard('g')

          await expectCellToHaveFocus('Repository', 0)
        })
      })
    })
  })
})
