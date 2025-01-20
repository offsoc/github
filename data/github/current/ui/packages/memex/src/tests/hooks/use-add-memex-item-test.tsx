import {noop} from '@github-ui/noop'
import {act, renderHook} from '@testing-library/react'

import type {UpdateColumnValueAction} from '../../client/api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {allFeaturesDisabled, type EnabledFeaturesMap} from '../../client/api/enabled-features/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {
  type IFieldFilters,
  type ParsedFullTextQuery,
  parseTrimmedAndLowerCasedFilter,
} from '../../client/components/filter-bar/helpers/search-filter'
import {useSearch} from '../../client/components/filter-bar/search-context'
import useToasts from '../../client/components/toasts/use-toasts'
import {ViewType} from '../../client/helpers/view-type'
import {usePostStats} from '../../client/hooks/common/use-post-stats'
import {useAddMemexItem} from '../../client/hooks/use-add-memex-item'
import {useEnabledFeatures} from '../../client/hooks/use-enabled-features'
import {useSidePanel} from '../../client/hooks/use-side-panel'
import {DraftIssueModel, IssueModel} from '../../client/models/memex-item-model'
import {useUpdateItemColumnValue} from '../../client/state-providers/column-values/use-update-item-column-value'
import {useFindColumnByName} from '../../client/state-providers/columns/use-find-column-by-name'
import {usePaginatedMemexItemsQuery} from '../../client/state-providers/memex-items/queries/use-paginated-memex-items-query'
import {useRemoveParentIssues} from '../../client/state-providers/tracked-by-items/use-remove-parent-issues'
import {Resources} from '../../client/strings'
import {
  assigneesColumn,
  labelsColumn,
  milestoneColumn,
  repositoryColumn,
  statusColumn,
  titleColumn,
} from '../../mocks/data/columns'
import {mockSuggestedLabels} from '../../mocks/data/labels'
import {mockSuggestedMilestones} from '../../mocks/data/milestones'
import {mockRepos} from '../../mocks/data/repositories'
import {DefaultSuggestedRepositoryItems} from '../../mocks/data/suggestions'
import {mockSuggestedAssignees} from '../../mocks/data/users'
import {DefaultDraftIssue, DefaultOpenIssue} from '../../mocks/memex-items'
import {OldBugTrackedItem} from '../../mocks/memex-items/tracked-issues'
import {omit} from '../../utils/omit'
import {
  stubGetSuggestedAssignees,
  stubGetSuggestedAssigneesWithError,
  stubGetSuggestedLabels,
  stubGetSuggestedLabelsWithError,
  stubGetSuggestedMilestones,
  stubGetSuggestedMilestonesWithError,
} from '../mocks/api/memex-items'
import {
  createTrackedByItemsContext,
  createTrackedByItemsStableContext,
} from '../mocks/state-providers/memex-items-tracked-by-context'
import {createSuggestionsContext, createSuggestionsStableContext} from '../mocks/state-providers/suggestions-context'
import {asMockHook} from '../mocks/stub-utilities'
import {createWrapperWithContexts} from '../wrapper-utils'

jest.mock('../../client/components/filter-bar/search-context')
jest.mock('../../client/components/toasts/use-toasts')
jest.mock('../../client/hooks/use-enabled-features')
jest.mock('../../client/hooks/use-side-panel')
jest.mock('../../client/hooks/common/use-post-stats')
jest.mock('../../client/state-providers/memex-items/use-create-memex-item')
jest.mock('../../client/state-providers/columns/use-find-column-by-name')
jest.mock('../../client/state-providers/column-values/use-update-item-column-value')
jest.mock('../../client/state-providers/tracked-by-items/use-remove-parent-issues')
jest.mock('../../client/state-providers/memex-items/queries/use-paginated-memex-items-query')

interface SetupProps {
  addToast?: jest.Mock
  findColumnByName?: jest.Mock
  onAddItem?: jest.Mock
  onAddDraftItem?: jest.Mock
  matchesSearchQuery?: jest.Mock
  setChildParentRelationship?: jest.Mock
  fieldFilters?: ParsedFullTextQuery['fieldFilters']
  transientQuery?: ParsedFullTextQuery & {normalisedQuery: string}
  enabledFeatures?: Partial<EnabledFeaturesMap>
  updateActions?: Array<UpdateColumnValueAction>
  hasNextPage?: boolean
}

function setupAndRender({
  addToast = jest.fn(),
  findColumnByName = jest.fn(),
  onAddItem = jest.fn(),
  onAddDraftItem = jest.fn(),
  matchesSearchQuery = jest.fn().mockReturnValue(true),
  setChildParentRelationship = jest.fn(),
  fieldFilters = [],
  transientQuery = parseTrimmedAndLowerCasedFilter(''),
  enabledFeatures = {},
  updateActions = undefined,
  hasNextPage = false,
}: SetupProps = {}) {
  asMockHook(useToasts).mockReturnValue({
    addToast,
  })

  asMockHook(useEnabledFeatures).mockReturnValue({...allFeaturesDisabled, ...enabledFeatures})

  asMockHook(usePostStats).mockReturnValue({
    postStats: jest.fn(),
  })

  const openProjectItemInPane = jest.fn()
  asMockHook(useSidePanel).mockReturnValue({
    openProjectItemInPane,
    supportedItemTypes: new Set([ItemType.DraftIssue, ItemType.Issue]),
  })

  asMockHook(useFindColumnByName).mockReturnValue({
    findColumnByName,
  })

  asMockHook(useSearch).mockReturnValue({
    fieldFilters,
    transientQuery,
    matchesSearchQuery,
  })

  const updateMultipleSequentially = jest.fn().mockResolvedValue(undefined)
  asMockHook(useUpdateItemColumnValue).mockReturnValue({
    updateMultipleSequentially,
  })

  asMockHook(useRemoveParentIssues).mockReturnValue({
    setChildParentRelationship,
  })

  asMockHook(usePaginatedMemexItemsQuery).mockReturnValue({hasNextPage, data: []})

  const onSave = jest.fn()
  const {result} = renderHook(() => useAddMemexItem({onAddItem, onAddDraftItem, onSave, updateActions}), {
    wrapper: createWrapperWithContexts({
      Suggestions: createSuggestionsContext(),
      SuggestionsStable: createSuggestionsStableContext(),
      TrackedByItemsStable: createTrackedByItemsStableContext(),
      TrackedByItems: createTrackedByItemsContext(),
      ProjectNumber: {projectNumber: 1},
      QueryClient: {},
      ViewType: {viewType: ViewType.Table, isViewTypeDirty: false, setViewType: noop},
    }),
  })

  return {
    addToast,
    findColumnByName,
    updateMultipleSequentially,
    result,
    onAddItem,
    onAddDraftItem,
    onSave,
    openProjectItemInPane,
  }
}

describe('useAddMemexItem', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create item', () => {
    it.each([
      {
        columnId: SystemColumnId.Assignees,
        fieldFilters: new Array<IFieldFilters>(['assignee', ['traumverloren']]),
        column: assigneesColumn,
      },
      {
        columnId: SystemColumnId.Labels,
        fieldFilters: new Array<IFieldFilters>(['label', ['enhancement ✨']]),
        column: labelsColumn,
      },
      {
        columnId: SystemColumnId.Milestone,
        fieldFilters: new Array<IFieldFilters>(['milestone', ['Sprint 9']]),
        column: milestoneColumn,
      },
    ])(
      `should display a warning due the user lacking permissions to assign $columnId`,
      async ({fieldFilters, column}) => {
        stubGetSuggestedAssigneesWithError(new Error('User does not have permission to assign user'))
        stubGetSuggestedLabelsWithError(new Error('User does not have permission to assign label'))
        stubGetSuggestedMilestonesWithError(new Error('User does not have permission to assign milestone'))

        const {result, addToast, onAddItem, onAddDraftItem, onSave} = setupAndRender({
          findColumnByName: jest.fn().mockReturnValue(column),
          onAddItem: jest.fn(() => Promise.resolve(new IssueModel(DefaultOpenIssue))),
          fieldFilters,
        })

        const [MEMEX_REPO] = mockRepos
        const [, ISSUE_ITEM] = DefaultSuggestedRepositoryItems

        await act(async () => await result.current({...ISSUE_ITEM, repositoryId: MEMEX_REPO.id}))

        expect(onAddItem).toHaveBeenCalledTimes(1)
        expect(onAddDraftItem).toHaveBeenCalledTimes(0)
        expect(onSave).toHaveBeenCalledTimes(1)
        expect(addToast).toHaveBeenCalledTimes(1)
        expect(addToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'warning',
            message: Resources.newItemFilterWarning,
          }),
        )
      },
    )

    const ASSIGNEE = mockSuggestedAssignees[0]
    const LABEL = mockSuggestedLabels[0]
    const MILESTONE = mockSuggestedMilestones[0]
    const MILESTONE_TITLE = MILESTONE.title.toLocaleLowerCase()

    it.each([
      {
        fieldFilters: new Array<IFieldFilters>(['assignee', [ASSIGNEE.login]]),
        dataType: MemexColumnDataType.Assignees,
        column: assigneesColumn,
        expectedColumnValue: [omit(ASSIGNEE, ['selected'])],
      },
      {
        fieldFilters: new Array<IFieldFilters>(['label', [LABEL.name]]),

        dataType: MemexColumnDataType.Labels,
        column: labelsColumn,
        expectedColumnValue: [omit(LABEL, ['selected'])],
      },
      {
        fieldFilters: new Array<IFieldFilters>(['milestone', [MILESTONE_TITLE]]),

        dataType: MemexColumnDataType.Milestone,
        column: milestoneColumn,
        expectedColumnValue: omit(MILESTONE, ['selected']),
      },
    ])(
      `builds filter result of type $dataType and applies an update to the created item`,
      async ({fieldFilters, dataType, column, expectedColumnValue}) => {
        const model = new IssueModel(DefaultOpenIssue)

        const {result, updateMultipleSequentially} = setupAndRender({
          findColumnByName: jest.fn().mockReturnValue(column),
          onAddItem: jest.fn(() => Promise.resolve(model)),
          fieldFilters,
        })

        stubGetSuggestedAssignees(mockSuggestedAssignees)
        stubGetSuggestedLabels(mockSuggestedLabels)
        stubGetSuggestedMilestones(mockSuggestedMilestones)

        const [MEMEX_REPO] = mockRepos
        const [, ISSUE_ITEM] = DefaultSuggestedRepositoryItems

        await act(async () => await result.current({...ISSUE_ITEM, repositoryId: MEMEX_REPO.id}))

        expect(updateMultipleSequentially).toHaveBeenCalledWith(model, [{dataType, value: expectedColumnValue}])
      },
    )

    it.each([
      {field: 'repository', filterValue: 'github/memex', getColumnMockValue: repositoryColumn},
      {field: 'title', filterValue: 'Fix this `issue` please!', getColumnMockValue: titleColumn},
      {field: 'status', filterValue: 'Backlog', getColumnMockValue: statusColumn},
    ])(
      'should not attempt to get permissions (call to suggestions) for the non repository "$field" field',
      async ({field, filterValue, getColumnMockValue}) => {
        const getSuggestedAssignees = stubGetSuggestedAssignees([])
        const getSuggestedLabels = stubGetSuggestedLabels([])
        const getSuggestedMilestones = stubGetSuggestedMilestones([])

        const {result, addToast} = setupAndRender({
          findColumnByName: jest.fn().mockReturnValue(getColumnMockValue),
          fieldFilters: [[field, [filterValue]]],
          onAddItem: jest.fn(() => Promise.resolve(new IssueModel(DefaultOpenIssue))),
        })

        const [MEMEX_REPO] = mockRepos
        const [, ISSUE_ITEM] = DefaultSuggestedRepositoryItems

        await act(async () => await result.current({...ISSUE_ITEM, repositoryId: MEMEX_REPO.id}))

        expect(getSuggestedAssignees).not.toHaveBeenCalled()
        expect(getSuggestedLabels).not.toHaveBeenCalled()
        expect(getSuggestedMilestones).not.toHaveBeenCalled()
        expect(addToast).not.toHaveBeenCalled()
      },
    )
  })

  describe('create draft item', () => {
    it('should create a draft item', async () => {
      const {result, onAddDraftItem, onAddItem, onSave} = setupAndRender({
        onAddDraftItem: jest.fn(() => Promise.resolve(new DraftIssueModel(DefaultDraftIssue))),
      })

      await act(async () => await result.current('a draft issue'))

      expect(onAddItem).toHaveBeenCalledTimes(0)
      expect(onAddDraftItem).toHaveBeenCalledTimes(1)
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    it('attempts to create draft issues with unsupported column values from filters', async () => {
      const {result, onAddDraftItem} = setupAndRender({
        onAddDraftItem: jest.fn(() => Promise.resolve(new DraftIssueModel(DefaultDraftIssue))),
        fieldFilters: new Array<IFieldFilters>(['milestone', ['a', 'b', 'c']], ['tracked-by', ['github/memex#123']]),
        findColumnByName: jest.fn().mockReturnValue(milestoneColumn),
      })

      await act(async () => await result.current('a draft issue'))

      const args = onAddDraftItem.mock.calls[0]
      expect(args[1]).toHaveLength(0)
      expect(args[2]).toHaveLength(0)
    })
  })

  describe('create an item that is not visible', () => {
    it('shows a toast when creating an item that is hidden in the view due to the filter', async () => {
      const {result, onAddDraftItem, addToast} = setupAndRender({
        onAddDraftItem: jest.fn(() => Promise.resolve(new DraftIssueModel(DefaultDraftIssue))),
        matchesSearchQuery: jest.fn().mockReturnValue(false),
      })

      await act(async () => await result.current('a draft issue'))

      expect(onAddDraftItem).toHaveBeenCalledTimes(1)
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: Resources.newItemFilterWarning,
        }),
      )
    })

    it('shows an action on the toast to open the item', async () => {
      const {result, onAddDraftItem, addToast, openProjectItemInPane} = setupAndRender({
        onAddDraftItem: jest.fn(() => Promise.resolve(new DraftIssueModel(DefaultDraftIssue))),
        matchesSearchQuery: jest.fn().mockReturnValue(false),
      })

      await act(async () => await result.current('a draft issue'))

      expect(onAddDraftItem).toHaveBeenCalledTimes(1)
      expect(addToast).toHaveBeenCalledWith({
        type: 'warning',
        message: Resources.newItemFilterWarning,
        action: {
          text: Resources.viewItem,
          handleClick: expect.any(Function),
        },
      })

      const {
        action: {handleClick},
      } = addToast.mock.calls[0][0]
      handleClick()
      expect(openProjectItemInPane).toHaveBeenCalled()
    })

    it('shows a toast when we add the item because we have more data on the server', async () => {
      const {result, onAddDraftItem, addToast, openProjectItemInPane} = setupAndRender({
        onAddDraftItem: jest.fn(() => Promise.resolve(new DraftIssueModel(DefaultDraftIssue))),
        hasNextPage: true,
        enabledFeatures: {memex_table_without_limits: true},
      })

      await act(async () => await result.current('a draft issue'))

      expect(onAddDraftItem).toHaveBeenCalledTimes(1)
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: Resources.newItemAddedToBottomOfTable,
          action: {
            text: Resources.viewItem,
            handleClick: expect.any(Function),
          },
        }),
      )

      const {
        action: {handleClick},
      } = addToast.mock.calls[0][0]
      handleClick()
      expect(openProjectItemInPane).toHaveBeenCalled()
    })
  })

  it('posts a draft issue with tracked by values when adding an issue link', async () => {
    const {result, onAddDraftItem} = setupAndRender({
      onAddDraftItem: jest.fn(() => Promise.resolve(new DraftIssueModel(DefaultDraftIssue))),
      updateActions: [
        {
          dataType: MemexColumnDataType.TrackedBy,
          value: [OldBugTrackedItem],
          appendOnly: true,
        },
      ],
    })

    await act(async () => await result.current('https://github.com/github/github/issues/3'))

    const args = onAddDraftItem.mock.calls[0]
    expect(args[1]).toHaveLength(1)
    expect(args[2]).toHaveLength(1)
  })

  describe('tracked by relationship', () => {
    it('should invoke "setChildParentRelationship" when tracked by features are enabled', async () => {
      const model = new IssueModel(DefaultOpenIssue)

      const setChildParentRelationship = jest.fn()
      const {result} = setupAndRender({
        onAddItem: jest.fn(() => Promise.resolve(model)),
        setChildParentRelationship,
        enabledFeatures: {tasklist_block: true},
      })

      const [MEMEX_REPO] = mockRepos
      const [, ISSUE_ITEM] = DefaultSuggestedRepositoryItems

      await act(async () => await result.current({...ISSUE_ITEM, repositoryId: MEMEX_REPO.id}))

      expect(setChildParentRelationship).toHaveBeenCalledTimes(1)
      expect(setChildParentRelationship).toHaveBeenCalledWith(model.content.id)
    })

    it('should "NOT" invoke "setChildParentRelationship" when tracked by features are disabled', async () => {
      const model = new IssueModel(DefaultOpenIssue)

      const setChildParentRelationship = jest.fn()
      const {result} = setupAndRender({
        onAddItem: jest.fn(() => Promise.resolve(model)),
        setChildParentRelationship,
        enabledFeatures: {tasklist_block: false},
      })

      const [MEMEX_REPO] = mockRepos
      const [, ISSUE_ITEM] = DefaultSuggestedRepositoryItems

      await act(async () => await result.current({...ISSUE_ITEM, repositoryId: MEMEX_REPO.id}))

      expect(setChildParentRelationship).not.toHaveBeenCalled()
    })
  })
})
