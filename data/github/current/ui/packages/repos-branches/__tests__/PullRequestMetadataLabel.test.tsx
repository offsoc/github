import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import PullRequestMetadataLabel from '../components/PullRequestMetadataLabel'
import {PullRequestStatus} from '../types'

test('renders the merge queue PullRequestMetadataLabel component', () => {
  render(<PullRequestMetadataLabel kind="merge-queue" queueCount={10} />)

  expect(screen.getByTestId('merge-queue-icon')).toBeVisible()
})

test('render the open pull request PullRequestMetadataLabel component', () => {
  render(<PullRequestMetadataLabel kind="pull-request" number={1} status={PullRequestStatus.Open} />)

  expect(screen.getByTestId('open-pull-request-icon')).toBeVisible()
})

test('render the closed pull request PullRequestMetadataLabel component', () => {
  render(<PullRequestMetadataLabel kind="pull-request" number={1} status={PullRequestStatus.Closed} />)

  expect(screen.getByTestId('closed-pull-request-icon')).toBeVisible()
})

test('render the draft pull request PullRequestMetadataLabel component', () => {
  render(<PullRequestMetadataLabel kind="pull-request" number={1} status={PullRequestStatus.Draft} />)

  expect(screen.getByTestId('draft-pull-request-icon')).toBeVisible()
})

test('render the merged pull request PullRequestMetadataLabel component', () => {
  render(<PullRequestMetadataLabel kind="pull-request" number={1} status={PullRequestStatus.Merged} />)

  expect(screen.getByTestId('merged-pull-request-icon')).toBeVisible()
})
