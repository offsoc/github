import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getPullRequest, getRepository} from '../test-utils/mock-data'
import PullRequestLabel from '../components/PullRequestLabel'

test('renders the open PullRequestLabel component', () => {
  const pullRequest = getPullRequest()
  const repo = getRepository()
  pullRequest.state = 'open'
  pullRequest.reviewableState = 'reviewable'
  pullRequest.merged = false
  render(<PullRequestLabel repo={repo} pullRequest={pullRequest} />)

  expect(screen.getByRole('link', {name: `Link to the open pull request #${pullRequest.number}`})).toBeVisible()
})

test('renders the closed PullRequestLabel component', () => {
  const pullRequest = getPullRequest()
  const repo = getRepository()
  pullRequest.state = 'closed'
  pullRequest.reviewableState = 'reviewable'
  pullRequest.merged = false
  render(<PullRequestLabel repo={repo} pullRequest={pullRequest} />)

  expect(screen.getByRole('link', {name: `Link to the closed pull request #${pullRequest.number}`})).toBeVisible()
})

test('renders the draft PullRequestLabel component', () => {
  const pullRequest = getPullRequest()
  const repo = getRepository()
  pullRequest.state = 'open'
  pullRequest.reviewableState = 'draft'
  pullRequest.merged = false
  render(<PullRequestLabel repo={repo} pullRequest={pullRequest} />)

  expect(screen.getByRole('link', {name: `Link to the draft pull request #${pullRequest.number}`})).toBeVisible()
})

test('renders the merged PullRequestLabel component', () => {
  const pullRequest = getPullRequest()
  const repo = getRepository()
  pullRequest.state = 'closed'
  pullRequest.reviewableState = 'reviewable'
  pullRequest.merged = true
  render(<PullRequestLabel repo={repo} pullRequest={pullRequest} />)

  expect(screen.getByRole('link', {name: `Link to the merged pull request #${pullRequest.number}`})).toBeVisible()
})

test('renders the closed PullRequestLabel component when draft and closed', () => {
  const pullRequest = getPullRequest()
  const repo = getRepository()
  pullRequest.state = 'closed'
  pullRequest.reviewableState = 'draft'
  pullRequest.merged = false
  render(<PullRequestLabel repo={repo} pullRequest={pullRequest} />)

  expect(screen.getByRole('link', {name: `Link to the closed pull request #${pullRequest.number}`})).toBeVisible()
})
