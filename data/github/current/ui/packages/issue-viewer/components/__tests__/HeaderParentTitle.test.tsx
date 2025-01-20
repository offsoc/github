import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {Suspense, useEffect} from 'react'
import {
  RelayEnvironmentProvider,
  graphql,
  usePreloadedQuery,
  useQueryLoader,
  type OperationDescriptor,
  type PreloadedQuery,
} from 'react-relay'
import type {createMockEnvironment} from 'relay-test-utils'
import {MockPayloadGenerator} from 'relay-test-utils'
import type {HeaderParentTitleQuery} from './__generated__/HeaderParentTitleQuery.graphql'
import {IssueViewerContextProvider} from '../../contexts/IssueViewerContext'
import {HeaderParentTitle} from '../header/HeaderParentTitle'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
}

function TestComponent({environment}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <IssueViewerContextProvider>
        <Suspense fallback="...Loading">
          <Component />
        </Suspense>
      </IssueViewerContextProvider>
    </RelayEnvironmentProvider>
  )
}

const HeaderParentTitleGraphQLQuery = graphql`
  query HeaderParentTitleQuery($issueId: ID!) {
    node(id: $issueId) {
      ... on Issue {
        ...HeaderParentTitle
      }
    }
  }
`

function Component() {
  const [queryRef, loadQuery, disposeQuery] = useQueryLoader<HeaderParentTitleQuery>(HeaderParentTitleGraphQLQuery)

  useEffect(() => {
    loadQuery({issueId: '123'})
    return () => {
      disposeQuery()
    }
  }, [loadQuery, disposeQuery])

  if (!queryRef) return null

  return <ComponentFetched queryRef={queryRef} />
}

type ComponentFetchedProps = {
  queryRef: PreloadedQuery<HeaderParentTitleQuery>
}

function ComponentFetched({queryRef}: ComponentFetchedProps) {
  const data = usePreloadedQuery(HeaderParentTitleGraphQLQuery, queryRef)

  if (!data.node) return null

  return <HeaderParentTitle parentKey={data.node} />
}

it('Does not show parent issue title when parent is not present in the response', async () => {
  render(<TestComponent environment={setupEnvironment()} />)

  expect(screen.queryByRole('link', {name: /^Parent issue:/})).not.toBeInTheDocument()
})

it('Shows parent issue title when parent is present in the response', async () => {
  render(<TestComponent environment={setupEnvironment({issueParentPresent: true})} />)

  expect(screen.getByRole('link', {name: /^Parent issue:/})).toBeInTheDocument()
})

type SetupEnvironmentProps = {
  issueParentPresent?: boolean
}

function setupEnvironment({issueParentPresent = false}: SetupEnvironmentProps = {}) {
  const {environment} = createRelayMockEnvironment()

  environment.mock.queuePendingOperation(HeaderParentTitleGraphQLQuery, {issueId: '123'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Issue() {
        if (issueParentPresent) {
          return {
            __typename: 'Issue',
            id: 'parent-issue-id',
            number: 2,
            state: 'OPEN',
            title: 'Parent of issue',
            url: '/github/issues/2',
          }
        } else {
          return {
            __typename: 'Issue',
            id: '123',
            state: 'OPEN',
            title: 'Issue title',
            parent: null,
          }
        }
      },
    })
  })

  return environment
}
