import {ThemeProvider} from '@primer/react'
import {Suspense} from 'react'
import {graphql, RelayEnvironmentProvider, useLazyLoadQuery} from 'react-relay'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'

import {MarkdownEditHistoryViewer, MarkdownEditHistoryViewerGraphql} from '../MarkdownEditHistoryViewer'
import type {MarkdownEditHistoryViewerTestComponentQuery} from '../test-utils/__generated__/MarkdownEditHistoryViewerTestComponentQuery.graphql'

const testId = 'test_id'

export function TestComponent({environment}: {environment: RelayMockEnvironment}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <ThemeProvider>
        <Suspense fallback="...Loading">
          <TestMarkdownEditHistoryViewer />
        </Suspense>
      </ThemeProvider>
    </RelayEnvironmentProvider>
  )
}

function TestMarkdownEditHistoryViewer() {
  const data = useLazyLoadQuery<MarkdownEditHistoryViewerTestComponentQuery>(
    graphql`
      query MarkdownEditHistoryViewerTestComponentQuery($commentId: ID!) @relay_test_operation {
        node(id: $commentId) {
          ... on Comment {
            ...MarkdownEditHistoryViewer_comment
          }
        }
      }
    `,
    {commentId: testId},
  )

  if (!data || !data.node) return null

  return <MarkdownEditHistoryViewer editHistory={data.node} />
}

export function setupEnvironment(environment: RelayMockEnvironment) {
  environment.mock.resolveMostRecentOperation(() => {
    const mockPayload = {
      data: {
        node: {
          __id: testId,
          __typename: 'Comment',
          __isComment: true,
          id: testId,
          viewerCanReadUserContentEdits: true,
          lastEditedAt: new Date().toISOString(),
          lastUserContentEdit: {
            id: 'user_content_edit_test_id',
            editor: {
              id: 'user_test_id',
              url: '#',
              __typename: 'Actor',
              login: 'monalisa',
            },
          },
        },
      },
    }

    return mockPayload
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function queueHistoryQueryMock(environment: RelayMockEnvironment, edits: any[]) {
  environment.mock.queuePendingOperation(MarkdownEditHistoryViewerGraphql, {
    id: testId,
  })
  environment.mock.queueOperationResolver(() => {
    return {
      data: {
        node: {
          __typename: 'Comment',
          __isComment: true,
          id: testId,
          includesCreatedEdit: true,
          userContentEdits: {
            totalCount: edits.length,
            edges: edits,
          },
        },
      },
    }
  })
}

type CreateEditType = {
  editNumber: number
  login?: string
  createdAt?: Date
  deletedAt?: Date
}

export function createEdit({editNumber, login, createdAt, deletedAt}: CreateEditType) {
  const safeCreatedAt = createdAt ?? new Date(2021, 1, 1, 0, 0, editNumber)
  const safeLogin = login ?? 'testUser'
  return {
    node: {
      id: `edit ${editNumber}`,
      createdAt: safeCreatedAt.toISOString(),
      editedAt: safeCreatedAt.toISOString(),
      deletedAt: deletedAt ?? null,
      editor: {
        id: safeLogin,
        __typename: 'User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        login: safeLogin,
      },
      diff: 'diff',
    },
  }
}

export function createEdits(editCount: number) {
  const edits = []

  for (let i = 0; i < editCount; i++) {
    edits.push({
      ...createEdit({editNumber: i}),
    })
  }

  return edits
}
