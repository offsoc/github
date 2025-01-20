import {act, render, screen, waitFor} from '@testing-library/react'

import type {NumericValue} from '../../../client/api/columns/contracts/number'
import type {EnrichedText} from '../../../client/api/columns/contracts/text'
import type {Label, User} from '../../../client/api/common-contracts'
import type {ItemCompletion} from '../../../client/api/issues-graph/contracts'
import {SidePanelSidebar} from '../../../client/components/side-panel/sidebar'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useVisibleFields} from '../../../client/hooks/use-visible-fields'
import {type ColumnModel, createColumnModel} from '../../../client/models/column-model'
import {createMemexItemModel, type DraftIssueModel, type IssueModel} from '../../../client/models/memex-item-model'
import {useAllColumns} from '../../../client/state-providers/columns/use-all-columns'
import {useIssueContext} from '../../../client/state-providers/issues/use-issue-context'
import {useConvertToIssue} from '../../../client/state-providers/memex-items/use-convert-to-issue'
import {
  assigneesColumn,
  autoFillColumnServerProps,
  customDateColumn,
  customIterationColumn,
  customNumberColumn,
  CustomNumberColumnId,
  customSingleSelectColumn,
  customTextColumn,
  CustomTextColumnId,
  labelsColumn,
  trackedByColumn,
  tracksColumn,
} from '../../../mocks/data/columns'
import {
  DefaultClosedIssue,
  DefaultDraftIssue,
  DefaultOpenIssue,
  DefaultOpenIssueWithStatusNoLabels,
  DefaultOpenSidePanelMetadata,
  IssueWithAFixedAssignee,
  IssueWithDueDate,
  IssueWithoutDueDate,
} from '../../../mocks/memex-items'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupEnvironment} from './side-panel-test-helpers'

jest.mock('../../../client/hooks/use-visible-fields')
jest.mock('../../../client/hooks/use-enabled-features')
jest.mock('../../../client/state-providers/columns/use-all-columns')
jest.mock('../../../client/state-providers/memex-items/use-convert-to-issue')
jest.mock('../../../client/state-providers/issues/use-issue-context')
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams(), jest.fn()]
    }),
  }
})

function waitForSidebarToSettle() {
  return act(() => new Promise(resolve => setTimeout(resolve, 350)))
}

describe('SidePanelSidebar', () => {
  beforeEach(() => {
    // since we mock this hook's module out with
    // jest.mock('state-providers/memex-items/use-convert-to-issue')
    // we need to at least mock the hook, otherwise this suite
    // will fail unless it is run in conjunction with the other suite in this
    // test module.
    asMockHook(useConvertToIssue).mockReturnValue({
      convertToIssue: jest.fn(),
    })

    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
  })
  it('renders assignees without a value set', async () => {
    const columns = autoFillColumnServerProps([{...assigneesColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({
      sidePanelMetadata: {
        ...DefaultOpenSidePanelMetadata,
        assignees: [],
      },
    })

    const {wrapper} = setupEnvironment(columns, [DefaultDraftIssue])
    const item = createMemexItemModel(DefaultDraftIssue) as DraftIssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Assignees')
    expect(sidebarField.textContent).toContain('Assignees')
    expect(sidebarField.textContent).toContain('No Assignees')
    await waitForSidebarToSettle()
  })

  it('renders assignees with a value set', async () => {
    const columns = autoFillColumnServerProps([{...assigneesColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({
      sidePanelMetadata: {
        ...DefaultOpenSidePanelMetadata,
        assignees: DefaultOpenIssue.memexProjectColumnValues.find(c => c.memexProjectColumnId === assigneesColumn.id)!
          .value as Array<User>,
      },
    })

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const itemAssignees = item.columns.Assignees as Array<User>
    const sidebarField = screen.getByTestId('sidebar-field-Assignees')

    expect(sidebarField.textContent).toContain('Assignees')
    await waitFor(() => expect(sidebarField.textContent).toContain(itemAssignees[0].login))
    await waitForSidebarToSettle()
  })

  it('renders text field without a value set', async () => {
    const columns = autoFillColumnServerProps([{...customTextColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [IssueWithAFixedAssignee])
    const item = createMemexItemModel(IssueWithAFixedAssignee) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Custom Text')
    expect(sidebarField.textContent).toContain('Custom Text')
    expect(sidebarField.textContent).toContain('No Custom Text')
    await waitForSidebarToSettle()
  })

  it('renders text field with a value set', async () => {
    const columns = autoFillColumnServerProps([{...customTextColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const itemTextField = item.columns[CustomTextColumnId] as EnrichedText

    const sidebarField = screen.getByTestId('sidebar-field-Custom Text')
    expect(sidebarField.textContent).toContain('Custom Text')
    await waitFor(() => expect(sidebarField.textContent).toContain(itemTextField.raw))
    await waitForSidebarToSettle()
  })

  it('renders date field without a value set', async () => {
    const columns = autoFillColumnServerProps([{...customDateColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [IssueWithoutDueDate])
    const item = createMemexItemModel(IssueWithoutDueDate) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Due Date')
    expect(sidebarField.textContent).toContain('Due Date')
    expect(sidebarField.textContent).toContain('No Due Date')
    await waitForSidebarToSettle()
  })

  it('renders date field with a value set', async () => {
    const columns = autoFillColumnServerProps([{...customDateColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [IssueWithDueDate])
    const item = createMemexItemModel(IssueWithDueDate) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Due Date')
    expect(sidebarField.textContent).toContain('Due Date')
    await waitFor(() => expect(sidebarField.textContent).toContain('Apr 23, 2021'))
    await waitForSidebarToSettle()
  })

  it('renders number field without a value set', async () => {
    const columns = autoFillColumnServerProps([{...customNumberColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [IssueWithAFixedAssignee])
    const item = createMemexItemModel(IssueWithAFixedAssignee) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Estimate')
    expect(sidebarField.textContent).toContain('Estimate')
    expect(sidebarField.textContent).toContain('No Estimate')
    await waitForSidebarToSettle()
  })

  it('renders number field with a value set', async () => {
    const columns = autoFillColumnServerProps([{...customNumberColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [DefaultClosedIssue])
    const item = createMemexItemModel(DefaultClosedIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const itemNumberField = item.columns[CustomNumberColumnId] as NumericValue
    const sidebarField = screen.getByTestId('sidebar-field-Estimate')
    expect(sidebarField.textContent).toContain('Estimate')
    await waitFor(() => expect(sidebarField.textContent).toContain(itemNumberField.value.toString()))
    await waitForSidebarToSettle()
  })

  it('renders single select field without a value set', async () => {
    const columns = autoFillColumnServerProps([{...customSingleSelectColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Aardvarks')
    expect(sidebarField.textContent).toContain('Aardvarks')
    expect(sidebarField.textContent).toContain('No Aardvarks')
    await waitForSidebarToSettle()
  })

  it('renders iteration field without a value set', async () => {
    const columns = autoFillColumnServerProps([{...customIterationColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Iteration')
    expect(sidebarField.textContent).toContain('Iteration')
    expect(sidebarField.textContent).toContain('No Iteration')
    await waitForSidebarToSettle()
  })

  it('renders labels field without a value set', async () => {
    const columns = autoFillColumnServerProps([{...labelsColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({
      sidePanelMetadata: {
        ...DefaultOpenSidePanelMetadata,
        labels: [],
      },
    })

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssueWithStatusNoLabels])
    const item = createMemexItemModel(DefaultOpenIssueWithStatusNoLabels) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Labels')
    expect(sidebarField.textContent).toContain('Labels')
    expect(sidebarField.textContent).toContain('No Labels')
    await waitForSidebarToSettle()
  })

  it('renders labels field with a value set', async () => {
    const columns = autoFillColumnServerProps([{...labelsColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({
      sidePanelMetadata: {
        ...DefaultOpenSidePanelMetadata,
        labels: DefaultOpenIssue.memexProjectColumnValues.find(c => c.memexProjectColumnId === labelsColumn.id)!
          .value as Array<Label>,
      },
    })

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.getByTestId('sidebar-field-Labels')
    expect(sidebarField.textContent).toContain('Labels')
    await waitFor(() => expect(sidebarField.textContent).toContain('enhancement ✨'))
    await waitForSidebarToSettle()
  })

  it('should not render tracks field', async () => {
    const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
    const completion = DefaultOpenIssue.memexProjectColumnValues.find(c => c.memexProjectColumnId === tracksColumn.id)!
      .value as ItemCompletion
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({
      sidePanelMetadata: {
        ...DefaultOpenSidePanelMetadata,
        completion,
      },
    })

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.queryByTestId('sidebar-field-Tracks')
    expect(sidebarField).not.toBeInTheDocument()
    await waitForSidebarToSettle()
  })

  it('should not render tracked by field', async () => {
    const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
    asMockHook(useAllColumns).mockReturnValue({allColumns: columns as Array<ColumnModel>})
    asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
    asMockHook(useIssueContext).mockReturnValue({
      sidePanelMetadata: {
        ...DefaultOpenSidePanelMetadata,
      },
    })

    const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

    render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

    const sidebarField = screen.queryByTestId('sidebar-field-Tracked by')
    expect(sidebarField).not.toBeInTheDocument()
    await waitForSidebarToSettle()
  })
})
