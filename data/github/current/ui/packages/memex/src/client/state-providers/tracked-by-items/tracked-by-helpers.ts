import type {ItemTrackedByParent, TrackedByItem} from '../../api/issues-graph/contracts'
import {HierarchySidePanelItem} from '../../api/memex-items/hierarchy'
import type {HistoryItem} from '../../hooks/use-side-panel'

const defaultCompletion = {completed: 0, total: 0, percent: 0}

export function createHierarchySidePanelHistoryItem(
  item: (ItemTrackedByParent & {titleHtml?: string}) | undefined,
): HistoryItem {
  if (!item) return {}

  const {repositoryId, itemId, title, url, state, stateReason, repositoryName, displayNumber, assignees, labels} = item
  const itemKey = {repoId: repositoryId, issueId: itemId}
  return {
    item: new HierarchySidePanelItem(
      {
        key: itemKey,
        title,
        url,
        state,
        stateReason,
        repoName: repositoryName,
        number: displayNumber,
        assignees,
        labels,
      },
      defaultCompletion,
    ),
  }
}

export function createItemTrackedByParent(item: TrackedByItem): ItemTrackedByParent {
  const {title, state, stateReason, url, number, repoId, repoName, userName, assignees, labels, trackedByTitle} = item
  return {
    ownerId: item.key.ownerId,
    uuid: item.key.primaryKey.uuid,
    itemId: item.key.itemId,
    title,
    state,
    stateReason,
    url,
    displayNumber: number,
    repositoryId: repoId,
    repositoryName: repoName,
    ownerLogin: userName,
    assignees,
    labels,
    position: 0,
    trackedByTitle,
  }
}

export function createTrackedByItem(item: ItemTrackedByParent): TrackedByItem {
  return {
    key: {
      ownerId: item.ownerId,
      itemId: item.itemId,
      primaryKey: {
        uuid: item.uuid,
      },
    },
    title: item.title,
    url: item.url,
    state: item.state,
    repoName: item.repositoryName,
    repoId: item.repositoryId,
    userName: item.ownerLogin,
    number: item.displayNumber,
    labels: item.labels,
    assignees: item.assignees,
    stateReason: item.stateReason,
  }
}
