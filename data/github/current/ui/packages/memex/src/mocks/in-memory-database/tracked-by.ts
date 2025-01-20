import {IssueState} from '../../client/api/common-contracts'
import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import {deepCopy} from './utils'

type Parameters = Pick<TrackedByItem, 'userName' | 'repoName' | 'number'>

export class TrackedByCollection {
  private trackedByItems: Array<TrackedByItem>

  constructor(trackedByItems: Array<TrackedByItem> = []) {
    this.trackedByItems = deepCopy(trackedByItems)
  }

  public byShorthand({userName, repoName, number}: Parameters): TrackedByItem {
    const item = this.trackedByItems.find(
      r => r.userName === userName && r.repoName === repoName && r.number === number,
    )
    if (!item) throw new Error('Tracked By item not found')
    return item
  }

  public create({userName, repoName, number}: Parameters): TrackedByItem {
    const item = {
      key: {
        ownerId: 1,
        itemId: 5,
        primaryKey: {
          uuid: 'somethign',
        },
      },
      userName,
      repoName,
      repoId: 1111,
      number,
      title: 'A new item or something',
      state: IssueState.Open,
      url: 'https://github.com/',
      assignees: [],
      labels: [],
      completion: {total: 10, completed: 5, percent: 50},
    }

    this.trackedByItems.push(item)

    return item
  }

  public all() {
    return this.trackedByItems
  }
}
