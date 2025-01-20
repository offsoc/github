import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {createLinkedPullRequest} from '../../test-utils/mock-data'
import {
  LinkedPullRequestsOverlayActionItem,
  type LinkedPullRequestsOverlayActionItemProps,
} from '../../components/LinkedPullRequestsOverlayActionItem'

const linkedPullRequest = createLinkedPullRequest()

const render = (props?: Partial<LinkedPullRequestsOverlayActionItemProps>) =>
  reactRender(<LinkedPullRequestsOverlayActionItem linkedPullRequest={linkedPullRequest} {...props} />)

it('renders for an open pull request', () => {
  render()

  expect(screen.getByText(`#${linkedPullRequest.number} opened`)).toBeInTheDocument()
})

it('renders for an open draft pull request', () => {
  render({
    linkedPullRequest: createLinkedPullRequest({
      draft: true,
    }),
  })

  expect(screen.getByText(`#${linkedPullRequest.number} opened`)).toBeInTheDocument()
})

it('renders for a merged pull request', () => {
  render({
    linkedPullRequest: createLinkedPullRequest({
      state: 'closed',
      closedAt: '2024-05-22T13:20:25.947Z',
      mergedAt: '2024-05-22T13:20:25.947Z',
    }),
  })

  expect(screen.getByText(`#${linkedPullRequest.number} merged`)).toBeInTheDocument()
})

it('renders for a closed pull request', () => {
  render({
    linkedPullRequest: createLinkedPullRequest({
      state: 'closed',
      closedAt: '2024-05-22T13:20:25.947Z',
      mergedAt: null,
    }),
  })

  expect(screen.getByText(`#${linkedPullRequest.number} closed`)).toBeInTheDocument()
})

it('renders for a closed draft pull request', () => {
  render({
    linkedPullRequest: createLinkedPullRequest({
      state: 'closed',
      draft: true,
      closedAt: '2024-05-22T13:20:25.947Z',
    }),
  })

  expect(screen.getByText(`#${linkedPullRequest.number} closed`)).toBeInTheDocument()
})
