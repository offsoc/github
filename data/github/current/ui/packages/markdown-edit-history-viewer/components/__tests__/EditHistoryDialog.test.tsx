import {noop} from '@github-ui/noop'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {ThemeProvider} from '@primer/react'
import {act, render, screen} from '@testing-library/react'
import {Suspense} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'

import {BUTTON_LABELS} from '../../constants/button-labels'
import {LABELS} from '../../constants/labels'
import {EditHistoryDialog} from '../EditHistoryDialog'

const testId = 'test_id'
const defaultLogin = 'testUser'

function TestComponent({environment}: {environment: RelayMockEnvironment}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <ThemeProvider>
        <Suspense fallback="...Loading">
          <EditHistoryDialog userContentEditId={testId} onClose={noop} />
        </Suspense>
      </ThemeProvider>
    </RelayEnvironmentProvider>
  )
}

test('renders basic edit history dialog', async () => {
  const {environment} = createRelayMockEnvironment()
  render(<TestComponent environment={environment} />)

  await setupContentEditMock(environment, createEditContentEdit({editNumber: 1, firstEdit: true}))

  expect(screen.getByText(LABELS.editHistory.viewingEditTitle)).toBeInTheDocument()
  expect(screen.getByText(LABELS.editHistory.created)).toBeInTheDocument()
  expect(screen.getByText(BUTTON_LABELS.deleteEditRevision)).toBeInTheDocument()
})

test('renders shows a deleted edit history dialog', async () => {
  const {environment} = createRelayMockEnvironment()
  render(<TestComponent environment={environment} />)

  await setupContentEditMock(
    environment,
    createEditContentEdit({editNumber: 1, firstEdit: true, deletedAt: new Date(2020)}),
  )

  expect(screen.getByText(LABELS.editHistory.viewingEditTitle)).toBeInTheDocument()
  expect(screen.getByText(LABELS.editHistory.deletedThisRevision)).toBeInTheDocument()
  expect(screen.queryByText(BUTTON_LABELS.deleteEditRevision)).not.toBeInTheDocument()
})

test('does not show delete revision if user is lacking permissions', async () => {
  const {environment} = createRelayMockEnvironment()
  render(<TestComponent environment={environment} />)

  await setupContentEditMock(environment, createEditContentEdit({editNumber: 1, viewerCanDelete: false}))

  expect(screen.getByText(LABELS.editHistory.viewingEditTitle)).toBeInTheDocument()
  expect(screen.getByText(LABELS.editHistory.edited)).toBeInTheDocument()
  expect(screen.queryByText(LABELS.editHistory.created)).not.toBeInTheDocument()
  expect(screen.queryByText(BUTTON_LABELS.deleteEditRevision)).not.toBeInTheDocument()
})

type CreateEditContentEditType = {
  editNumber: number
  login?: string
  createdAt?: Date
  deletedAt?: Date
  newest?: boolean
  firstEdit?: boolean
  diff?: string
  viewerCanDelete?: boolean
}

function createEditContentEdit({
  editNumber,
  login,
  createdAt,
  deletedAt,
  newest,
  firstEdit,
  diff,
  viewerCanDelete,
}: CreateEditContentEditType) {
  const safeCreatedAt = createdAt ?? new Date(2021, 1, 1, 0, 0, editNumber)
  const safeLogin = login ?? defaultLogin

  return {
    node: {
      __typename: 'UserContentEdit',
      id: testId,
      createdAt: safeCreatedAt.toISOString(),
      editedAt: safeCreatedAt.toISOString(),
      deletedAt: deletedAt ?? null,
      viewerCanDelete: viewerCanDelete ?? true,
      editor: {
        id: safeLogin,
        __typename: 'User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        login: safeLogin,
      },
      deletedBy: deletedAt
        ? {
            id: safeLogin,
            __typename: 'User',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            login: safeLogin,
          }
        : null,
      newest: newest ?? false,
      firstEdit: firstEdit ?? false,
      diff: diff ?? 'diff',
      diffBefore: '',
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setupContentEditMock(environment: RelayMockEnvironment, edit: any) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toBe('EditHistoryDialogQuery')
      // Manually constructing the payload instead of using the MockPayloadGenerator
      // As encountered issues with Relay constructing the correct payload for a query that
      // directly queries on the base Node() object itself.
      const payload = {
        data: {
          ...edit,
        },
      }

      return payload
    })
  })
}
