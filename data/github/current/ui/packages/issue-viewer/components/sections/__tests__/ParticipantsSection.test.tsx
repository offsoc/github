import {Suspense} from 'react'
import {RelayEnvironmentProvider, graphql, useLazyLoadQuery} from 'react-relay'
import {type RelayMockEnvironment, createMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import type {ParticipantsSectionTestQuery} from './__generated__/ParticipantsSectionTestQuery.graphql'
import {ParticipantsSection} from '../ParticipantsSection'
import {MockPayloadGenerator} from 'relay-test-utils'
import {act, screen, render, within} from '@testing-library/react'

function TestComponent({environment}: {environment: RelayMockEnvironment}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <TestParticipantsSectionFooter />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

function TestParticipantsSectionFooter() {
  const data = useLazyLoadQuery<ParticipantsSectionTestQuery>(
    graphql`
      query ParticipantsSectionTestQuery {
        myData: node(id: "test-id") {
          ...ParticipantsSectionFragment
        }
      }
    `,
    {},
  )

  if (!data || !data.myData) return null

  return <ParticipantsSection issue={data.myData} />
}

test('renders participants section', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)

  await setupQueryMock(environment, 3, 3)

  expect(screen.getByTestId('sidebar-participants-section')).toBeInTheDocument()
  expect(screen.getByRole('heading', {name: 'Participants'})).toBeInTheDocument()
  expect(screen.getAllByRole('img').length).toEqual(3)
})

test('render a dialog with all participants', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)

  await setupQueryMock(environment, 8, 20)

  const openDialogButton = screen.getByRole('button', {name: /15/})

  act(() => openDialogButton.click())

  // mock the secondary query that happens when the dialog opens
  await setupQueryMock(environment, 20, 20)

  expect(screen.getByRole('dialog')).toBeInTheDocument()

  const list = screen.getByRole('list')
  expect(list).toBeInTheDocument()

  expect(within(list).getAllByRole('img').length).toEqual(20)
})

test('show a warning when the participants list is more than 100', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)

  await setupQueryMock(environment, 3, 101)

  const openDialogButton = screen.getByRole('button', {name: /96/})

  act(() => openDialogButton.click())

  // mock the secondary query that happens when the dialog opens
  await setupQueryMock(environment, 3, 101)

  expect(screen.getByRole('dialog')).toBeInTheDocument()

  const dialog = screen.getByRole('dialog')
  expect(dialog).toBeInTheDocument()

  expect(within(dialog).getByText('Only the first 100 participants are shown in this list.')).toBeInTheDocument()
})

async function setupQueryMock(environment: RelayMockEnvironment, assigneeCount: number, totalCount: number) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      const mockPayload = MockPayloadGenerator.generate(operation, {
        Issue() {
          return {
            participants: {
              nodes: Array(assigneeCount).fill(undefined),
              totalCount,
            },
          }
        },
        User(context, generateId) {
          return {
            login: `testassignee${generateId()}login`,
            avatarUrl: `testassignee${generateId()}avatarUrl`,
          }
        },
      })
      return mockPayload
    })
  })
}
