import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {forwardRef} from 'react'

import {Role} from '../../../client/api/common-contracts'
import type {DraftIssue} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {useUpdateAndReorderItem, useUpdateItem} from '../../../client/hooks/use-update-item'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {useFetchSuggestedAssignees} from '../../../client/state-providers/suggestions/use-fetch-suggested-assignees'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {mockSelectPanel} from '../../mocks/components/select-panel-component'
import {asMockComponent, asMockHook} from '../../mocks/stub-utilities'
import {setupTableView} from '../../test-app-wrapper'
import {
  enterFilterText,
  expectAddNewItemButtonToHaveFocus,
  expectClearFilterQueryButtonToHaveFocus,
  expectFilterInputToHaveFocus,
  expectRevertChangesButtonToHaveFocus,
  findClearFilterQueryButton,
  findRevertChangesButton,
  findSaveChangesButton,
} from '../project-view/project-view-test-helper'
import {
  buildRows,
  clickCell,
  clickOmnibar,
  expectCellToHaveFocus,
  expectColumnMenuButtonToHaveFocus,
  expectGroupCollapseButtonToHaveFocus,
  expectGroupMenuButtonToHaveFocus,
  expectOmnibarToHaveFocus,
  expectRowMenuButtonToHaveFocus,
  focusColumnMenuButton,
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
 * Without mocking this hook, we won't render rows from groups outside of the first group
 */
jest.mock('../../../client/components/board/hooks/use-is-visible', () => ({
  ...jest.requireActual('../../../client/components/board/hooks/use-is-visible'),
  __esModule: true,
  default: () => ({
    isVisible: true,
    size: 40,
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

// Forgo debounced update to query parameters when typing in the filter bar, which currently falls outside of the focus
// for this test. Using jest.useFakeTimers and jest.advanceTimersByTime does not work well when rendered inside of the AppContext,
// which involves many timer interactions.
jest.mock('lodash-es/debounce', () =>
  jest.fn(fn => {
    fn.cancel = jest.fn()
    fn.flush = jest.fn()
    return fn
  }),
)

describe('table view tab navigation', () => {
  function renderTableWithTitleAndStatus(itemsCount: number) {
    const columns = [
      systemColumnFactory.title().build(),
      systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
    ]

    renderTableWithRows(itemsCount, columns)
  }

  function renderGroupedTable(itemsCount: number) {
    const statusField = systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build()

    const items: Array<DraftIssue> = []
    const columns = [systemColumnFactory.title().build(), statusField]

    for (let i = 0; i < itemsCount; i++) {
      const memexProjectColumnValues = [
        columnValueFactory.title(`Cell ${items.length + 1}`, ItemType.DraftIssue).build(),
        columnValueFactory.status(i % 2 === 0 ? 'Todo' : 'Done', columns).build(),
      ]

      items.push(
        draftIssueFactory.build({
          memexProjectColumnValues,
        }),
      )
    }

    const {Table} = setupTableView({
      items,
      columns,
      viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
      views: [
        viewFactory
          .table()
          .withDefaultColumnsAsVisibleFields(columns)
          .build({
            groupBy: [statusField.databaseId],
          }),
      ],
    })
    render(<Table />)

    return {statusField}
  }

  beforeAll(() => {
    asMockComponent(SelectPanel).mockImplementation(mockSelectPanel())
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useRepositories).mockReturnValue({suggestRepositories: jest.fn()})
    asMockHook(useUpdateItem).mockReturnValue({updateItem: jest.fn()})
    asMockHook(useUpdateAndReorderItem).mockReturnValue({updateAndReorderItem: jest.fn()})
    asMockHook(useFetchSuggestedAssignees).mockReturnValue({fetchSuggestedAssignees: jest.fn()})
  })

  it('tab focuses next cell', async () => {
    renderTableWithTitleAndStatus(2)

    await expectCellToHaveFocus('Title', 0)

    await userEvent.tab()

    await expectCellToHaveFocus('Status', 0)
  })

  it('shift+tab focuses previous cell in row', async () => {
    renderTableWithTitleAndStatus(2)

    await clickCell('Status', 0)
    await expectCellToHaveFocus('Status', 0)

    await userEvent.tab({shift: true})

    await expectCellToHaveFocus('Title', 0)
  })

  it('tab focuses first cell in next row when focused on last cell of a row (wrapping behavior) after focusing row menu button', async () => {
    renderTableWithTitleAndStatus(2)

    await clickCell('Status', 0)
    await expectCellToHaveFocus('Status', 0)

    await userEvent.tab()
    await expectRowMenuButtonToHaveFocus(1)

    await userEvent.tab()
    await expectCellToHaveFocus('Title', 1)
  })

  it('shift+tab focuses last cell in previous row when focused on first cell of a row (wrapping behavior) after focusing row menu button', async () => {
    renderTableWithTitleAndStatus(2)

    await clickCell('Title', 1)
    await expectCellToHaveFocus('Title', 1)

    await userEvent.tab({shift: true})
    await expectRowMenuButtonToHaveFocus(1)

    await userEvent.tab({shift: true})
    await expectCellToHaveFocus('Status', 0)
  })

  it('tab focuses omnibar focused on last cell of last row', async () => {
    renderTableWithTitleAndStatus(2)

    await clickCell('Status', 1)
    await expectCellToHaveFocus('Status', 1)

    await userEvent.tab()
    await expectAddNewItemButtonToHaveFocus()

    await userEvent.tab()
    await expectOmnibarToHaveFocus()
  })

  it('shift+tab focuses last cell of last row when omnibar is focused', async () => {
    renderTableWithTitleAndStatus(2)

    await clickOmnibar()
    await expectOmnibarToHaveFocus()

    await userEvent.tab({shift: true})
    await expectAddNewItemButtonToHaveFocus()

    await userEvent.tab({shift: true})
    await expectCellToHaveFocus('Status', 1)
  })

  it('tab focuses first cell in next group when focused on group omnibar', async () => {
    renderGroupedTable(2)
    await clickOmnibar('Todo')
    await expectOmnibarToHaveFocus('Todo')

    await userEvent.tab()
    await expectGroupCollapseButtonToHaveFocus('Done')

    await userEvent.tab()
    await expectGroupMenuButtonToHaveFocus('Done')

    await userEvent.tab()
    await expectRowMenuButtonToHaveFocus(1)

    await userEvent.tab()
    await expectCellToHaveFocus('Title', 1)
  })

  it('shift+tab focuses omnibar in previous group when focused on first cell of group', async () => {
    renderGroupedTable(2)

    await clickCell('Title', 1)
    await expectCellToHaveFocus('Title', 1)

    await userEvent.tab({shift: true})
    await expectRowMenuButtonToHaveFocus(1)

    await userEvent.tab({shift: true})
    await expectGroupMenuButtonToHaveFocus('Done')

    await userEvent.tab({shift: true})
    await expectGroupCollapseButtonToHaveFocus('Done')

    await userEvent.tab({shift: true})
    await expectOmnibarToHaveFocus('Todo')
  })

  it('starting from the first cell, shift+tab navigates to first row menu button', async () => {
    renderTableWithTitleAndStatus(2)

    await expectCellToHaveFocus('Title', 0)

    await userEvent.tab({shift: true})
    await expectRowMenuButtonToHaveFocus(0)

    await userEvent.tab()
    await expectCellToHaveFocus('Title', 0)
  })

  it(`with active filter query, starting from the first column's menu button, shift+tab navigates to the clear filter button`, async () => {
    const columns = [
      systemColumnFactory.title().build(),
      systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
    ]

    const views = [viewFactory.table().withDefaultColumnsAsVisibleFields(columns).build({filter: 'is:draft'})]
    const items = buildRows(2)
    const {Table} = setupTableView({
      items,
      columns,
      viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
      views,
    })
    render(<Table />)

    await focusColumnMenuButton('Title')
    await expectColumnMenuButtonToHaveFocus('Title')

    await userEvent.tab({shift: true})
    await expectClearFilterQueryButtonToHaveFocus()

    await userEvent.tab()
    await expectColumnMenuButtonToHaveFocus('Title')
  })

  it('with active filter and dirty changes, starting from the clear filter button we can navigate to the revert changes button', async () => {
    renderTableWithTitleAndStatus(2)

    await expectCellToHaveFocus('Title', 0)
    await enterFilterText('Cell')
    await expectFilterInputToHaveFocus()

    const clearFilterQueryButton = await findClearFilterQueryButton()
    const revertChangesButton = await findRevertChangesButton()
    const saveChangesButton = await findSaveChangesButton()

    expect(clearFilterQueryButton).toBeVisible()
    expect(revertChangesButton).toBeVisible()
    expect(saveChangesButton).toBeVisible()

    await userEvent.tab()
    await expectClearFilterQueryButtonToHaveFocus()

    await userEvent.tab()
    await expectRevertChangesButtonToHaveFocus()
  })
})
