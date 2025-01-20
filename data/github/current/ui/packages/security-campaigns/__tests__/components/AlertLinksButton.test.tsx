import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {createLinkedBranch, createLinkedPullRequest, createRepository} from '../../test-utils/mock-data'

import {AlertLinksButton, type AlertLinksButtonProps} from '../../components/AlertLinksButton'

const linkedPullRequests = [
  createLinkedPullRequest({
    number: 123,
  }),
  createLinkedPullRequest({
    number: 4789,
    state: 'closed',
    closedAt: '2024-05-22T13:20:25.947Z',
    mergedAt: '2024-05-22T13:20:25.947Z',
  }),
  createLinkedPullRequest({
    number: 237859,
    state: 'closed',
    closedAt: '2024-05-22T13:20:25.947Z',
    mergedAt: null,
  }),
]
const linkedBranches = [
  createLinkedBranch({
    name: 'feature1',
  }),
  createLinkedBranch({
    name: 'feature2',
  }),
]
const repository = createRepository()

const render = (props?: Partial<AlertLinksButtonProps>) =>
  reactRender(
    <AlertLinksButton
      linkedPullRequests={linkedPullRequests}
      linkedBranches={linkedBranches}
      repository={repository}
      {...props}
    />,
  )

it('renders a button', () => {
  render()

  expect(screen.getByRole('button')).toHaveTextContent('5')
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

it('renders a button with only PRs', () => {
  render({
    linkedBranches: [],
  })

  expect(screen.getByRole('button')).toHaveTextContent('3')
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

it('renders a button with only branches', () => {
  render({
    linkedPullRequests: [],
  })

  expect(screen.getByRole('button')).toHaveTextContent('2')
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

it('can open the overlay', async () => {
  const {user} = render()

  await user.click(screen.getByRole('button'))

  expect(screen.getAllByRole('listitem')).toHaveLength(5)
})

it('renders a link with a single PR', () => {
  const linkedPullRequest = createLinkedPullRequest()

  render({
    linkedPullRequests: [linkedPullRequest],
    linkedBranches: [],
  })

  expect(screen.getByRole('link')).toHaveTextContent('1')
  expect(screen.getByRole('link')).toHaveAttribute('href', linkedPullRequest.path)
  expect(screen.queryAllByRole('button')).toHaveLength(0)
})

it('renders a link with a single branch', () => {
  const linkedBranch = createLinkedBranch()

  render({
    linkedPullRequests: [],
    linkedBranches: [linkedBranch],
  })

  expect(screen.getByRole('link')).toHaveTextContent('1')
  expect(screen.getByRole('link')).toHaveAttribute('href', linkedBranch.path)
  expect(screen.queryAllByRole('button')).toHaveLength(0)
})

it('renders a button with 1 PR and 1 branch', () => {
  render({
    linkedPullRequests: [createLinkedPullRequest()],
    linkedBranches: [createLinkedBranch()],
  })

  expect(screen.getByRole('button')).toHaveTextContent('2')
})
