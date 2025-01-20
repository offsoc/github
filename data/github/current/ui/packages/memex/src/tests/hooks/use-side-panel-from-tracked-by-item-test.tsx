import {act, renderHook} from '@testing-library/react'
import type {MouseEvent} from 'react'

import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import {HierarchySidePanelItem} from '../../client/api/memex-items/hierarchy'
import {useSidePanelFromTrackedByItem} from '../../client/hooks/use-side-panel-from-tracked-by-item'
import type {MemexItemModel} from '../../client/models/memex-item-model'
import {DefaultTrackedByIssue} from '../../mocks/memex-items'
import {ComplexFeatureTrackedItem} from '../../mocks/memex-items/tracked-issues'
import {createMemexItemModel} from '../mocks/models/memex-item-model'
import {createTrackedByItemsContext} from '../mocks/state-providers/memex-items-tracked-by-context'
import {createSidePanelContext} from '../mocks/state-providers/side-panel-context'
import {createWrapperWithContexts} from '../wrapper-utils'

function mockMemexItemModelMethods(trackedByItem: TrackedByItem = ComplexFeatureTrackedItem): Partial<MemexItemModel> {
  return {
    getTrackedBy: jest.fn().mockReturnValue([]),
    getRepositoryName: jest.fn().mockReturnValue(trackedByItem.repoName),
    getRawTitle: jest.fn().mockReturnValue(trackedByItem.title),
    getHtmlTitle: jest.fn().mockReturnValue(trackedByItem.title),
    getUrl: jest.fn().mockReturnValue(trackedByItem.url),
    getState: jest.fn().mockReturnValue(trackedByItem.state),
    getItemNumber: jest.fn().mockReturnValue(trackedByItem.number),
    getAssignees: jest.fn().mockReturnValue(trackedByItem.assignees),
    getLabels: jest.fn().mockReturnValue(trackedByItem.labels),
  }
}

function mockHierarchySidePanelItem(trackedByItem: TrackedByItem = ComplexFeatureTrackedItem) {
  return new HierarchySidePanelItem(
    {
      key: {
        issueId: trackedByItem.key.itemId,
        repoId: trackedByItem.repoId,
      },
      title: trackedByItem.title,
      url: trackedByItem.url,
      state: trackedByItem.state,
      repoName: trackedByItem.repoName,
      number: trackedByItem.number,
      assignees: trackedByItem.assignees,
      labels: trackedByItem.labels,
      completion: trackedByItem.completion,
    },
    {completed: 0, total: 0, percent: 0},
  )
}

describe('useSidePanelFromTrackedByItem', () => {
  it('should open the side panel with a tracked by item which also exists in the project', () => {
    const openProjectItemInPaneStub = jest.fn()
    const openPaneHierarchyHistoryItemStub = jest.fn()
    const preventDefaultStub = jest.fn()

    const eventMock = {
      preventDefault: preventDefaultStub,
    } as unknown as MouseEvent<HTMLElement>

    const memexItemModel = createMemexItemModel(
      {
        ...DefaultTrackedByIssue,
        id: ComplexFeatureTrackedItem.key.itemId,
        content: {...DefaultTrackedByIssue.content, id: ComplexFeatureTrackedItem.key.itemId},
      },
      mockMemexItemModelMethods(),
    )

    const {result} = renderHook(useSidePanelFromTrackedByItem, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext({
          openProjectItemInPane: openProjectItemInPaneStub,
          openPaneHierarchyHistoryItem: openPaneHierarchyHistoryItemStub,
        }),
        TrackedByItems: createTrackedByItemsContext(),
        QueryClient: {memexItems: [memexItemModel]},
      }),
    })

    act(() => {
      result.current.createSidePanelHandler(ComplexFeatureTrackedItem)(eventMock)
    })

    expect(preventDefaultStub).toHaveBeenCalledTimes(1)
    expect(openPaneHierarchyHistoryItemStub).not.toHaveBeenCalled()
    expect(openProjectItemInPaneStub).toHaveBeenCalledTimes(1)
    expect(openProjectItemInPaneStub).toHaveBeenCalledWith(memexItemModel)
  })

  it('should open the side panel with a tracked by item which does not exist in the project', () => {
    const openProjectItemInPaneStub = jest.fn()
    const openPaneHierarchyHistoryItemStub = jest.fn()
    const preventDefaultStub = jest.fn()
    const getAllProjectRelationshipsStub = jest
      .fn()
      .mockReturnValue(new Map([[ComplexFeatureTrackedItem.key.itemId, [DefaultTrackedByIssue.id]]]))

    const eventMock = {
      preventDefault: preventDefaultStub,
    } as unknown as MouseEvent<HTMLElement>

    const childMemexItemModel = createMemexItemModel(DefaultTrackedByIssue, mockMemexItemModelMethods())

    const {result} = renderHook(useSidePanelFromTrackedByItem, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext({
          openProjectItemInPane: openProjectItemInPaneStub,
          openPaneHierarchyHistoryItem: openPaneHierarchyHistoryItemStub,
        }),
        TrackedByItems: createTrackedByItemsContext({
          getAllProjectRelationships: getAllProjectRelationshipsStub,
        }),
        QueryClient: {memexItems: [childMemexItemModel]},
      }),
    })

    act(() => {
      result.current.createSidePanelHandler(ComplexFeatureTrackedItem)(eventMock)
    })

    const parentItem = mockHierarchySidePanelItem()

    expect(preventDefaultStub).toHaveBeenCalledTimes(1)
    expect(openProjectItemInPaneStub).toHaveBeenCalledTimes(1)
    expect(openProjectItemInPaneStub).toHaveBeenCalledWith(childMemexItemModel)
    expect(openPaneHierarchyHistoryItemStub).toHaveBeenCalledTimes(1)
    expect(openPaneHierarchyHistoryItemStub).toHaveBeenCalledWith({item: parentItem})
  })
})
