import {SystemColumnId} from '../client/api/columns/contracts/memex-column'
import type {MemexItem} from '../client/api/memex-items/contracts'
import {createMemexItemModel, getHovercardSubjectTag, type MemexItemModel} from '../client/models/memex-item-model'
import {
  DefaultDraftIssue,
  DefaultDraftIssueWithLabels,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
  DefaultRedactedItem,
  DraftIssueWithMultipleAssignees,
  DraftIssueWithMultipleLinkedPullRequests,
  DraftIssueWithMultipleReviewers,
  IssueWithLabels,
  IssueWithMultipleAssignees,
  IssueWithMultipleLinkedPullRequests,
  IssueWithMultipleReviewers,
  IssueWithParentIssue,
  IssueWithType,
  PullRequestWithLabels,
  PullRequestWithMultipleAssignees,
  PullRequestWithMultipleLinkedPullRequests,
  PullRequestWithMultipleReviewers,
} from '../mocks/memex-items'

describe('MemexItemModel', () => {
  describe('issues', () => {
    it('sets up initial observables', () => {
      const memexItemModel = createMemexItemModel(DefaultOpenIssue)

      expect(memexItemModel.id).toEqual(DefaultOpenIssue.id)
      expect(memexItemModel.contentType).toEqual(DefaultOpenIssue.contentType)
      expect(memexItemModel.content).toEqual(DefaultOpenIssue.content)
      expect(memexItemModel.priority).toEqual(DefaultOpenIssue.priority)

      expectColumns(memexItemModel, DefaultOpenIssue)
    })

    it('orders labels with localeCompare', () => {
      const memexItemModel = createMemexItemModel(IssueWithLabels)
      const labels = memexItemModel.getLabels().map(label => label.name)

      expect(labels).toEqual(['🏓 layout:table', 'bug', 'zebra'])
    })

    it('orders assignees with localeCompare', () => {
      const memexItemModel = createMemexItemModel(IssueWithMultipleAssignees)
      const assignees = memexItemModel.getAssignees().map(assignee => assignee.login)

      expect(assignees).toEqual(['first', 'second'])
    })

    it('orders reviewers with localeCompare', () => {
      const memexItemModel = createMemexItemModel(IssueWithMultipleReviewers)
      const reviewers = memexItemModel.getReviewers().map(reviewer => reviewer.reviewer.name)

      expect(reviewers).toEqual(['dmarcey', 'Memex Team 1'])
    })

    it('orders linkedPullRequests by their number', () => {
      const memexItemModel = createMemexItemModel(IssueWithMultipleLinkedPullRequests)
      const linkedPullRequests = memexItemModel.getLinkedPullRequests().map(pullRequest => pullRequest.number)

      expect(linkedPullRequests).toEqual([1, 123, 500])
    })

    it('returns issue type', () => {
      const memexItemModel = createMemexItemModel(IssueWithType)

      expect(memexItemModel.getIssueType()).toEqual({
        color: 'RED',
        name: 'Bug',
        id: 23,
        description: 'Report an unexpected problem or unintended behavior',
      })
    })

    it('returns parent issue', () => {
      const memexItemModel = createMemexItemModel(IssueWithParentIssue)
      expect(memexItemModel.getParentIssue()).toEqual({
        id: 71,
        number: 14,
        state: 'open',
        title: 'That Good Night',
        url: 'http://github.localhost:80/github/sriracha-4/issues/14',
      })
    })
  })

  describe('pull requests', () => {
    it('sets initial observables', () => {
      const memexItemModel = createMemexItemModel(DefaultOpenPullRequest)

      expect(memexItemModel.id).toEqual(DefaultOpenPullRequest.id)
      expect(memexItemModel.contentType).toEqual(DefaultOpenPullRequest.contentType)
      expect(memexItemModel.content).toEqual(DefaultOpenPullRequest.content)
      expect(memexItemModel.priority).toEqual(DefaultOpenPullRequest.priority)
      expectColumns(memexItemModel, DefaultOpenPullRequest)
    })

    it('orders labels with localeCompare', () => {
      const memexItemModel = createMemexItemModel(PullRequestWithLabels)
      const labels = memexItemModel.getLabels().map(label => label.name)

      expect(labels).toEqual(['🏓 layout:table', 'bug', 'zebra'])
    })

    it('orders assignees with localeCompare', () => {
      const memexItemModel = createMemexItemModel(PullRequestWithMultipleAssignees)
      const assignees = memexItemModel.getAssignees().map(assignee => assignee.login)

      expect(assignees).toEqual(['first', 'second'])
    })

    it('orders reviewers with localeCompare', () => {
      const memexItemModel = createMemexItemModel(PullRequestWithMultipleReviewers)
      const reviewers = memexItemModel.getReviewers().map(reviewer => reviewer.reviewer.name)

      expect(reviewers).toEqual(['dmarcey', 'Memex Team 1'])
    })

    it('orders linkedPullRequests by their number', () => {
      const memexItemModel = createMemexItemModel(PullRequestWithMultipleLinkedPullRequests)
      const linkedPullRequests = memexItemModel.getLinkedPullRequests().map(pullRequest => pullRequest.number)

      expect(linkedPullRequests).toEqual([1, 123, 500])
    })
  })

  describe('draft issues', () => {
    it('sets initial observables', () => {
      const memexItemModel = createMemexItemModel(DefaultDraftIssue)

      expect(memexItemModel.id).toEqual(DefaultDraftIssue.id)
      expect(memexItemModel.contentType).toEqual(DefaultDraftIssue.contentType)
      expect(memexItemModel.content).toEqual(DefaultDraftIssue.content)
      expect(memexItemModel.priority).toEqual(DefaultDraftIssue.priority)
      expectColumns(memexItemModel, DefaultDraftIssue)
    })

    it('orders labels with localeCompare', () => {
      const memexItemModel = createMemexItemModel(DefaultDraftIssueWithLabels)
      const labels = memexItemModel.getLabels().map(label => label.name)

      expect(labels).toEqual(['🏓 layout:table', 'bug', 'zebra'])
    })

    it('orders assignees with localeCompare', () => {
      const memexItemModel = createMemexItemModel(DraftIssueWithMultipleAssignees)
      const assignees = memexItemModel.getAssignees().map(assignee => assignee.login)

      expect(assignees).toEqual(['first', 'second'])
    })

    it('orders reviewers with localeCompare', () => {
      const memexItemModel = createMemexItemModel(DraftIssueWithMultipleReviewers)
      const reviewers = memexItemModel.getReviewers().map(reviewer => reviewer.reviewer.name)

      expect(reviewers).toEqual(['dmarcey', 'Memex Team 1'])
    })

    it('orders linkedPullRequests by their number', () => {
      const memexItemModel = createMemexItemModel(DraftIssueWithMultipleLinkedPullRequests)
      const linkedPullRequests = memexItemModel.getLinkedPullRequests().map(pullRequest => pullRequest.number)

      expect(linkedPullRequests).toEqual([1, 123, 500])
    })
  })

  describe('whileSkippingLiveUpdates', () => {
    it('sets skippingLiveUpdates while in the callback', async () => {
      const memexItemModel = createMemexItemModel(DefaultOpenIssue)
      expect(memexItemModel.skippingLiveUpdates).toBeFalsy()

      await memexItemModel.whileSkippingLiveUpdates(() => {
        expect(memexItemModel.skippingLiveUpdates).toBeTruthy()
        return Promise.resolve()
      })
    })

    it('clears skippingLiveUpdates after exiting callback', async () => {
      const memexItemModel = createMemexItemModel(DefaultOpenIssue)
      expect(memexItemModel.skippingLiveUpdates).toBeFalsy()

      await memexItemModel.whileSkippingLiveUpdates(() => {
        expect(memexItemModel.skippingLiveUpdates).toBeTruthy()
        return Promise.resolve()
      })
      expect(memexItemModel.skippingLiveUpdates).toBeFalsy()
    })

    it('clears skippingLiveUpdate if callback errors', async () => {
      const memexItemModel = createMemexItemModel(DefaultOpenIssue)
      expect(memexItemModel.skippingLiveUpdates).toBeFalsy()

      try {
        await memexItemModel.whileSkippingLiveUpdates(() => {
          expect(memexItemModel.skippingLiveUpdates).toBeTruthy()
          throw new Error('test error')
        })
      } catch (e) {
        // don't need to do anything
      }
      expect(memexItemModel.skippingLiveUpdates).toBeFalsy()
    })
  })

  describe('getHovercardSubjectTag', () => {
    it('builds correct tag for issues', () => {
      const memexItemModel = createMemexItemModel(DefaultOpenIssue)
      const expected = `issue:${DefaultOpenIssue.content.id}`
      expect(getHovercardSubjectTag(memexItemModel)).toEqual(expected)
    })

    it('builds correct tag for pull requests', () => {
      const memexItemModel = createMemexItemModel(DefaultOpenPullRequest)
      const expected = `pull_request:${DefaultOpenPullRequest.content.id}`
      expect(getHovercardSubjectTag(memexItemModel)).toEqual(expected)
    })

    it('returns undefined for draft issues', () => {
      const memexItemModel = createMemexItemModel(DefaultDraftIssue)
      expect(getHovercardSubjectTag(memexItemModel)).toBeUndefined()
    })

    it('returns undefined for redacted items', () => {
      const memexItemModel = createMemexItemModel(DefaultRedactedItem)
      expect(getHovercardSubjectTag(memexItemModel)).toBeUndefined()
    })
  })

  describe('hierarchyEntry', () => {
    it('returns correct entry for issues', () => {
      const memexItemModel = createMemexItemModel(DefaultOpenIssue)
      expect(memexItemModel.hierarchyEntry()).toEqual({
        ownerId: memexItemModel.contentRepositoryId,
        itemId: memexItemModel.content.id,
      })
    })

    it('builds correct tag for pull requests', () => {
      const memexItemModel = createMemexItemModel(DefaultOpenPullRequest)
      expect(memexItemModel.hierarchyEntry()).toEqual({
        ownerId: memexItemModel.contentRepositoryId,
        itemId: memexItemModel.content.id,
      })
    })

    it('returns undefined for draft issues', () => {
      const memexItemModel = createMemexItemModel(DefaultDraftIssue)
      expect(memexItemModel.hierarchyEntry()).toEqual({
        ownerId: 0,
        itemId: memexItemModel.content.id,
      })
    })

    it('returns undefined for redacted items', () => {
      const memexItemModel = createMemexItemModel(DefaultRedactedItem)
      expect(memexItemModel.hierarchyEntry()).toEqual({
        ownerId: 0,
        itemId: -1,
      })
    })
  })
})

const expectColumns = (model: MemexItemModel, item: MemexItem) => {
  expect(Object.keys(model.columns).length).toBe(item.memexProjectColumnValues.length)
  for (const columnData of item.memexProjectColumnValues) {
    if (columnData.memexProjectColumnId === SystemColumnId.Title) {
      expect(model.columns[columnData.memexProjectColumnId]?.value).toStrictEqual(columnData.value ?? undefined)
    } else {
      expect(model.columns[columnData.memexProjectColumnId]).toStrictEqual(columnData.value ?? undefined)
    }
  }
}
