import {SliceByApplied, SliceByRemoved, TableHeaderMenuUI} from '../../../../client/api/stats/contracts'
import {
  assigneesColumn,
  customDateColumn,
  customNumberColumn,
  milestoneColumn,
  parentIssueColumn,
  repositoryColumn,
  stageColumn,
  statusColumn,
  teamColumn,
  trackedByColumn,
} from '../../../../mocks/data/columns'
import {test} from '../../../fixtures/test-extended'
import {isNotSlicedBy, isSlicedBy} from '../../../helpers/table/assertions'
import {toggleSliceBy} from '../../../helpers/table/interactions'

test.describe('Slice By', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
  })

  test('it allows slice by for the system-defined Status field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Status')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: statusColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Status')

    // Disable slice by
    await toggleSliceBy(page, 'Status')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: statusColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a user-defined single-select field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Stage')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: stageColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Stage')

    // Disable slice by
    await toggleSliceBy(page, 'Stage')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: stageColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a tracked-by field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Tracked by')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: trackedByColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Tracked by')

    // Disable slice by
    await toggleSliceBy(page, 'Tracked by')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: trackedByColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a parent issue field', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
      serverFeatures: {
        sub_issues: true,
      },
    })
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Parent issue')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: parentIssueColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Parent issue')

    // Disable slice by
    await toggleSliceBy(page, 'Parent issue')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: parentIssueColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for an assignee field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Assignees')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: assigneesColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Assignees')

    // Disable slice by
    await toggleSliceBy(page, 'Assignees')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: assigneesColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a milestone field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Milestone')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: milestoneColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Milestone')

    // Disable slice by
    await toggleSliceBy(page, 'Milestone')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: milestoneColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a repository field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Repository')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: repositoryColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Repository')

    // Disable slice by
    await toggleSliceBy(page, 'Repository')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: repositoryColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a text field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Team')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: teamColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Team')

    // Disable slice by
    await toggleSliceBy(page, 'Team')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: teamColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a number field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Estimate')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: customNumberColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Estimate')

    // Disable slice by
    await toggleSliceBy(page, 'Estimate')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: customNumberColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })

  test('it allows slice by for a date field', async ({page, memex}) => {
    // Slice by is not enabled by default
    await isNotSlicedBy(page)

    // Enable slice by
    await toggleSliceBy(page, 'Due Date')

    await memex.stats.expectStatsToContain({
      name: SliceByApplied,
      memexProjectColumnId: customDateColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is enabled
    await isSlicedBy(page, 'Due Date')

    // Disable slice by
    await toggleSliceBy(page, 'Due Date')

    await memex.stats.expectStatsToContain({
      name: SliceByRemoved,
      memexProjectColumnId: customDateColumn.id,
      memexProjectViewNumber: 1,
      context: JSON.stringify({layout: 'table'}),
      ui: TableHeaderMenuUI,
    })

    // Slice by is disabled
    await isNotSlicedBy(page)
  })
})
