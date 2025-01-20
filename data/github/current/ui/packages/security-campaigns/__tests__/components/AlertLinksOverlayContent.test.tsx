import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {createLinkedBranch, createLinkedPullRequest} from '../../test-utils/mock-data'
import {AlertLinksOverlayContent, type AlertLinksOverlayContentProps} from '../../components/AlertLinksOverlayContent'

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
]
const linkedBranches = [
  createLinkedBranch({
    name: 'feature1',
  }),
  createLinkedBranch({
    name: 'feature2',
  }),
  createLinkedBranch({
    name: 'fix/security-campaign-for-client-side-cross-site-scripting',
  }),
]

const render = (props?: Partial<AlertLinksOverlayContentProps>) =>
  reactRender(
    <AlertLinksOverlayContent linkedPullRequests={linkedPullRequests} linkedBranches={linkedBranches} {...props} />,
  )

it('renders list with correct number of items', () => {
  render()

  expect(screen.getAllByRole('listitem')).toHaveLength(5)
})

it('renders list with correct number of items with only PRs', () => {
  render({
    linkedBranches: [],
  })

  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

it('renders list with correct number of items with only branches', () => {
  render({
    linkedPullRequests: [],
  })

  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
