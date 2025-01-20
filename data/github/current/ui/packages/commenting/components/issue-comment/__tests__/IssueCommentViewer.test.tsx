import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {ComponentWithLazyLoadQuery} from '@github-ui/relay-test-utils/RelayComponents'
import {act, fireEvent, screen} from '@testing-library/react'
import {type ComponentProps, Suspense} from 'react'
import {graphql, RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {makeIssueCommentBaseTypes} from '../../../test-utils/relay-type-mocks'
import type {SelectionContext} from '../../../utils/quotes'
import type {IssueCommentViewerCommentRow$key} from '../__generated__/IssueCommentViewerCommentRow.graphql'
import type {IssueCommentViewerReactable$key} from '../__generated__/IssueCommentViewerReactable.graphql'
import {IssueCommentViewer} from '../IssueCommentViewer'

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
} & Partial<Omit<ComponentProps<typeof IssueCommentViewer>, 'comment'>>

const selectQuoteFromCommentMock = jest.fn()
jest.mock('../../../utils/quotes', () => ({
  selectQuoteFromComment: (comment: HTMLDivElement | null | undefined, selection: SelectionContext | null) =>
    selectQuoteFromCommentMock(comment, selection),
}))

function TestComponent({environment, ...componentProps}: TestComponentProps) {
  const propsWithDefault = {
    setIsEditing: noop,
    onReply: noop,
    navigate: noop,
    ...componentProps,
  }

  const query = graphql`
    query IssueCommentViewerCommentTestQuery($commentId: ID!) @relay_test_operation {
      comment: node(id: $commentId) {
        ... on IssueComment {
          ...IssueCommentViewerCommentRow
          ...IssueCommentViewerReactable
        }
      }
    }
  `
  const queryVariables = {
    commentId: 'IC_kwAEAg',
  }
  const createComponent = (data: unknown) => (
    <IssueCommentViewer
      comment={(data as {comment: IssueCommentViewerCommentRow$key}).comment}
      reactable={(data as {comment: IssueCommentViewerReactable$key}).comment}
      {...propsWithDefault}
    />
  )
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <ComponentWithLazyLoadQuery dataToComponent={createComponent} query={query} queryVariables={queryVariables} />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

it('onReplySelect bubbles up the quoted comment body', async () => {
  const environment = createMockEnvironment()
  const onReplySelectMock = jest.fn()
  selectQuoteFromCommentMock.mockReturnValue('quoted text')

  render(<TestComponent environment={environment} onReply={onReplySelectMock} />)
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        ...makeIssueCommentBaseTypes(),
        IssueComment() {
          return {isHidden: false, viewerCanUpdate: true}
        },
      }),
    ),
  )

  const commentAction = screen.getByLabelText('Comment actions')
  expect(commentAction).toBeInTheDocument()

  fireEvent.click(commentAction)

  const quoteReplyAction = screen.getByText('Quote reply')
  expect(quoteReplyAction).toBeInTheDocument()
  fireEvent.click(quoteReplyAction)

  expect(selectQuoteFromCommentMock).toHaveBeenCalledTimes(1)
  expect(onReplySelectMock).toHaveBeenCalledTimes(1)
  expect(onReplySelectMock).toHaveBeenCalledWith('quoted text')
})
