import {noop} from '@github-ui/noop'
import {act, render, renderHook, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useEffect} from 'react'
import invariant from 'tiny-invariant'

import {State} from '../../../client/api/common-contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {SidePanelItem} from '../../../client/api/memex-items/side-panel-item'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {type MemexItemSidePanelState, useSidePanel} from '../../../client/hooks/use-side-panel'
import {getQueryDataForSidePanelItemNotOnClientFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {createMockDraftIssue} from '../../../mocks/data/issues'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubGetItem} from '../../mocks/api/memex-items'
import {setupEnvironment} from './side-panel-test-helpers'

jest.mock('../../../client/api/stats/api-post-stats')

// Mock use-paginated-memex-items-query dependencies
jest.mock('../../../client/hooks/use-views', () => {
  const originalModule = jest.requireActual('../../../client/hooks/use-views')
  return {
    __esModule: true,
    ...originalModule,
    useViews: () => ({currentView: undefined}),
  }
})
jest.mock('../../../client/hooks/use-sorted-by', () => ({
  useSortedBy: () => ({sorts: []}),
}))
jest.mock('../../../client/features/grouping/hooks/use-horizontal-grouped-by', () => ({
  useHorizontalGroupedBy: () => ({groupedByColumnId: undefined}),
}))
jest.mock('../../../client/features/grouping/hooks/use-vertical-grouped-by', () => ({
  useVerticalGroupedBy: () => ({groupedByColumnId: undefined}),
}))
jest.mock('../../../client/features/slicing/hooks/use-slice-by', () => ({
  useSliceBy: () => ({sliceField: undefined}),
}))

const getMockProjectItem = (id: number): SidePanelItem => ({
  id,
  contentType: ItemType.Issue,
  isHierarchy: false,
  isDraft: () => false,
  itemId: () => id,
  getItemNumber: () => id,
  getState: () => State.Open,
  ownerId: () => 1,
  hierarchyEntry: () => ({
    itemId: id,
    ownerId: 1,
  }),
  getItemIdentifier: () => ({
    number: id,
    repo: '',
    owner: '',
  }),
  getUrl: () => '',
  getHtmlTitle: () => '',
  getRawTitle: () => '',
  getSuggestionsCacheKey: () => '',
  getLabels: () => [],
  getAssignees: () => [],
  getRepositoryName: () => '',
  getLinkedPullRequests: () => [],
  getIssueType: () => undefined,
  getMilestone: () => undefined,
  getExtendedRepository: () => undefined,
  getCompletion: () => undefined,
  getTrackedBy: () => undefined,
  getStatus: () => undefined,
  getCustomField: () => undefined,
})

describe('useSidePanel', () => {
  it('has no active item by default', () => {
    const {result} = renderHook(useSidePanel, {wrapper: setupEnvironment().wrapper})

    expect(result.current.sidePanelState).toBeNull()
  })

  describe('focus', () => {
    const Wrapper = setupEnvironment().wrapper
    const TestComponent = () => {
      const {initialFocusRef, openProjectItemInPane} = useSidePanel()

      useEffect(() => {
        openProjectItemInPane(getMockProjectItem(1))
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      const openNewItem = () => {
        openProjectItemInPane(getMockProjectItem(99))
      }

      return (
        <>
          <button ref={initialFocusRef}>I want focus</button>
          <button onClick={openNewItem}>Open new item</button>
        </>
      )
    }

    it('focuses the chosen element on render', async () => {
      render(
        <Wrapper>
          <TestComponent />
        </Wrapper>,
      )

      const focusButton = screen.getByText('I want focus')
      expect(focusButton).not.toHaveFocus()

      await waitFor(() => expect(focusButton).toHaveFocus())
    })

    it('focuses the chosen element when changing items', async () => {
      render(
        <Wrapper>
          <TestComponent />
        </Wrapper>,
      )

      const focusButton = screen.getByText('I want focus')
      await waitFor(() => expect(focusButton).toHaveFocus())

      await userEvent.tab()

      expect(focusButton).not.toHaveFocus()

      await userEvent.click(screen.getByText('Open new item'))

      await waitFor(() => expect(focusButton).toHaveFocus())
    })
  })

  it('is closed by default', () => {
    const {result} = renderHook(useSidePanel, {wrapper: setupEnvironment().wrapper})

    expect(result.current.isPaneOpened).toBe(false)
  })

  it('has active draft item when pane is opened', async () => {
    const environment = setupEnvironment()
    const {result} = renderHook(useSidePanel, {wrapper: environment.wrapper})
    const item = environment.itemModels.find(model => model.contentType === ItemType.DraftIssue)!

    act(() => {
      result.current.openProjectItemInPane(item, noop)
    })
    expect(result.current.isPaneOpened).toEqual(true)
    await waitFor(() => expect((result.current.sidePanelState as MemexItemSidePanelState).item?.id).toEqual(item.id))
  })

  it('has active issue item when pane is opened', async () => {
    const environment = setupEnvironment()
    const {result} = renderHook(useSidePanel, {wrapper: environment.wrapper})
    const item = environment.itemModels.find(model => model.contentType === ItemType.Issue)!

    act(() => {
      result.current.openProjectItemInPane(item, noop)
    })
    expect(result.current.isPaneOpened).toEqual(true)
    await waitFor(() => expect((result.current.sidePanelState as MemexItemSidePanelState).item?.id).toEqual(item.id))
  })

  it('is opened after calling openPaneInfo', () => {
    const {result} = renderHook(useSidePanel, {wrapper: setupEnvironment().wrapper})

    act(() => {
      result.current.openPaneInfo()
    })

    expect(result.current.isPaneOpened).toEqual(true)
  })

  it('clears active item when pane is closed', async () => {
    stubResolvedApiResponse(apiPostStats, {success: true})

    const {wrapper, itemModels} = setupEnvironment()
    const {result} = renderHook(useSidePanel, {wrapper})

    const item = itemModels.find(i => i.contentType === 'DraftIssue')
    invariant(item != null)
    const onClose = jest.fn()
    stubGetItem(item)

    act(() => {
      result.current.openProjectItemInPane(item, () => onClose())
    })
    await act(() => result.current.closePane())

    expect(result.current.sidePanelState).toBeNull()
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it('is closed after calling close', async () => {
    const {wrapper, itemModels} = setupEnvironment()
    const {result} = renderHook(useSidePanel, {wrapper})

    const item = itemModels.find(i => i.contentType === 'DraftIssue')
    invariant(item != null)
    const onClose = jest.fn()
    stubGetItem(item)

    act(() => {
      result.current.openProjectItemInPane(item, () => onClose())
    })
    await act(() => result.current.closePane())

    expect(result.current.isPaneOpened).toEqual(false)
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  describe('when memex_table_without_limits is enabled', () => {
    it('does not set queryData for side panel if item is already loaded on client', async () => {
      const {wrapper, itemModels, queryClient} = setupEnvironment(undefined, undefined, {
        'memex-enabled-features': ['memex_table_without_limits'],
      })

      const {result} = renderHook(useSidePanel, {wrapper})

      const item = itemModels.find(i => i.contentType === 'DraftIssue')
      invariant(item != null)
      stubGetItem(item)
      act(() => {
        result.current.openProjectItemInPane(item)
      })

      await waitFor(() => {
        expect((result.current.sidePanelState as MemexItemSidePanelState).item?.id).toEqual(item.id)
      })

      const queryData = getQueryDataForSidePanelItemNotOnClientFromQueryClient(queryClient, item.id.toString())
      expect(queryData).toBeUndefined()
    })

    it('does set queryData for side panel if item is not loaded on client', async () => {
      const {wrapper, queryClient} = setupEnvironment(undefined, undefined, {
        'memex-enabled-features': ['memex_table_without_limits'],
      })

      const {result} = renderHook(useSidePanel, {wrapper})

      const newDraft = createMockDraftIssue({
        title: {
          raw: 'A Draft',
          html: 'A Draft',
        },

        priority: 0,
        status: 'Ready',
        stage: 'Up Next',
        impact: 'Medium',
      })
      stubGetItem(newDraft)
      act(() => {
        result.current.openProjectItemInPane(newDraft as unknown as SidePanelItem)
      })

      await waitFor(() => {
        const queryData = getQueryDataForSidePanelItemNotOnClientFromQueryClient(queryClient, newDraft.id.toString())
        expect(queryData?.id).toEqual(newDraft.id)
      })
    })
  })
})
