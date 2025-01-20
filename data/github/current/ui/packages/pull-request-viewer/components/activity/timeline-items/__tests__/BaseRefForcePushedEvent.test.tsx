import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../../test-utils/PullRequestsAppWrapper'
import {BaseRefForcePushedEvent} from '../BaseRefForcePushedEvent'
import type {BaseRefForcePushedEventTestQuery} from './__generated__/BaseRefForcePushedEventTestQuery.graphql'

const mockBaseRefForcePushEvent = {
  databaseId: 123,
  refName: 'refs/heads/feature',
  beforeCommit: {
    abbreviatedOid: 'abc123',
    oid: 'abc123efg456',
  },
  afterCommit: {
    abbreviatedOid: 'def123',
    oid: 'def123efg456',
    authoredDate: '2021-01-01T00:00:00Z',
    authors: {
      edges: [
        {
          node: {
            user: {
              login: 'test-user',
              avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            },
          },
        },
      ],
    },
  },
}

const mockRepositoryURL = '/monalisa/smile'
const mockPullRequestURL = `${mockRepositoryURL}/pull/7`

function TestComponent({environment}: {environment: ReturnType<typeof createMockEnvironment>}) {
  const WrappedComponent = () => {
    const data = useLazyLoadQuery<BaseRefForcePushedEventTestQuery>(
      graphql`
        query BaseRefForcePushedEventTestQuery($id: ID!) @relay_test_operation {
          baseRefForcePushedEvent: node(id: $id) {
            ...BaseRefForcePushedEvent_baseRefForcePushedEvent
          }
        }
      `,
      {id: 'abc123'},
    )
    if (!data.baseRefForcePushedEvent) return null

    return (
      <BaseRefForcePushedEvent
        pullRequestUrl={mockPullRequestURL}
        queryRef={data.baseRefForcePushedEvent}
        repositoryUrl={mockRepositoryURL}
      />
    )
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId="mock">
      <WrappedComponent />
    </PullRequestsAppWrapper>
  )
}

test('renders commit and compare page links', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)
  const baseRefForcePushedEvent = mockBaseRefForcePushEvent

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        BaseRefForcePushedEvent() {
          return baseRefForcePushedEvent
        },
      }),
    )
  })

  const beforeCommitAbbreviatedCommitLink = screen.getByRole('link', {
    name: baseRefForcePushedEvent.beforeCommit.abbreviatedOid,
  })
  const afterCommitAbbreviatedCommitLink = screen.getByRole('link', {
    name: baseRefForcePushedEvent.afterCommit.abbreviatedOid,
  })
  const forcePushCompareLink = screen.getByRole('link', {name: 'force-pushed'})
  const compareLink = screen.getByRole('link', {name: 'Compare'})
  expect(beforeCommitAbbreviatedCommitLink).toHaveAttribute(
    'href',
    `${mockPullRequestURL}/commits/${baseRefForcePushedEvent.beforeCommit.oid}`,
  )
  expect(afterCommitAbbreviatedCommitLink).toHaveAttribute(
    'href',
    `${mockPullRequestURL}/commits/${baseRefForcePushedEvent.afterCommit.oid}`,
  )
  expect(forcePushCompareLink).toHaveAttribute(
    'href',
    `${mockRepositoryURL}/compare/${baseRefForcePushedEvent.beforeCommit.oid}...${baseRefForcePushedEvent.afterCommit.oid}`,
  )
  expect(compareLink).toHaveAttribute(
    'href',
    `${mockRepositoryURL}/compare/${baseRefForcePushedEvent.beforeCommit.oid}...${baseRefForcePushedEvent.afterCommit.oid}`,
  )
})

test('renders user avatar', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)
  const forcePushAuthor = {
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  }
  const baseRefForcePushedEvent = {
    ...mockBaseRefForcePushEvent,
    afterCommit: {
      ...mockBaseRefForcePushEvent.afterCommit,
      authors: {
        edges: [
          {
            node: {
              user: forcePushAuthor,
            },
          },
        ],
      },
    },
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        BaseRefForcePushedEvent() {
          return baseRefForcePushedEvent
        },
      }),
    )
  })

  const avatarLink = screen.getByRole('link', {name: new RegExp(forcePushAuthor.login)})
  expect(avatarLink).toHaveAttribute('href', `/${forcePushAuthor.login}`)
})
