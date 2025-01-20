import {render} from '@github-ui/react-core/test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {ERRORS} from '../../../constants/errors'
import {TEST_IDS} from '../../../constants/test-ids'
import {IssueCommentTestComponent} from '../../../test-utils/IssueCommentTestComponent'
import {makeIssueCommentBaseTypes} from '../../../test-utils/relay-type-mocks'

const owner = 'owner'
const repo = 'repo'
const number = 10

const urlParams = {
  owner,
  repo,
  number,
}

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  const navigateFn = jest.fn()
  return {
    ...originalModule,
    useNavigate: () => navigateFn,
    _routerNavigateFn: navigateFn,
    useParams: () => urlParams,
  }
})

test('Renders the comment viewer and header', async () => {
  const environment = createMockEnvironment()
  render(<IssueCommentTestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      const payload = MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {id: 'IC_kwAEAg', databaseId: 1}
        },
      })
      return payload
    })
  })

  await screen.findByTestId(TEST_IDS.commentViewerOuterBox('IC_kwAEAg'))
  expect(screen.getByTestId(TEST_IDS.commentHeaderRightSideItems)).toBeInTheDocument()
  expect(screen.getByTestId(TEST_IDS.markdownBody)).toBeInTheDocument()
  expect(screen.getByLabelText('Reactions')).toBeInTheDocument()
  expect(screen.getAllByTestId('github-avatar')[0]).not.toHaveStyle('opacity: 0.5')
  expect(screen.getAllByTestId('github-avatar')[1]).not.toHaveStyle('opacity: 0.5')
})

test('Hides content when comment is hidden and minimized', async () => {
  const environment = createMockEnvironment()
  render(<IssueCommentTestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {
            id: 'IC_kwAEAg',
            databaseId: 1,
            isHidden: true,
            isMinimized: true,
            viewerCanSeeUnminimizeButton: true,
            viewerCanSeeMinimizeButton: true,
          }
        },
      })
    })
  })

  await screen.findByTestId(TEST_IDS.commentViewerOuterBox('IC_kwAEAg'))
  expect(screen.getByTestId(TEST_IDS.commentHeaderRightSideItems)).toBeInTheDocument()
  expect(screen.getAllByTestId('github-avatar')[0]).toHaveStyle('opacity: 0.5')
  expect(screen.getAllByTestId('github-avatar')[1]).toHaveStyle('opacity: 0.5')
  expect(screen.queryByTestId(TEST_IDS.markdownBody)).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Reactions')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('hide comment')).not.toBeInTheDocument()

  // click unminimize and assert
  const unminimizeButton = await screen.findByLabelText('show comment')
  expect(unminimizeButton).toBeInTheDocument()

  await act(async () => {
    unminimizeButton.click()
  })

  expect(screen.getByTestId(TEST_IDS.markdownBody)).toBeInTheDocument()
  expect(screen.getByLabelText('Reactions')).toBeInTheDocument()
  expect(screen.queryByLabelText('show comment')).not.toBeInTheDocument()
  expect(screen.getAllByTestId('github-avatar')[0]).toHaveStyle('opacity: 0.5')
  expect(screen.getAllByTestId('github-avatar')[1]).toHaveStyle('opacity: 0.5')

  // click minimize and assert
  const minimizeButton = await screen.findByLabelText('hide comment')
  expect(minimizeButton).toBeInTheDocument()

  await act(async () => {
    minimizeButton.click()
  })

  expect(screen.queryByTestId(TEST_IDS.markdownBody)).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Reactions')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('hide comment')).not.toBeInTheDocument()
  expect(screen.getAllByTestId('github-avatar')[0]).toHaveStyle('opacity: 0.5')
  expect(screen.getAllByTestId('github-avatar')[1]).toHaveStyle('opacity: 0.5')
})

test('Cant update when stale content', async () => {
  const {environment} = createRelayMockEnvironment()
  render(<IssueCommentTestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {id: 'IC_kwAEAg', databaseId: 1, viewerCanUpdate: true}
        },
      })
    })
  })

  const commentOuterBox = await screen.findByTestId(TEST_IDS.commentViewerOuterBox('IC_kwAEAg'))
  const commentActionsButton = within(commentOuterBox).getByRole('button', {name: /comment actions/i})
  fireEvent.click(commentActionsButton)

  const menu = await screen.findByTestId(TEST_IDS.commentHeaderHamburgerOpen)
  const edit = within(menu).queryByText('Edit')
  expect(edit).toBeInTheDocument()

  fireEvent.click(edit!)

  const markdownBody = screen.getByRole('textbox', {name: /markdown value/i})
  expect(markdownBody).toBeInTheDocument()

  fireEvent.change(markdownBody, {target: {value: '123'}})

  const updateButton = screen.getByRole('button', {name: /update comment/i})

  expect(updateButton).toBeInTheDocument()
  fireEvent.click(updateButton)

  act(() => {
    environment.mock.rejectMostRecentOperation(() => {
      const error = {
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
      }

      return error
    })
  })

  const toastContainer = screen.getByTestId('ui-app-toast-error')
  expect(toastContainer).toBeInTheDocument()
  expect(toastContainer).toHaveTextContent(ERRORS.couldNotEditCommentStale)

  expect(updateButton).toBeDisabled()
})
