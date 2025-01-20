import {render} from '@github-ui/react-core/test-utils'
import {
  graphql,
  useLazyLoadQuery,
  RelayEnvironmentProvider,
  useQueryLoader,
  usePreloadedQuery,
  type PreloadedQuery,
  useFragment,
} from 'react-relay'

import {Suspense, useEffect, useRef} from 'react'
import type {OperationDescriptor} from 'relay-runtime'
import {MockPayloadGenerator, type createMockEnvironment} from 'relay-test-utils'

import {IssueViewerContextProvider} from '../../contexts/IssueViewerContext'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import type {IssueViewerTestComponentQuery} from './__generated__/IssueViewerTestComponentQuery.graphql'
import {IssueViewerInternalFragment, IssueViewerSecondaryIssueDataFragment} from '../../components/IssueViewer'
import {generateMockPayloadWithDefaults} from '../DefaultWrappers'
import type {OptionConfig} from '../../components/OptionConfig'
import type {IssueViewerTestComponentSecondaryQuery} from './__generated__/IssueViewerTestComponentSecondaryQuery.graphql'
import type {
  IssueViewerSecondaryIssueData$data,
  IssueViewerSecondaryIssueData$key,
} from '../../components/__generated__/IssueViewerSecondaryIssueData.graphql'
import {act} from '@testing-library/react'
import type {IssueViewerSecondaryViewQueryRepoData$data} from '../../components/__generated__/IssueViewerSecondaryViewQueryRepoData.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  viewerOptions?: Partial<OptionConfig>
  secondaryIssueData?: IssueViewerSecondaryIssueData$data
  secondaryRepoData?: IssueViewerSecondaryViewQueryRepoData$data
}

type ComponentInternalProps = TestComponentProps & {
  queryRef: PreloadedQuery<IssueViewerTestComponentSecondaryQuery>
}

type ComponentFetchedProps = TestComponentProps & {
  issueKey: IssueViewerSecondaryIssueData$key
}

const IssueViewerTestSecondaryQuery = graphql`
  query IssueViewerTestComponentSecondaryQuery($issueId: ID!) @relay_test_operation {
    node(id: $issueId) {
      ... on Issue {
        ...IssueViewerSecondaryIssueData
      }
    }
  }
`

const IssueViewerTestQuery = graphql`
  query IssueViewerTestComponentQuery @relay_test_operation {
    issue: node(id: "mockIssueId1") {
      ... on Issue {
        ...IssueViewerIssue
      }
    }
    viewer: node(id: "test-id-viewer") {
      ... on User {
        ...IssueViewerViewer
      }
    }
  }
`

function TestComponentWithSecondaryRoot({environment, ...rest}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <TestComponentWithSecondaryQuery environment={environment} {...rest} />
    </RelayEnvironmentProvider>
  )
}

export function TestComponentRoot({environment, ...rest}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <TestComponent environment={environment} {...rest} />
    </RelayEnvironmentProvider>
  )
}

function TestComponentWithSecondaryQuery({...props}: TestComponentProps) {
  const [queryRef, loadQuery, disposeQuery] =
    useQueryLoader<IssueViewerTestComponentSecondaryQuery>(IssueViewerTestSecondaryQuery)

  useEffect(() => {
    loadQuery({issueId: 'mockIssueId1'})
    return () => {
      disposeQuery()
    }
  }, [loadQuery, disposeQuery])
  if (!queryRef) return <TestComponent {...props} />

  return <TestComponentWithSecondaryQueryInternal queryRef={queryRef} {...props} />
}

function TestComponentWithSecondaryQueryInternal({queryRef, ...rest}: ComponentInternalProps) {
  const data = usePreloadedQuery(IssueViewerTestSecondaryQuery, queryRef)

  if (!data.node) return <TestComponent {...rest} />

  return <TestComponentWithSecondaryQueryFetched issueKey={data.node} {...rest} />
}

function TestComponentWithSecondaryQueryFetched({issueKey, ...rest}: ComponentFetchedProps) {
  const data = useFragment(IssueViewerSecondaryIssueDataFragment, issueKey)

  return <TestComponent secondaryIssueData={data} {...rest} />
}

export function TestComponent({viewerOptions = {}, secondaryIssueData, secondaryRepoData}: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<IssueViewerTestComponentQuery>(IssueViewerTestQuery, {})

    const containerRef = useRef<HTMLDivElement>(null)

    if (!data.issue || !data.viewer) {
      return null
    }

    return (
      <div ref={containerRef}>
        <IssueViewerInternalFragment
          viewerFragment={data.viewer}
          issueFragment={data.issue}
          optionConfig={{
            singleKeyShortcutsEnabled: true,
            navigate: (url: string) => {
              alert(url)
            },
            ...viewerOptions,
          }}
          containerRef={containerRef}
          secondaryIssueData={secondaryIssueData}
          secondaryRepoData={secondaryRepoData}
        />
      </div>
    )
  }

  return (
    <IssueViewerContextProvider>
      <Suspense fallback="...Loading">
        <TestComponentWithQuery />
      </Suspense>
    </IssueViewerContextProvider>
  )
}

export function MockRepo(
  repositoryId: string | undefined = 'test-repo',
  ownerId: string | undefined = 'test-owner',
  ownerLogin: string | undefined = 'test-owner',
) {
  return {
    id: repositoryId,
    name: 'test-repo',
    nameWithOwner: `${ownerLogin}/test-repo`,
    owner: {
      __typename: 'User',
      id: ownerId,
      login: ownerLogin,
      url: `/${ownerLogin}`,
    },
    isPrivate: false,
    databaseId: 42,
    viewerCanInteract: true,
    viewerInteractionLimitReasonHTML: '',
    planFeatures: {
      maximumAssignees: 10,
    },
  }
}

type setupMockEnvironmentProps = {
  mockOverwrites?: Record<string, () => object>
  mockSecondaryOverwrites?: Record<string, () => object>
  viewerOptions?: Partial<OptionConfig>
}
export async function setupMockEnvironment(
  {mockOverwrites, mockSecondaryOverwrites, viewerOptions}: setupMockEnvironmentProps = {
    mockOverwrites: {},
    mockSecondaryOverwrites: {},
    viewerOptions: {},
  },
) {
  const {environment} = createRelayMockEnvironment()

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    expect(operation.fragment.node.name).toBe('IssueViewerTestComponentQuery')
    const payload = generateMockPayloadWithDefaults(operation, {
      ...mockOverwrites,
      Repository() {
        return MockRepo()
      },
    })
    return payload
  })

  // This is required or we'll get the error 'Not implemented: window.scrollTo'
  Object.defineProperty(window, 'scrollTo', {value: () => {}, writable: true})
  const {container, rerender, user} = render(
    <TestComponentWithSecondaryRoot environment={environment} viewerOptions={viewerOptions} />,
  )

  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('IssueViewerTestComponentSecondaryQuery')
      return MockPayloadGenerator.generate(operation, {
        Repository() {
          return MockRepo()
        },
        ...mockSecondaryOverwrites,
      })
    })
  })

  return {container, rerender, environment, user}
}
