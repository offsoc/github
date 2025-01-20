import {MemexColumnDataType} from '../client/api/columns/contracts/memex-column'
import {ItemType} from '../client/api/memex-items/item-type'
import {columnEditable} from '../client/helpers/column-editable'

describe('ColumnEditable', () => {
  describe('Redacted items', () => {
    it('returns false for any column', () => {
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Assignees)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Date)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Iteration)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Labels)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.LinkedPullRequests)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Milestone)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Number)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Repository)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Reviewers)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.SingleSelect)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Text)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.Title)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.IssueType)).toBe(false)
      expect(columnEditable(ItemType.RedactedItem, MemexColumnDataType.ParentIssue)).toBe(false)
    })
  })

  describe('Draft items', () => {
    it('editable types', () => {
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Assignees)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Date)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Iteration)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Labels)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Milestone)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Number)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Repository)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.SingleSelect)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Text)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Title)).toBe(true)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.IssueType)).toBe(true)
    })

    it('non-editable types', () => {
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.LinkedPullRequests)).toBe(false)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.Reviewers)).toBe(false)
      expect(columnEditable(ItemType.DraftIssue, MemexColumnDataType.ParentIssue)).toBe(false)
    })
  })

  describe('Issues and Pull Requests', () => {
    it('editable types', () => {
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Assignees)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Date)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Iteration)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Labels)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Milestone)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Number)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.SingleSelect)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Text)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Title)).toBe(true)
      // Issue type column is editable for issues, but not for pull requests
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.IssueType)).toBe(true)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.ParentIssue)).toBe(true)
    })

    it('non-editable types', () => {
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.LinkedPullRequests)).toBe(false)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Repository)).toBe(false)
      expect(columnEditable(ItemType.Issue, MemexColumnDataType.Reviewers)).toBe(false)
      // Issue type column is editable for issues, but not for pull requests
      expect(columnEditable(ItemType.PullRequest, MemexColumnDataType.IssueType)).toBe(false)
      expect(columnEditable(ItemType.PullRequest, MemexColumnDataType.ParentIssue)).toBe(false)
    })
  })
})
