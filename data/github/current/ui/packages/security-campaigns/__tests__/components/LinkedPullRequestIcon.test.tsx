import {createLinkedPullRequest} from '../../test-utils/mock-data'
import {getLinkedPullRequestIconColor} from '../../components/LinkedPullRequestIcon'

const linkedPullRequest = createLinkedPullRequest()

it('uses correct colour for an open pull request', () => {
  const colour = getLinkedPullRequestIconColor(linkedPullRequest)
  expect(colour).toBe('open.fg')
})

it('uses correct colour for an open draft pull request', () => {
  const colour = getLinkedPullRequestIconColor(
    createLinkedPullRequest({
      draft: true,
    }),
  )
  expect(colour).toBe('fg.muted')
})

it('uses correct colour for a merged pull request', () => {
  const colour = getLinkedPullRequestIconColor(
    createLinkedPullRequest({
      state: 'closed',
      closedAt: '2024-05-22T13:20:25.947Z',
      mergedAt: '2024-05-22T13:20:25.947Z',
    }),
  )
  expect(colour).toBe('done.fg')
})

it('uses correct colour for a closed pull request', () => {
  const colour = getLinkedPullRequestIconColor(
    createLinkedPullRequest({
      state: 'closed',
      closedAt: '2024-05-22T13:20:25.947Z',
      mergedAt: null,
    }),
  )
  expect(colour).toBe('closed.fg')
})

it('uses correct colour for a closed draft pull request', () => {
  const colour = getLinkedPullRequestIconColor(
    createLinkedPullRequest({
      state: 'closed',
      draft: true,
      closedAt: '2024-05-22T13:20:25.947Z',
    }),
  )
  expect(colour).toBe('closed.fg')
})
