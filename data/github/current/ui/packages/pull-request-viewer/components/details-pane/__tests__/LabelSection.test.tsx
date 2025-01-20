import {render} from '@github-ui/react-core/test-utils'
import {act, fireEvent, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildLabel, buildPullRequest, buildRepository} from '../../../test-utils/query-data'
import {LabelSection} from '../LabelSection'
import type {LabelSectionTestQuery} from './__generated__/LabelSectionTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
}

function TestComponent(props: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<LabelSectionTestQuery>(
      graphql`
        query LabelSectionTestQuery @relay_test_operation {
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...LabelSection_pullRequest
            }
          }
        }
      `,
      {},
    )
    if (!data.pullRequest) {
      return null
    }

    return <LabelSection pullRequest={data.pullRequest} repoName="monalisa" repoOwner="smile" />
  }

  return (
    <PullRequestsAppWrapper environment={props.environment} pullRequestId={'mock'}>
      <TestComponentWithQuery />
    </PullRequestsAppWrapper>
  )
}

test('renders the labels section as readonly if viewerCanUpdate is false', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'CLOSED',
            viewerCanUpdate: false,
            labels: [
              buildLabel({
                name: 'good for new contributors',
              }),
              buildLabel({
                name: 'here there be dragons',
              }),
            ],
          })
        },
      }),
    )
  })

  expect(screen.queryByRole('button', {name: 'Edit Labels'})).not.toBeInTheDocument()
  expect(screen.getByText('good for new contributors')).toBeInTheDocument()
  expect(screen.getByText('here there be dragons')).toBeInTheDocument()
})

test('renders the labels section with an edit button if viewerCanUpdate is true and we have data for the label picker', async () => {
  const environment = createMockEnvironment()

  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            viewerCanUpdate: true,
            labels: [
              buildLabel({
                name: 'good for new contributors',
              }),
              buildLabel({
                name: 'here there be dragons',
              }),
            ],
          })
        },
      })
    })
  })

  const labelButton = screen.getByRole('button', {name: 'Edit Labels'})
  fireEvent.click(labelButton)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        Repository() {
          return buildRepository({
            labels: [
              buildLabel({
                name: 'repo label #1',
              }),
              buildLabel({
                name: 'repo label #2',
              }),
            ],
          })
        },
      })
    })
  })

  expect(screen.getAllByText('good for new contributors').length).toBe(2)
  expect(screen.getAllByText('here there be dragons').length).toBe(2)
  expect(screen.getByText('repo label #1')).toBeInTheDocument()
  expect(screen.getByText('repo label #2')).toBeInTheDocument()

  expect(screen.getByRole('button', {name: 'Edit Labels'})).toBeInTheDocument()
})
