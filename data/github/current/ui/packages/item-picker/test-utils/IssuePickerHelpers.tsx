import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {RelayEnvironmentProvider, graphql, useLazyLoadQuery} from 'react-relay'
import React from 'react'
import type {createMockEnvironment} from 'relay-test-utils'
import {LazyIssuePicker} from '../components/IssuePicker'
import type {IssuePickerHelpersTestQuery} from '../test-utils/__generated__/IssuePickerHelpersTestQuery.graphql'
import type {IssueState} from '../components/__generated__/IssuePickerIssue.graphql'

export type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  owner?: string
  repositoryNameWithOwner?: string
  title?: string
  triggerOpen?: boolean
  hiddenIssueIds?: string[]
  selectedIssueIds?: string[]
}

export function TestIssuePickerComponent({environment, ...props}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="...Loading">
        <Component {...props} />
      </React.Suspense>
    </RelayEnvironmentProvider>
  )
}

export const IssuePickerHelpers_TestQuery = graphql`
  query IssuePickerHelpersTestQuery @relay_test_operation {
    issue: node(id: "test-issue-id") {
      ... on Issue {
        subIssues(first: 50) {
          nodes {
            id
          }
        }
      }
    }
  }
`

function Component(props: Omit<TestComponentProps, 'environment'>) {
  const issue = useLazyLoadQuery<IssuePickerHelpersTestQuery>(IssuePickerHelpers_TestQuery, {})

  const hiddenIssueIds = issue.issue?.subIssues?.nodes?.filter(node => !!node).map(issueData => issueData.id)

  return (
    <LazyIssuePicker
      hiddenIssueIds={hiddenIssueIds ?? []}
      onIssueSelection={() => {}}
      anchorElement={(anchorProps: React.HTMLAttributes<HTMLElement>) => (
        <button {...anchorProps}>Open Issue Picker</button>
      )}
      {...props}
    />
  )
}

function getRandomNumber() {
  return Math.ceil(Math.random() * 1000)
}

export function buildIssue({title}: {title: string}) {
  return {
    id: mockRelayId(),
    databaseId: getRandomNumber(),
    title,
    number: getRandomNumber(),
    closed: false,
    repository: {
      nameWithOwner: 'github/github',
    },
    state: 'OPEN' as IssueState,
    stateReason: null,
    __typename: 'Issue',
  }
}
