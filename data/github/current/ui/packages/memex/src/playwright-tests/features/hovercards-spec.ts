import {mockLinkedPullRequests} from '../../mocks/data/pull-requests'
import {getReviewerTeam, mockTeams} from '../../mocks/data/teams'
import {mockUsers} from '../../mocks/data/users'
import {DefaultOpenIssue, DefaultOpenPullRequest} from '../../mocks/memex-items'
import {test} from '../fixtures/test-extended'

test.describe('Hovercards', () => {
  test('for presence avatars', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.presence.expectAvatarHovercardUrl(0, mockUsers[0].id)
  })
  test.describe('on board view', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {viewType: 'board'})
    })
    test('for Linked PRs', async ({memex}) => {
      await memex.boardView
        .getCard('Backlog', 0)
        .getLinkedPullRequestLabel(0)
        .expectHovercardUrl(mockLinkedPullRequests[0].url)
    })

    test('for Reviewers', async ({memex, page}) => {
      // Needed so that the `Done` column on the board is rendered
      // and able to be inspected and asserted by the tests.
      // With a smaller viewport, this column is virtualized.
      await page.setViewportSize({
        width: 2000,
        height: 800,
      })

      await memex.boardView.getCard('Done', 1).getReviewersLabel().expectUserHovercardUrl(0, mockUsers[0].id)
      await memex.boardView
        .getCard('Done', 1)
        .getReviewersLabel()
        .expectTeamHovercardUrl(1, getReviewerTeam(mockTeams[0].name).url)
    })

    test('are absent for Assignees', async ({memex}) => {
      await memex.boardView.getCard('Backlog', 0).getAssignees().expectNoHovercardUrl(0)
    })

    test('data-hovercard-subject-tag depends on card item type', async ({memex}) => {
      // draft issue
      await memex.boardView.getCard('No Status', 0).expectDataHovercardSubjectTag(null)

      // redacted item
      await memex.boardView.getCard('No Status', 1).expectDataHovercardSubjectTag(null)

      // issue
      await memex.boardView.getCard('Backlog', 0).expectDataHovercardSubjectTag(`issue:${DefaultOpenIssue.content.id}`)

      // pull request
      await memex.boardView
        .getCard('Backlog', 1)
        .expectDataHovercardSubjectTag(`pull_request:${DefaultOpenPullRequest.content.id}`)
    })
  })

  test.describe('on table view', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')
    })
    test('for Linked PRs', async ({memex}) => {
      await memex.tableView.cells
        .getLinkedPullRequestsCell(5)
        .getLinkedPullRequestLabel(0)
        .expectHovercardUrl(mockLinkedPullRequests[0].url)
    })

    test('for Reviewers', async ({memex}) => {
      await memex.tableView.cells.getReviewersCell(1).expectUserHovercardUrl(0, mockUsers[0].id)
      await memex.tableView.cells.getReviewersCell(1).expectTeamHovercardUrl(1, getReviewerTeam(mockTeams[0].name).url)
    })

    test('are absent for Assignees', async ({memex}) => {
      await memex.tableView.cells.getAssigneesCell(0).expectNoHovercardUrl(0)
    })

    test('data-hovercard-subject-tag depends on card item type', async ({memex}) => {
      // draft issue
      await memex.tableView.rows.getRow(2).expectDataHovercardSubjectTag(null)

      // redacted item
      await memex.tableView.rows.getRow(4).expectDataHovercardSubjectTag(null)

      // issue
      await memex.tableView.rows.getRow(5).expectDataHovercardSubjectTag(`issue:${DefaultOpenIssue.content.id}`)

      // pull request
      await memex.tableView.rows
        .getRow(6)
        .expectDataHovercardSubjectTag(`pull_request:${DefaultOpenPullRequest.content.id}`)
    })
  })
})
