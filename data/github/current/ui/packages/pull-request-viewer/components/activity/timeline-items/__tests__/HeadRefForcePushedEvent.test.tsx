import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../../test-utils/PullRequestsAppWrapper'
import {HeadRefForcePushedEvent} from '../HeadRefForcePushedEvent'
import type {HeadRefForcePushedEventTestQuery} from './__generated__/HeadRefForcePushedEventTestQuery.graphql'

const mockHeadRefForcePushEvent = {
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
    const data = useLazyLoadQuery<HeadRefForcePushedEventTestQuery>(
      graphql`
        query HeadRefForcePushedEventTestQuery($id: ID!) @relay_test_operation {
          headRefForcePushedEvent: node(id: $id) {
            ...HeadRefForcePushedEvent_headRefForcePushedEvent
          }
        }
      `,
      {id: 'abc123'},
    )
    if (!data.headRefForcePushedEvent) return null

    return (
      <HeadRefForcePushedEvent
        pullRequestUrl={mockPullRequestURL}
        queryRef={data.headRefForcePushedEvent}
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
  const headRefForcePushedEvent = mockHeadRefForcePushEvent

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        HeadRefForcePushedEvent() {
          return headRefForcePushedEvent
        },
      }),
    )
  })

  const beforeCommitAbbreviatedCommitLink = screen.getByRole('link', {
    name: headRefForcePushedEvent.beforeCommit.abbreviatedOid,
  })
  const afterCommitAbbreviatedCommitLink = screen.getByRole('link', {
    name: headRefForcePushedEvent.afterCommit.abbreviatedOid,
  })
  const forcePushCompareLink = screen.getByRole('link', {name: 'force-pushed'})
  const compareLink = screen.getByRole('link', {name: 'Compare'})
  expect(beforeCommitAbbreviatedCommitLink).toHaveAttribute(
    'href',
    `${mockPullRequestURL}/commits/${headRefForcePushedEvent.beforeCommit.oid}`,
  )
  expect(afterCommitAbbreviatedCommitLink).toHaveAttribute(
    'href',
    `${mockPullRequestURL}/commits/${headRefForcePushedEvent.afterCommit.oid}`,
  )
  expect(forcePushCompareLink).toHaveAttribute(
    'href',
    `${mockRepositoryURL}/compare/${headRefForcePushedEvent.beforeCommit.oid}...${headRefForcePushedEvent.afterCommit.oid}`,
  )
  expect(compareLink).toHaveAttribute(
    'href',
    `${mockRepositoryURL}/compare/${headRefForcePushedEvent.beforeCommit.oid}...${headRefForcePushedEvent.afterCommit.oid}`,
  )
})

test('renders user avatar', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)
  const forcePushAuthor = {
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  }
  const headRefForcePushedEvent = {
    ...mockHeadRefForcePushEvent,
    afterCommit: {
      ...mockHeadRefForcePushEvent.afterCommit,
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
        HeadRefForcePushedEvent() {
          return headRefForcePushedEvent
        },
      }),
    )
  })

  const avatarLink = screen.getByRole('link', {name: new RegExp(forcePushAuthor.login)})
  expect(avatarLink).toHaveAttribute('href', `/${forcePushAuthor.login}`)
})
