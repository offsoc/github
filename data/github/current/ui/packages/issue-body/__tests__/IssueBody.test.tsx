import {noop} from '@github-ui/noop'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'

import {IssueBody} from '../IssueBody'
import {commitUpdateIssueBodyMutation} from '../mutations/update-issue-body-mutation'
import type {IssueBodyTestQuery} from './__generated__/IssueBodyTestQuery.graphql'

const useSessionStorageMock = useSessionStorage as jest.Mock
jest.mock('@github-ui/use-safe-storage/session-storage', () => ({
  useSessionStorage: jest.fn(),
}))

jest.mock('../mutations/update-issue-body-mutation')
const mockedUpdateIssueMutation = jest.mocked(commitUpdateIssueBodyMutation)

jest.setTimeout(10_000)

test('issue body uses presaved content over database content', async () => {
  useSessionStorageMock.mockReturnValue(['PRESAVED_CONTENT', jest.fn()])

  const {user} = renderRelay<{issueBody: IssueBodyTestQuery}>(
    ({queryData}) => <IssueBody issue={queryData.issueBody.repository!.issue!} onCommentReply={noop} />,
    {
      relay: {
        queries: {
          issueBody: {
            type: 'fragment',
            query: graphql`
              query IssueBodyTestQuery @relay_test_operation {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    ...IssueBody
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Issue: () => ({
            body: 'DATABASE_CONTENT',
            viewerCanUpdateNext: true,
          }),
        },
      },
      wrapper: Wrapper,
    },
  )

  const actionsButton = screen.getByRole('button', {name: 'Issue body actions'})
  await user.click(actionsButton)

  const editButton = screen.getByRole('button', {name: 'Edit'})
  await user.click(editButton)

  const textarea = screen.getByRole('textbox', {name: 'Markdown value'})
  expect(textarea).toHaveValue('PRESAVED_CONTENT')

  const saveButton = screen.getByRole('button', {name: 'Save'})
  await user.click(saveButton)

  expect(mockedUpdateIssueMutation).toHaveBeenCalledWith(
    expect.objectContaining({
      input: expect.objectContaining({
        body: 'PRESAVED_CONTENT',
      }),
    }),
  )
})
