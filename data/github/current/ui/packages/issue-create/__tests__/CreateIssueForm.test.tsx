import {render} from '@github-ui/react-core/test-utils'
import {CreateIssueForm, type CreateIssueFormProps} from '../CreateIssueForm'
import {noop} from '@github-ui/noop'
import {act, screen} from '@testing-library/react'
import {RelayEnvironmentProvider, type OperationDescriptor} from 'react-relay'
import {type RelayMockEnvironment, createMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {type MockRepository, buildMockRepository} from './helpers'
import type {RepositoryPickerRepository$data} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {ReactNode} from 'react'
import {getDefaultConfig, type OptionConfig} from '../utils/option-config'
import {useAnalytics} from '@github-ui/use-analytics'
import {commitCreateIssueMutation} from '../mutations/create-issue-mutation'
import {useIssueCreateConfigContext} from '../contexts/IssueCreateConfigContext'
import {IssueCreateContextProvider} from '../contexts/IssueCreateContext'
import {MockPayloadGenerator} from 'relay-test-utils'
import {IssueTypePickerGraphqlQuery} from '@github-ui/item-picker/IssueTypePicker'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'

jest.mock('@github-ui/use-analytics')
const sendAnalyticsEventMock = jest.fn()
jest.mocked(useAnalytics).mockReturnValue({sendAnalyticsEvent: sendAnalyticsEventMock})

jest.mock('../mutations/create-issue-mutation.ts')
const createIssueMutationMock = jest.mocked(commitCreateIssueMutation)

type CreateIssueFormWrapper = Omit<CreateIssueFormProps, 'repository'> & {
  environment: RelayMockEnvironment
  repository: MockRepository
  children?: ReactNode
  optionConfigOverrides?: Partial<OptionConfig>
}

const CreateIssueFormWrapper = ({
  environment,
  repository,
  children,
  optionConfigOverrides = {},
  ...props
}: CreateIssueFormWrapper) => (
  <RelayEnvironmentProvider environment={environment}>
    <IssueCreateContextProvider
      optionConfig={{...getDefaultConfig(), ...optionConfigOverrides}}
      preselectedData={undefined}
    >
      <CreateIssueForm {...props} repository={repository as unknown as RepositoryPickerRepository$data} />
      {children}
    </IssueCreateContextProvider>
  </RelayEnvironmentProvider>
)

let environment: RelayMockEnvironment

beforeEach(() => {
  environment = createMockEnvironment()

  window.sessionStorage.clear()
})

function setIssueTypeReferenceMock() {
  environment.mock.queuePendingOperation(IssueTypePickerGraphqlQuery, {owner: 'github', repo: 'issues'})

  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          issueTypes: {
            edges: [
              {
                node: {
                  id: mockRelayId(),
                  name: 'Bug',
                },
              },
            ],
          },
        }
      },
    })
  })
}

test('renders the contributors footer', () => {
  const mockRepository: MockRepository = buildMockRepository({
    owner: 'owner',
    name: 'repository',
  })

  render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title="title"
      setTitle={noop}
      body="body"
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    />,
  )

  expect(screen.getByText(/Remember, contributions to this repository should follow/)).toBeInTheDocument()
})

test('focuses title input if not filled on create click', () => {
  const mockRepository: MockRepository = buildMockRepository({
    owner: 'owner',
    name: 'repository',
  })

  const CreateButtonComponent = () => {
    const {onCreateAction} = useIssueCreateConfigContext()

    return <button onClick={() => onCreateAction.current?.onCreate(false, false)}>Mock create</button>
  }

  render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title=""
      setTitle={noop}
      body=""
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    >
      <CreateButtonComponent />
    </CreateIssueFormWrapper>,
  )

  expect(screen.getByLabelText('Add a title')).not.toHaveFocus()

  act(() => {
    screen.getByText('Mock create').click()
  })

  expect(screen.getByLabelText('Add a title')).toHaveFocus()
})

test('sends analytics event on submit', async () => {
  const mockRepository: MockRepository = buildMockRepository({
    owner: 'owner',
    name: 'repository',
  })
  const CreateButtonComponent = () => {
    const {onCreateAction} = useIssueCreateConfigContext()

    return <button onClick={() => onCreateAction.current?.onCreate(false, false)}>Mock create</button>
  }

  createIssueMutationMock.mockImplementation(({onCompleted}) => {
    onCompleted?.({
      createIssue: {
        errors: [],
        issue: {
          id: 'issue-id',
          number: 1,
          databaseId: 1,
          title: 'title',
          url: '',
          repository: {
            id: 'repository-id',
            databaseId: 1,
            name: 'repository',
            owner: {
              login: 'owner',
            },
          },
        },
      },
    })
    return {dispose: noop}
  })

  const {user} = render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title="cool title"
      setTitle={noop}
      body=""
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    >
      <CreateButtonComponent />
    </CreateIssueFormWrapper>,
  )

  await user.click(screen.getByText('Mock create'))

  expect(sendAnalyticsEventMock).toHaveBeenCalledTimes(1)
  expect(sendAnalyticsEventMock).toHaveBeenCalledWith('analytics.click', 'ISSUE_CREATE_NEW_ISSUE_BUTTON', {
    issueId: 'issue-id',
    issueNWO: 'owner/repository',
    issueNumber: 1,
  })
})

test('the issue type picker anchor button can be found via the "Type" label', async () => {
  setIssueTypeReferenceMock()

  const mockRepository: MockRepository = buildMockRepository({
    owner: 'github',
    name: 'issues',
  })

  render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title="title"
      setTitle={noop}
      body="body"
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    />,
  )

  expect(screen.getByText('Type')).toBeInTheDocument()
})

test('the issue type picker anchor is not found via the "Type" label if the user does not have permission', async () => {
  setIssueTypeReferenceMock()

  const mockRepository: MockRepository = buildMockRepository({
    owner: 'github',
    name: 'issues',
    viewerCanType: false,
  })

  render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title="title"
      setTitle={noop}
      body="body"
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    />,
  )

  expect(screen.queryByText('Type')).not.toBeInTheDocument()
})

test('the issue type can be readonly with preselected name', async () => {
  setIssueTypeReferenceMock()

  const mockRepository: MockRepository = buildMockRepository({
    owner: 'github',
    name: 'issues',
  })

  render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title="title"
      optionConfigOverrides={{scopedIssueType: 'Bug'}}
      setTitle={noop}
      body="body"
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    />,
  )

  const button = screen.getByRole('button', {name: 'Bug'})
  expect(button).toBeInTheDocument()
  expect(button).toHaveAttribute('disabled')
})

test('can have a preselected disabled milestone', async () => {
  setIssueTypeReferenceMock()

  const mockRepository: MockRepository = buildMockRepository({
    owner: 'github',
    name: 'issues',
  })

  render(
    <CreateIssueFormWrapper
      environment={environment}
      repository={mockRepository}
      title="title"
      optionConfigOverrides={{scopedMilestone: 'Milestone 1'}}
      setTitle={noop}
      body="body"
      setBody={noop}
      resetTitleAndBody={noop}
      clearOnCreate={noop}
      onCreateSuccess={noop}
      onCreateError={noop}
      onCancel={noop}
    />,
  )

  const button = screen.getByRole('button', {name: 'Milestone 1'})
  expect(button).toBeInTheDocument()
  expect(button).toHaveAttribute('disabled')
})
