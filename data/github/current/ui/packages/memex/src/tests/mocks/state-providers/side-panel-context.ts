import {ItemType} from '../../../client/api/memex-items/item-type'
import type {SidePanelContextValue} from '../../../client/hooks/use-side-panel'

export function createSidePanelContext(mocks?: Partial<SidePanelContextValue>): SidePanelContextValue {
  const supportedItemTypes = new Set<ItemType>([ItemType.DraftIssue, ItemType.Issue])
  return {
    openProjectItemInPane: jest.fn(),
    reloadPaneItem: jest.fn(),
    openPaneInfo: jest.fn(),
    openPaneBulkAdd: jest.fn(),
    closePane: jest.fn(),
    hasUnsavedChanges: false,
    dirtyItems: new Set(),
    setDirtyItems: jest.fn(),
    isPaneOpened: false,
    supportedItemTypes,
    sidePanelState: null,
    openPaneHistoryItem: jest.fn(),
    openPaneHierarchyHistoryItem: jest.fn(),
    pinned: false,
    setPinned: jest.fn(),
    pinButtonRef: {current: null},
    initialFocusRef: {current: null},
    containerRef: {current: null},
    ...mocks,
  }
}
