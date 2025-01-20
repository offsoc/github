import {screen, within} from '@testing-library/react'
import {TaskListStatus} from '../TaskListStatus'
import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'
import type {TaskListStatusTestQuery} from './__generated__/TaskListStatusTestQuery.graphql'

const taskListStatusQuery = graphql`
  query TaskListStatusTestQuery($issueId: ID!) @relay_test_operation {
    node(id: $issueId) {
      ... on Issue {
        ...TaskListStatusFragment
      }
    }
  }
`

type SetupProps = {
  taskListBlockPresent?: boolean
  taskListBlockEmpty?: boolean
  hasNoCompletedItems?: boolean
  isSmall?: boolean
}

function setup({
  taskListBlockPresent = false,
  taskListBlockEmpty = false,
  hasNoCompletedItems = false,
  isSmall = false,
}: SetupProps = {}) {
  renderRelay<{
    taskListStatusQuery: TaskListStatusTestQuery
  }>(
    ({queryData}) => (
      <TaskListStatus isSmall={isSmall} taskListStatusKey={queryData['taskListStatusQuery'].node ?? undefined} />
    ),
    {
      relay: {
        queries: {
          taskListStatusQuery: {
            type: 'fragment',
            query: taskListStatusQuery,
            variables: {
              issueId: 'issueId',
            },
          },
        },
        mockResolvers: {
          Issue(context: MockResolverContext) {
            if (context.path?.length === 1) {
              return {
                tasklistBlocksCompletion: taskListBlockPresent
                  ? taskListBlockEmpty
                    ? {
                        completed: 0,
                        total: 0,
                      }
                    : {
                        completed: 2,
                        total: 5,
                      }
                  : null,
                taskListSummary: {
                  itemCount: 7,
                  completeCount: hasNoCompletedItems ? 0 : 3,
                },
              }
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

test('Shows the tasklist block progress if present in the graphQL response', async () => {
  setup({taskListBlockPresent: true, isSmall: false})

  const tasklistProgress = await screen.findAllByText('2 of 5')
  await expect(tasklistProgress[0]).toBeInTheDocument()

  expect(screen.queryByText('3 of 7')).not.toBeInTheDocument()
})

test('Shows the checklist block progress if tasklist block is not present in the graphQL response', async () => {
  setup({taskListBlockPresent: false, isSmall: false})

  const tasklistProgress = await screen.findAllByText('3 of 7')

  await expect(tasklistProgress[0]).toBeInTheDocument()
})

test('Shows the checklist block progress if tasklist block is empty in the graphQL response', async () => {
  setup({taskListBlockEmpty: true, isSmall: false})

  const tasklistProgress = await screen.findAllByText('3 of 7')

  await expect(tasklistProgress[0]).toBeInTheDocument()
})

test('Does not show the checklist icon if the checklist has no completed items', async () => {
  setup({taskListBlockPresent: false, hasNoCompletedItems: false, isSmall: false})

  const tasklistProgress = await screen.findAllByText('3 of 7')
  const tasklistIndicator = await screen.findAllByTestId('tasklist-progress')

  expect(within(tasklistIndicator[0]!).queryByRole('img', {hidden: true})).not.toBeInTheDocument()
  await expect(tasklistProgress[0]).toBeInTheDocument()
})

test('Shows only the checklist icon if the checklist has no completed items', async () => {
  setup({taskListBlockPresent: false, hasNoCompletedItems: true, isSmall: false})

  const tasklistProgress = await screen.findAllByText('7 tasks')
  const tasklistIndicator = await screen.findAllByTestId('tasklist-progress')
  const checklistIcon = within(tasklistIndicator[0]!).getByRole('img', {hidden: true})

  expect(checklistIcon).toBeVisible()
  expect(checklistIcon.classList.contains('octicon-checklist')).toBe(true)

  await expect(tasklistProgress[0]).toBeInTheDocument()
  await expect(checklistIcon).toBeInTheDocument()
})

test('isSmall -- shows the tasklist block progress if present in the graphQL response', async () => {
  setup({taskListBlockPresent: true, isSmall: true})

  const tasklistProgress = await screen.findAllByText('2 of 5')
  await expect(tasklistProgress[0]).toBeInTheDocument()

  expect(screen.queryByText('3 of 7')).not.toBeInTheDocument()
})

test('isSmall -- shows the checklist block progress if tasklist block is not present in the graphQL response', async () => {
  setup({taskListBlockPresent: false, isSmall: true})

  const tasklistProgress = await screen.findAllByText('3 of 7')

  await expect(tasklistProgress[0]).toBeInTheDocument()
})

test('isSmall -- shows the checklist block progress if tasklist block is empty in the graphQL response', async () => {
  setup({taskListBlockEmpty: true, isSmall: true})

  const tasklistProgress = await screen.findAllByText('3 of 7')

  await expect(tasklistProgress[0]).toBeInTheDocument()
})

test('isSmall -- does not show the checklist icon if the checklist has no completed items', async () => {
  setup({taskListBlockPresent: false, hasNoCompletedItems: true, isSmall: true})

  const tasklistProgress = await screen.findAllByText('7 tasks')
  const tasklistIndicator = screen.queryAllByTestId('tasklist-progress')

  await expect(tasklistIndicator).toHaveLength(0)
  await expect(tasklistProgress[0]).toBeInTheDocument()
})
