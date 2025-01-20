import {act, render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {Resources} from '../../../client/strings'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../mocks/hooks/use-repositories'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupTableView} from '../../test-app-wrapper'

jest.mock('../../../client/hooks/use-enabled-features')

describe('Table View', () => {
  beforeEach(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: false})
  })

  it('should render a memex item', () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Explore performance issues').build()],
    })
    render(<Table />)

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByText('Explore performance issues')).toBeInTheDocument()
  })
})

describe('column options menu', () => {
  const defaultColumns = [
    systemColumnFactory.title().build(),
    systemColumnFactory.status({optionNames: ['todo', 'in progress', 'done']}).build(),
    systemColumnFactory.labels().build(),
    systemColumnFactory.assignees().build(),
    systemColumnFactory.repository().build(),
  ]

  it('column options menu trigger should be visible with or without focus', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    const labelOptionsTrigger = screen.getByLabelText('Labels column options')
    expect(labelOptionsTrigger).toBeVisible()

    await userEvent.click(screen.getByLabelText('Filter by keyword or by field'))
    act(() => labelOptionsTrigger.focus())

    expect(labelOptionsTrigger).toHaveFocus()
    expect(labelOptionsTrigger).toBeVisible()

    await userEvent.tab()

    expect(screen.getByLabelText('Assignees column options')).toHaveFocus()
  })

  it('should be in the tab order', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    const filterInput = screen.getByLabelText('Filter by keyword or by field')
    await userEvent.click(filterInput)
    expect(filterInput).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByLabelText('Title column options')).toHaveFocus()
  })

  it('column options menu receives focus again after using menu', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    const statusOptions = screen.getByLabelText('Status column options')
    act(() => statusOptions.focus())
    expect(statusOptions).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(statusOptions).not.toHaveFocus()
    expect(screen.getByRole('menuitem', {name: Resources.tableHeaderContextMenu.selectColumn})).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(statusOptions).toHaveFocus()
  })

  it('has menu semantics and menuitems inside', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    await userEvent.click(screen.getByLabelText('Status column options'))
    const menuItems = await within(screen.getByRole('menu')).findAllByRole('menuitem')
    const menuItemLabels = menuItems.map(item => item.textContent)
    expect(menuItemLabels).toEqual([
      Resources.tableHeaderContextMenu.selectColumn,
      Resources.tableHeaderContextMenu.sortAscending,
      Resources.tableHeaderContextMenu.sortDescending,
      Resources.tableHeaderContextMenu.filterValues,
      Resources.tableHeaderContextMenu.groupByValues,
      Resources.tableHeaderContextMenu.sliceByValues,
      Resources.tableHeaderContextMenu.hideField,
    ])
  })

  it('can enable sorting', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    expect(screen.queryByTestId('sorted-label-Status')).not.toBeInTheDocument()
    const statusOptions = screen.getByLabelText('Status column options')
    await userEvent.click(statusOptions)
    await userEvent.click(screen.getByRole('menuitem', {name: Resources.sortSingleSelectAscending}))
    expect(screen.getByTestId('sorted-label-Status')).toBeVisible()
  })

  it('can enable grouping', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    expect(screen.queryByTestId('grouped-label-Status')).not.toBeInTheDocument()
    const statusOptions = screen.getByLabelText('Status column options')
    await userEvent.click(statusOptions)
    await userEvent.click(screen.getByRole('menuitem', {name: Resources.tableHeaderContextMenu.groupByValues}))
    expect(screen.getByTestId('grouped-label-Status')).toBeVisible()
  })

  it('can enable slicing', async () => {
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    expect(screen.queryByTestId('sliced-label-Status')).not.toBeInTheDocument()
    const statusOptions = screen.getByLabelText('Status column options')
    await userEvent.click(statusOptions)
    await userEvent.click(screen.getByRole('menuitem', {name: Resources.tableHeaderContextMenu.sliceByValues}))
    expect(screen.getByTestId('slicer-panel')).toBeVisible()
    expect(screen.getByTestId('slicer-panel-title').title).toBe('Status')
    expect(screen.getByTestId('sliced-label-Status')).toBeVisible()
  })

  it('can enable slicing when memex_table_without_limits is enabled', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({memex_table_without_limits: true})
    const {Table} = setupTableView({
      items: [draftIssueFactory.withTitleColumnValue('Improve accessibility').build()],
      columns: defaultColumns,
    })
    render(<Table />)

    expect(screen.queryByTestId('sliced-label-Status')).not.toBeInTheDocument()
    const statusOptions = screen.getByLabelText('Status column options')
    await userEvent.click(statusOptions)
    await userEvent.click(screen.getByRole('menuitem', {name: Resources.tableHeaderContextMenu.sliceByValues}))
    expect(screen.getByTestId('slicer-panel')).toBeVisible()
    expect(screen.getByTestId('slicer-panel-title').title).toBe('Status')
    expect(screen.getByTestId('sliced-label-Status')).toBeVisible()
  })
})
