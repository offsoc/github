import {act, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import {apiAddItem} from '../../../client/api/memex-items/api-add-item'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelSidebar} from '../../../client/components/side-panel/sidebar'
import {SidePanelSidebarActions} from '../../../client/components/side-panel/sidebar/sidebar-actions'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useVisibleFields} from '../../../client/hooks/use-visible-fields'
import {type ColumnModel, createColumnModel} from '../../../client/models/column-model'
import {createMemexItemModel, type DraftIssueModel, type IssueModel} from '../../../client/models/memex-item-model'
import {useAllColumns} from '../../../client/state-providers/columns/use-all-columns'
import {useIssueContext} from '../../../client/state-providers/issues/use-issue-context'
import {useConvertToIssue} from '../../../client/state-providers/memex-items/use-convert-to-issue'
import {assigneesColumn, autoFillColumnServerProps, labelsColumn, trackedByColumn} from '../../../mocks/data/columns'
import {getRepository} from '../../../mocks/data/repositories'
import {
  DefaultClosedIssue,
  DefaultDraftIssue,
  DefaultOpenIssue,
  DefaultOpenSidePanelMetadata,
  DraftIssueWithLimitedAssignee,
} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {generateConvertToIssueResponse} from '../../mocks/models/convert-to-issue'
import {asMockHook} from '../../mocks/stub-utilities'
import {MockHierarchySidePanelItemFactory, setupEnvironment} from './side-panel-test-helpers'

jest.mock('../../../client/api/memex-items/api-add-item')
jest.mock('../../../client/api/stats/api-post-stats')
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
let user: ReturnType<typeof userEvent.setup>

async function clickConvertToIssueButton() {
  const button = screen.getByText('Convert to issue', {exact: false})
  await user.click(button)
}

async function selectRepo(repoName: string) {
  const repoPicker = screen.getByTestId('repo-picker-repo-list')
  const memex = await waitFor(() => within(repoPicker).getByText(repoName))
  await user.click(memex)
}

async function waitForSidebarToSettle() {
  return act(() => new Promise(resolve => setTimeout(resolve, 350))) as Promise<void>
}

describe('SidePanelSidebarActions', () => {
  describe('Convert to issue button', () => {
    beforeEach(() => {
      user = userEvent.setup()

      // since we mock this hook's module out with
      // jest.mock('../../../client/state-providers/columns/use-all-columns')
      // we need to at least mock the hook, otherwise this suite
      // will fail unless it is run in conjunction with the other suite in this
      // test module.
      asMockHook(useAllColumns).mockReturnValue({allColumns: []})
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
          assignees: [],
        },
      })
    })

    it('convert to issue', async () => {
      const {wrapper} = setupEnvironment(undefined, undefined, {
        'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
      })
      let item: DraftIssueModel | IssueModel = createMemexItemModel(DefaultDraftIssue) as IssueModel

      const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})

      const convertToIssueStub = jest.fn().mockImplementationOnce((_, contentRepositoryId: number) => {
        const response = generateConvertToIssueResponse(DefaultDraftIssue, getRepository(contentRepositoryId))
        item = createMemexItemModel(response.memexProjectItem) as IssueModel
        return response
      })

      asMockHook(useConvertToIssue).mockReturnValue({
        convertToIssue: convertToIssueStub,
      })

      expect(item.contentType).toEqual('DraftIssue')

      render(<SidePanelSidebarActions item={item} />, {wrapper})

      await clickConvertToIssueButton()
      await selectRepo('memex')
      await waitForSidebarToSettle()

      await waitFor(() => expect(item.contentType).toEqual('Issue'))
      expect(postStatsStub).toHaveBeenCalledWith({
        payload: {
          memexProjectItemId: item.id,
          name: 'draft_convert',
          ui: 'side-panel',
        },
      })
    })

    it('convert to issue with limited access assignees', async () => {
      const {wrapper} = setupEnvironment(undefined, undefined, {
        'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
      })
      let item: DraftIssueModel | IssueModel = createMemexItemModel(DraftIssueWithLimitedAssignee) as DraftIssueModel

      const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})

      const convertToIssueStub = jest.fn().mockImplementationOnce((_, contentRepositoryId: number) => {
        const response = generateConvertToIssueResponse(
          DraftIssueWithLimitedAssignee,
          getRepository(contentRepositoryId),
        )
        item = createMemexItemModel(response.memexProjectItem) as IssueModel
        return response
      })

      asMockHook(useConvertToIssue).mockReturnValue({
        convertToIssue: convertToIssueStub,
      })

      expect(item.contentType).toEqual('DraftIssue')

      render(<SidePanelSidebarActions item={item} />, {wrapper})

      await clickConvertToIssueButton()
      await selectRepo('github')
      await waitForSidebarToSettle()

      await waitFor(() => expect(item.contentType).toEqual('Issue'))

      await waitFor(() => expect(postStatsStub).toHaveBeenCalledTimes(2))
      expect(postStatsStub).toHaveBeenCalledWith({
        payload: {
          memexProjectItemId: item.id,
          name: 'draft_convert',
          ui: 'side-panel',
        },
      })

      expect(postStatsStub).toHaveBeenCalledWith({
        payload: {
          memexProjectItemId: item.id,
          name: 'draft_convert_dropped_assignee',
          context: 1,
        },
      })
    })
  })

  describe('Copy link button', () => {
    it('copies link when Copy link button clicked for draft item', async () => {
      user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
      jest.useFakeTimers({doNotFake: ['queueMicrotask']})

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

      // draft items should not render the Copy link action
      expect(screen.queryByTestId('copy-link-action')).not.toBeInTheDocument()

      const action = screen.getByTestId('copy-in-project-link-action')
      expect(action.textContent).toContain('Copy link')
      await user.click(action)
      expect(action.textContent).toContain('Copied!')
      expect(await navigator.clipboard.readText()).toBe(window.location.href)

      act(() => {
        jest.runAllTimers()
      })

      expect(action.textContent).toContain('Copy link')
    })

    it('copies link when Copy link button clicked for issue item', async () => {
      user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
      jest.useFakeTimers({doNotFake: ['queueMicrotask']})

      const columns = autoFillColumnServerProps([{...labelsColumn, defaultColumn: true}])
      asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
      asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})
      asMockHook(useIssueContext).mockReturnValue({sidePanelMetadata: DefaultOpenSidePanelMetadata})

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
      const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

      render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

      // copy link action to copy actual issue url
      const action = screen.getByTestId('copy-link-action')
      expect(action.textContent).toContain('Copy link')
      await user.click(action)
      expect(action.textContent).toContain('Copied!')
      expect(await navigator.clipboard.readText()).toBe(item.getUrl())

      act(() => {
        jest.runAllTimers()
      })

      expect(action.textContent).toContain('Copy link')

      // copy in project link action to copy item deep link for memex
      const copyProjectLinkAction = screen.getByTestId('copy-in-project-link-action')
      expect(copyProjectLinkAction.textContent).toContain('Copy link in project')
      await user.click(copyProjectLinkAction)
      expect(copyProjectLinkAction.textContent).toContain('Copied!')
      expect(await navigator.clipboard.readText()).toBe(window.location.href)

      act(() => {
        jest.runAllTimers()
      })

      expect(copyProjectLinkAction.textContent).toContain('Copy link in project')
    })
  })

  describe('Add to project button', () => {
    beforeEach(() => {
      asMockHook(useAllColumns).mockReturnValue({allColumns: []})
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
        },
      })
    })

    it('does not show for draft issue', () => {
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
      asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})

      const {wrapper} = setupEnvironment(columns, [DefaultDraftIssue])
      const item = createMemexItemModel(DefaultDraftIssue) as DraftIssueModel

      render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

      expect(screen.queryByTestId('side-pane-add-to-project-action')).not.toBeInTheDocument()
    })

    it('does not show when the issue is already in project', () => {
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
      asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
      const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

      render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

      expect(screen.queryByTestId('side-pane-add-to-project-action')).not.toBeInTheDocument()
    })

    it('successfully adds issue item to project', async () => {
      user = userEvent.setup()
      jest.useRealTimers()
      const addItemStub = stubResolvedApiResponse(apiAddItem, {
        memexProjectItem: DefaultClosedIssue,
        memexProjectColumn: null,
      })
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
      asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})

      // Use DefaultClosedIssue as child issue of DefaultOpenIssue
      const childIssue = MockHierarchySidePanelItemFactory.build({
        itemId: () => DefaultClosedIssue.id,
      })
      const createData = {
        contentType: ItemType.DraftIssue,
        content: {title: childIssue.getUrl()},
      }
      const {wrapper} = setupEnvironment(undefined, [DefaultOpenIssue], {
        'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
      })
      render(<SidePanelSidebar item={childIssue} breakpoint={jest.fn()} />, {wrapper})

      const action = await screen.findByTestId('side-pane-add-to-project-action')
      expect(action).toBeInTheDocument()
      expect(action.textContent).toContain('Add to project')
      await user.click(action)

      expect(addItemStub).toHaveBeenCalledWith({
        memexProjectItem: createData,
      })
      expect(screen.queryByTestId('side-pane-add-to-project-action')).not.toBeInTheDocument()
    })
  })

  describe('"Delete from project" button', () => {
    beforeEach(() => {
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
        },
      })
    })

    it('does not show if does not exist in project', () => {
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
      asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})

      const childIssue = MockHierarchySidePanelItemFactory.build()
      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])
      render(<SidePanelSidebar item={childIssue} breakpoint={jest.fn()} />, {wrapper})

      expect(screen.queryByTestId('side-pane-delete-action')).not.toBeInTheDocument()
    })

    it('shows if exists in project', () => {
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useAllColumns).mockReturnValue({allColumns: columns.map(createColumnModel)})
      asMockHook(useVisibleFields).mockReturnValue({visibleFields: columns as Array<ColumnModel>})

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue], {
        'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
      })
      const item = createMemexItemModel(DefaultOpenIssue) as IssueModel

      render(<SidePanelSidebar item={item} breakpoint={jest.fn()} />, {wrapper})

      expect(screen.getByTestId('copy-in-project-link-action')).toBeInTheDocument()
      expect(screen.getByTestId('side-pane-delete-action')).toBeInTheDocument()
    })
  })
})
