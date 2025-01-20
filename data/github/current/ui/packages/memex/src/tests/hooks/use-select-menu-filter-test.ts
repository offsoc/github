import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {ItemType} from '../../client/api/memex-items/item-type'
import {isFetchSuggestionsEnabled} from '../../client/hooks/common/use-select-menu-filter'

describe('isFetchSuggestionsEnabled', () => {
  it('labels and milestones are not supported on draft issues', () => {
    expect(isFetchSuggestionsEnabled(ItemType.DraftIssue, SystemColumnId.Labels)).toBe(false)
    expect(isFetchSuggestionsEnabled(ItemType.DraftIssue, SystemColumnId.Milestone)).toBe(false)
  })

  it('assignees are supported on draft issues', () => {
    expect(isFetchSuggestionsEnabled(ItemType.DraftIssue, SystemColumnId.Assignees)).toBe(true)
  })

  it('all suggestions are supported on Issues and PullRequests', () => {
    const itemTypes = [ItemType.Issue, ItemType.PullRequest]

    for (const itemType of itemTypes) {
      expect(isFetchSuggestionsEnabled(itemType, SystemColumnId.Assignees)).toBe(true)
      expect(isFetchSuggestionsEnabled(itemType, SystemColumnId.Labels)).toBe(true)
      expect(isFetchSuggestionsEnabled(itemType, SystemColumnId.Milestone)).toBe(true)
    }
  })
})
