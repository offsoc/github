import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import {Suspense, useEffect} from 'react'
import {type OperationDescriptor, RelayEnvironmentProvider, useQueryLoader} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {IssueViewerContextProvider} from '../../contexts/IssueViewerContext'
import {HeaderFetched, type HeaderFetchedProps, HeaderGraphqlQuery} from '../header/Header'
import type {HeaderQuery} from '../header/__generated__/HeaderQuery.graphql'
import {BUTTON_LABELS} from '../../constants/buttons'
import {noop} from '@github-ui/noop'
import {ISSUE_VIEWER_DEFAULT_CONFIG, type OptionConfig} from '../OptionConfig'
import {TEST_IDS} from '../../constants/test-ids'

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  optionConfig?: OptionConfig
} & Partial<HeaderFetchedProps>

function TestComponent({environment, ...props}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <IssueViewerContextProvider>
        <Suspense fallback="...Loading">
          <Component {...props} />
        </Suspense>
      </IssueViewerContextProvider>
    </RelayEnvironmentProvider>
  )
}

function Component(props: Omit<TestComponentProps, 'environment'>) {
  const [queryRef, loadQuery, disposeQuery] = useQueryLoader<HeaderQuery>(HeaderGraphqlQuery)

  useEffect(() => {
    loadQuery({owner: 'github', repo: 'issues', number: 1})
    return () => {
      disposeQuery()
    }
  }, [loadQuery, disposeQuery])

  if (!queryRef) return null

  return (
    <HeaderFetched
      optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG}
      metadataPaneTrigger={<div>Metadata</div>}
      issuesQueryRef={queryRef}
      {...props}
    />
  )
}

it('Show close button when config has an onClose callback', async () => {
  const environment = setupEnvironment()

  render(<TestComponent environment={environment} optionConfig={{...ISSUE_VIEWER_DEFAULT_CONFIG, onClose: noop}} />)

  // Multiple elements are expected for responsive behaviour:
  //  1 is inside of the sticky header
  //  3 are inside of the normal header:
  //   1) wide viewport, 2) narrow viewport, 3) wide page, narrow container
  expect(screen.getAllByLabelText(BUTTON_LABELS.closePanel).length).toBeGreaterThanOrEqual(1)
})

it('Do not show close button when config has no onClose callback', async () => {
  const environment = setupEnvironment()

  render(
    <TestComponent environment={environment} optionConfig={{...ISSUE_VIEWER_DEFAULT_CONFIG, onClose: undefined}} />,
  )

  expect(screen.queryByLabelText(BUTTON_LABELS.closePanel)).not.toBeInTheDocument()
})

it('Show copy issue permalink button', async () => {
  const environment = setupEnvironment()

  render(<TestComponent environment={environment} />)

  // Multiple elements are expected for responsive behaviour
  //  See comment for `onClose` assertion above -- 4 buttons + 4 tooltips
  expect(screen.getAllByLabelText(BUTTON_LABELS.copyIssueLink).length).toBeGreaterThanOrEqual(1)
})

describe('HeaderIssueType', () => {
  it('Shows issue type when issueType is present in the graphQL response', async () => {
    const environment = setupEnvironment({issueTypePresent: true})

    render(<TestComponent environment={environment} />)

    const stickyHeader = screen.getByTestId(TEST_IDS.issueMetadataSticky)
    expect(within(stickyHeader).getByText('Feature')).toBeInTheDocument()

    const fixedHeader = screen.getByTestId(TEST_IDS.issueMetadataFixed)
    expect(within(fixedHeader).getByText('Feature')).toBeInTheDocument()
  })

  it('Does not show issue type when issueType is not present in the graphQL response', async () => {
    const environment = setupEnvironment()

    render(<TestComponent environment={environment} />)

    expect(screen.queryByText('Feature')).not.toBeInTheDocument()
  })
})

type SetupEnvironmentProps = {
  issueTypePresent?: boolean
  taskListBlockPresent?: boolean
  taskListBlockEmpty?: boolean
  hasNoCompletedItems?: boolean
}

function setupEnvironment({
  issueTypePresent = false,
  taskListBlockPresent = false,
  taskListBlockEmpty = false,
  hasNoCompletedItems = false,
}: SetupEnvironmentProps = {}) {
  const environment = createMockEnvironment()

  environment.mock.queuePendingOperation(HeaderGraphqlQuery, {owner: 'github', repo: 'issues', number: 1})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          issue: {
            number: 1,
            comments: {
              totalCount: 99,
            },
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
            issueType: issueTypePresent
              ? {
                  id: 'IT-abcd1',
                  name: 'Feature',
                }
              : null,
          },
        }
      },
    })
  })

  return environment
}
