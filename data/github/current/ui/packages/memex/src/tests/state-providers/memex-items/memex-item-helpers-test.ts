import type {RemoteUpdatePayload} from '../../../client/api/columns/contracts/domain'
import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {IssueOrPullRequestContent, ItemContent} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {IssueModel} from '../../../client/models/memex-item-model'
import {
  buildMemexItemUpdateData,
  convertToMemexColumnData,
  isIssueOrPullRequestContent,
  isValidDraftItemColumn,
} from '../../../client/state-providers/memex-items/memex-item-helpers'
import {getUser} from '../../../mocks/data/users'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'

describe('memex item helpers', () => {
  describe('isValidDraftItemColumn', () => {
    it('returns truthy for a user defined column', () => {
      expect(isValidDraftItemColumn(1)).toBeTruthy()
    })

    it.each([SystemColumnId.Title, SystemColumnId.Status])('returns truthy for the %s system column', columnId => {
      expect(isValidDraftItemColumn(columnId)).toBeTruthy()
    })

    it('returns truthy for the Assignees system column only if draft assignments are enabled', () => {
      expect(isValidDraftItemColumn(SystemColumnId.Assignees)).toBeTruthy()
    })

    it('returns falsy for other system defined columns', () => {
      const systemColumns = [
        SystemColumnId.Labels,
        SystemColumnId.Milestone,
        SystemColumnId.LinkedPullRequests,
        SystemColumnId.Repository,
        SystemColumnId.Reviewers,
        SystemColumnId.Tracks,
        SystemColumnId.IssueType,
        SystemColumnId.ParentIssue,
      ]

      for (const columnId of systemColumns) {
        expect(isValidDraftItemColumn(columnId)).toBeFalsy()
      }
    })
  })

  describe('isIssueOrPullRequestContent', () => {
    it.each([
      {content: {}, desc: 'containing an empty object'},
      {content: {id: 3}, desc: 'containing only the content "id" property'},
      {
        content: {url: 'https://github.com/github/memex/issues/336'},
        desc: 'containing only the content "url" property',
      },
    ])('should return falsy with invalid content $desc for an Issue or PullRequest', ({content}) => {
      expect(isIssueOrPullRequestContent(content as ItemContent)).toBeFalsy()
    })

    it('should return truthy with valid content for an Issue or PullRequest', () => {
      expect(
        isIssueOrPullRequestContent({
          id: 3,
          url: 'https://github.com/github/memex/issues/336',
          body: '',
          createdAt: '',
          user: getUser('camchenry'),
        } as IssueOrPullRequestContent),
      ).toBeTruthy()
    })
  })

  describe('buildMemexItemUpdateData', () => {
    it('filters out milestones for draft issues', () => {
      const contentType = ItemType.DraftIssue
      const memexProjectColumnValues: Array<RemoteUpdatePayload> = [
        {memexProjectColumnId: SystemColumnId.Milestone, value: 1},
      ]
      const previousMemexProjectItemId = ''
      const result = buildMemexItemUpdateData(contentType, memexProjectColumnValues, previousMemexProjectItemId)
      expect(result).toMatchObject({memexProjectColumnValues: []})
    })

    it('does not filter out assignees if the feature flag is enabled', () => {
      const contentType = ItemType.DraftIssue
      const memexProjectColumnValues: Array<RemoteUpdatePayload> = [
        {memexProjectColumnId: SystemColumnId.Assignees, value: [1]},
      ]
      const previousMemexProjectItemId = ''
      const result = buildMemexItemUpdateData(contentType, memexProjectColumnValues, previousMemexProjectItemId)
      expect(result).toMatchObject({
        memexProjectColumnValues: [{memexProjectColumnId: SystemColumnId.Assignees, value: [1]}],
      })
    })

    it('filters out labels for draft issues', () => {
      const contentType = ItemType.DraftIssue
      const memexProjectColumnValues: Array<RemoteUpdatePayload> = [
        {memexProjectColumnId: SystemColumnId.Labels, value: [1, 2]},
      ]
      const previousMemexProjectItemId = ''
      const result = buildMemexItemUpdateData(contentType, memexProjectColumnValues, previousMemexProjectItemId)
      expect(result).toMatchObject({memexProjectColumnValues: []})
    })

    it('allows status column type for draft issues', () => {
      const contentType = ItemType.DraftIssue
      const update: RemoteUpdatePayload = {memexProjectColumnId: SystemColumnId.Status, value: '123'}
      const previousMemexProjectItemId = ''
      const result = buildMemexItemUpdateData(contentType, [update], previousMemexProjectItemId)
      expect(result).toMatchObject({memexProjectColumnValues: [update]})
    })

    it('allows title updates for draft issues', () => {
      const contentType = ItemType.DraftIssue
      const update: RemoteUpdatePayload = {memexProjectColumnId: SystemColumnId.Title, value: {title: 'Hello world'}}
      const previousMemexProjectItemId = ''
      const result = buildMemexItemUpdateData(contentType, [update], previousMemexProjectItemId)
      expect(result).toMatchObject({memexProjectColumnValues: [update]})
    })

    it('allows custom field updates for draft issues', () => {
      const contentType = ItemType.DraftIssue
      const update: RemoteUpdatePayload = {memexProjectColumnId: 12, value: 12}
      const previousMemexProjectItemId = ''
      const result = buildMemexItemUpdateData(contentType, [update], previousMemexProjectItemId)
      expect(result).toMatchObject({memexProjectColumnValues: [update]})
    })
  })

  describe('convertToMemexColumnData', () => {
    it('converts a column model "ColumnData" to "MemexColumnData"', () => {
      const model = new IssueModel(DefaultOpenIssue)

      const expected = DefaultOpenIssue.memexProjectColumnValues
      const result = convertToMemexColumnData(model)

      // `convertToMemexColumnData` cannot guarantee the column position due to `ColumnData`
      // As a result we validate that the arrays are equal in length and values irrespective of position.
      expect(result).toHaveLength(expected.length)
      expect(result).toEqual(expect.arrayContaining(expected))
    })

    it('should ignore columns with invalid column id', () => {
      const model = createMemexItemModel(DefaultOpenIssue, {columns: {NaN: {value: null} as any}})
      expect(convertToMemexColumnData(model)).toHaveLength(0)
    })
  })
})
