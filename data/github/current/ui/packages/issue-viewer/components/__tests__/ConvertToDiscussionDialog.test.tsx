import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, fireEvent, screen} from '@testing-library/react'
import {ConvertToDiscussionDialog} from '../ConvertToDiscussionDialog'
import {LABELS} from '../../constants/labels'
import {MockPayloadGenerator} from 'relay-test-utils'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import type {ConvertToDiscussionDialogQuery} from '../__generated__/ConvertToDiscussionDialogQuery.graphql'

// @ts-expect-error overriding window.location in test
delete window.location
window.location = {hash: ''} as Location
const setHrefSpy = jest.fn()
Object.defineProperty(window.location, 'href', {
  set: setHrefSpy,
  get: () => 'test',
})

function selectCategory() {
  const optionValue = screen.getAllByRole<HTMLOptionElement>('option')[1]?.value
  fireEvent.change(screen.getByTestId('select'), {target: {value: optionValue}})
}

async function setupDialog(): Promise<RelayMockEnvironment> {
  const {relayMockEnvironment} = setup({})

  await screen.findByText(/Announcements/)

  selectCategory()

  return relayMockEnvironment
}

async function clickConvertButton() {
  const convertButton = await screen.findByTestId('convertButton')
  act(() => {
    convertButton.click()
  })
}

const resolveMutation = (environment: RelayMockEnvironment) => {
  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation, {
      Discussion: () => ({
        url: 'discussion-url',
      }),
    }),
  )
}

const rejectMutation = (environment: RelayMockEnvironment) => {
  act(() => {
    environment.mock.rejectMostRecentOperation(() => ({
      name: 'GraphQLError',
      message: 'GraphQL error: STALE_DATA The comment has been updated since you started editing it.',
      locations: [
        {
          line: 2,
          column: 3,
        },
      ],
      path: ['updateIssueComment'],
      extensions: {
        type: 'FORBIDDEN',
        code: 'STALE_COMMENT',
        timestamp: '2021-08-19T18:39:36+00:00',
      },
    }))
  })
}

it('should render the dialog and category picker', async () => {
  setup({})

  expect(await screen.findByText(/Category for new discussion/)).toBeInTheDocument()
  await screen.findByText(LABELS.convertToDiscussion.whatHappens)
  expect(await screen.findByText(/Announcements/)).toBeInTheDocument()
})

it('should should enable the convert button by default', async () => {
  setup({})

  expect(await screen.findByTestId('convertButton')).toBeEnabled()
})

it('should display relevant affirmations depending on the contents of the issue', async () => {
  setup({
    hasComments: true,
    hasReactions: true,
  })

  const affirmations = [
    LABELS.convertToDiscussion.affirmations.closedAndLocked,
    LABELS.convertToDiscussion.affirmations.same,
    LABELS.convertToDiscussion.affirmations.commentsAndReactions,
  ]

  for (const affirmation of affirmations) {
    expect(await screen.findByText(affirmation)).toBeInTheDocument()
  }
})

it('should display relevant warnings depending on the contents of the issue', async () => {
  setup({
    hasTasklistBlocks: true,
    hasAssignees: true,
    hasProjectsV2: true,
    hasProjectCards: true,
    hasMilestone: true,
  })

  const warnings = [
    LABELS.convertToDiscussion.warnings.taskListBlocks,
    LABELS.convertToDiscussion.warnings.assignees,
    LABELS.convertToDiscussion.warnings.projects,
    LABELS.convertToDiscussion.warnings.milestone,
  ]

  for (const warning of warnings) {
    expect(await screen.findByText(warning)).toBeInTheDocument()
  }
})

it('should fire a mutation with the correct input variables when the convert button is clicked', async () => {
  const environment = await setupDialog()

  await clickConvertButton()

  const mutationName = environment.mock.getMostRecentOperation().fragment.node.name
  const categoryId = environment.mock.getMostRecentOperation().fragment.variables.input.categoryId
  const issueId = environment.mock.getMostRecentOperation().fragment.variables.input.issueId

  expect(mutationName).toBe('convertIssueToDiscussionMutation')
  expect(categoryId).toBe('DIC_2')
  expect(issueId).toBe('I_kwAEAg')
})

it('should convert the issue to a discussion when the convert button is clicked', async () => {
  const environment = await setupDialog()

  await clickConvertButton()

  resolveMutation(environment)

  expect(setHrefSpy).toHaveBeenCalledWith('discussion-url')
})

it('should display an error when the conversion fails', async () => {
  const environment = await setupDialog()

  await clickConvertButton()

  rejectMutation(environment)

  expect(await screen.findByText(LABELS.somethingWentWrong)).toBeInTheDocument()
})

const setup = ({
  hasComments = false,
  hasReactions = false,
  hasTasklistBlocks = false,
  hasAssignees = false,
  hasProjectsV2 = false,
  hasProjectCards = false,
  hasMilestone = false,
}: {
  hasComments?: boolean
  hasReactions?: boolean
  hasTasklistBlocks?: boolean
  hasAssignees?: boolean
  hasProjectsV2?: boolean
  hasProjectCards?: boolean
  hasMilestone?: boolean
}) => {
  return renderRelay<{
    convertToDiscussionDialogQuery: ConvertToDiscussionDialogQuery
  }>(() => <ConvertToDiscussionDialog issueId={'I_kwAEAg'} owner={''} repository={''} onClose={() => {}} />, {
    relay: {
      queries: {
        convertToDiscussionDialogQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: {
        Issue(_ctx, id) {
          return {
            title: `My issue title ${id()}`,
            number: 33,
            comments: {totalCount: hasComments ? 1 : 0},
            reactions: {totalCount: hasReactions ? 1 : 0},
            tasklistBlocks: {totalCount: hasTasklistBlocks ? 1 : 0},
            assignees: {totalCount: hasAssignees ? 1 : 0},
            projectsV2: {totalCount: hasProjectsV2 ? 1 : 0},
            projectCards: {totalCount: hasProjectCards ? 1 : 0},
            milestone: hasMilestone ? {} : null,
          }
        },
        DiscussionCategoryConnection() {
          return {
            edges: [
              {node: {id: 'DIC_1', name: 'Announcements'}},
              {node: {id: 'DIC_2', name: 'General'}},
              {node: {id: 'DIC_3', name: 'Ideas'}},
            ],
          }
        },
      },
    },
    wrapper: Wrapper,
  })
}
