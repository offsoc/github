import {isEveryItemInColumn} from '../../../../client/components/board/hooks/use-board-card-actions'
import {buildNoValueVerticalGroup, buildVerticalGroupForOption} from '../../../../client/models/vertical-group'
import {statusOptions} from '../../../../mocks/data/single-select'
import {DefaultClosedIssue, DefaultDraftIssue, DefaultOpenIssue} from '../../../../mocks/memex-items'
import {createMemexItemModel} from '../../../mocks/models/memex-item-model'

describe('isEveryItemInColumn', () => {
  it('should return true when the columnValue is undefined and the target column is the no-option column', () => {
    expect(
      isEveryItemInColumn(
        // items with no status
        [createMemexItemModel(DefaultDraftIssue), createMemexItemModel(DefaultDraftIssue)],
        buildNoValueVerticalGroup('Status'),
        'Status',
      ),
    ).toBe(true)
  })

  it('should return false when a columnValue is undefined and the target column is not the no-option column', () => {
    expect(
      isEveryItemInColumn(
        // items with labels
        [createMemexItemModel(DefaultDraftIssue), createMemexItemModel(DefaultDraftIssue)],
        buildVerticalGroupForOption(statusOptions.find(o => o.name === 'Backlog')!),
        'Status',
      ),
    ).toBe(false)
  })

  it('should return true when selected columnValues are already in the target column', () => {
    expect(
      isEveryItemInColumn(
        // backlog items
        [createMemexItemModel(DefaultOpenIssue), createMemexItemModel(DefaultOpenIssue)],
        buildVerticalGroupForOption(statusOptions.find(o => o.name === 'Backlog')!),
        'Status',
      ),
    ).toBe(true)
  })

  it('should return false when selected columnValues are not in the target column', () => {
    expect(
      isEveryItemInColumn(
        // closed items
        [createMemexItemModel(DefaultClosedIssue), createMemexItemModel(DefaultClosedIssue)],
        buildVerticalGroupForOption(statusOptions.find(o => o.name === 'Backlog')!),
        'Status',
      ),
    ).toBe(false)
  })
})
