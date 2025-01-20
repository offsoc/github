import {test} from '../../fixtures/test-extended'

const rowSelector = 'div[data-testid^=TableRow]'

test.describe('negated value column filtering', () => {
  test.describe('Default page', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'table'})
    })

    test('it returns no results with negated column value query is malformed', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('--status:done', rowSelector, 0)
      await memex.sharedInteractions.filterToExpectedCount('--no:status', rowSelector, 0)
      await memex.sharedInteractions.filterToExpectedCount('--is:pr', rowSelector, 0)
      await memex.sharedInteractions.filterToExpectedCount('--reason:completed', rowSelector, 0)
    })

    test('it allows filtering by negated column value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-status:done', rowSelector, 4)
    })

    test('it allows filtering by negated empty column value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-no:status', rowSelector, 5)
    })

    test('it allows filtering by negated type', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-is:issue', rowSelector, 2)
    })

    test('it allows filtering by negated state reason', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-reason:completed', rowSelector, 3)
    })

    test('it allows filtering by negated status', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-is:open', rowSelector, 3)
    })

    test('it allows filtering by negated linked PR value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-linked-pull-requests:1234', rowSelector, 6)
      await memex.sharedInteractions.filterToExpectedCount('-no:linked-pull-requests', rowSelector, 2)
    })

    test('it allows filtering by negated reviewers value', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-reviewers:dmarcey', rowSelector, 6)
      await memex.sharedInteractions.filterToExpectedCount('-no:reviewers', rowSelector, 1)
    })

    test('it allows for narrowing queries by using separate filters', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-no:label -is:draft -status:done', rowSelector, 1)
      await memex.sharedInteractions.filterToExpectedCount('-is:draft -is:pr -is:closed', rowSelector, 1)
      await memex.sharedInteractions.filterToExpectedCount('-status:done -status:backlog', rowSelector, 2)
      await memex.sharedInteractions.filterToExpectedCount('-no:assignees -no:labels', rowSelector, 3)
    })

    test('it allows for querying by using multiple values for single filter', async ({memex}) => {
      await memex.sharedInteractions.filterToExpectedCount('-is:pr,draft', rowSelector, 3)
      await memex.sharedInteractions.filterToExpectedCount('-status:done,backlog', rowSelector, 2)
      await memex.sharedInteractions.filterToExpectedCount('-no:status,labels', rowSelector, 5)
    })
  })

  test('it allows filtering by negated iteration value', async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('-iteration:"Iteration 4"', rowSelector, 5)
    await memex.sharedInteractions.filterToExpectedCount('-no:iteration', rowSelector, 5)
  })

  test('it allows filtering by negated ambivalent field value', async ({memex}) => {
    await memex.navigateToStory('appWithReasonField', {viewType: 'table'})
    await memex.sharedInteractions.filterToExpectedCount('-reason:customer-request', rowSelector, 6)
    await memex.sharedInteractions.filterToExpectedCount('-no:reason', rowSelector, 4)
  })
})
