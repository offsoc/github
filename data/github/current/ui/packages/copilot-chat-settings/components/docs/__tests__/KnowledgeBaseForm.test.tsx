import {mockFetch} from '@github-ui/mock-fetch'
import {render, type User} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import type {MockEnvironment} from 'relay-test-utils'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import type {Docset} from '@github-ui/copilot-chat/utils/copilot-chat-types'

import {KnowledgeBaseForm} from '../KnowledgeBaseForm'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {DIALOG_LABEL} from '../RepoSelectionDialog'
import {CopilotAuthTokenProvider} from '@github-ui/copilot-auth-token'
import {AuthToken} from '@github-ui/copilot-auth-token/auth-token'
import {getRepoDataPayload} from '../../../test-utils/mock-data'
import {QueryClient, QueryClientProvider, type QueryClientConfig} from '@tanstack/react-query'

const docsetOwner = {
  databaseId: 1,
  id: 123,
  displayLogin: 'cool-org',
  isOrganization: true,
}

const repositories = [
  {
    databaseId: 1,
    id: 'R_1',
    name: 'cool-repo',
    nameWithOwner: `cool-org/cool-repo`,
    owner: {
      databaseId: 1,
      login: 'cool-org',
    },
    isPrivate: false,
    isArchived: false,
  },
  {
    databaseId: 2,
    id: 'R_2',
    name: 'another-repo',
    nameWithOwner: `cool-org/another-repo`,
    owner: {
      databaseId: 1,
      login: 'cool-org',
    },
    isPrivate: false,
    isArchived: false,
  },
]

const checkNameUrl = `/organizations/${docsetOwner.displayLogin}/settings/copilot/chat_settings/check_name`

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})
jest.setTimeout(4_500)

describe('KnowledgeBaseForm', () => {
  beforeEach(() => {
    const provider = new CopilotAuthTokenProvider([])
    provider.setLocalStorageAuthToken(new AuthToken('buttercakes', 'whenever', []))
  })

  jest.useFakeTimers()

  function getNameField(): HTMLInputElement {
    return screen.getByLabelText('Name*')
  }

  it('should create a knowledge base', async () => {
    const environment = createMockEnvironment()
    const mockCheckName = mockFetch.mockRoute(checkNameUrl, {available: true})
    const onSave = jest.fn()
    const {user} = render(
      <RelayEnvironmentProvider environment={environment}>
        <KnowledgeBaseForm onSave={onSave} docsetOwner={docsetOwner} />
      </RelayEnvironmentProvider>,
    )

    // set name and wait for call to see if the name is available
    await user.type(getNameField(), 'this is the name')
    act(() => {
      jest.runAllTimers() // Trigger the debounced fetch
    })
    await screen.findByText('Available!')
    expect(mockCheckName).toHaveBeenCalledTimes(1)

    // set description
    await user.type(screen.getByLabelText('Description'), 'this is the description')

    // pick repositories
    await pickRepository(user, environment)

    // save
    await user.click(screen.getByRole('button', {name: 'Save'}))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('requires a name', async () => {
    const environment = createMockEnvironment()
    const onSave = jest.fn()
    const {user} = render(
      <RelayEnvironmentProvider environment={environment}>
        <KnowledgeBaseForm onSave={onSave} docsetOwner={docsetOwner} />
      </RelayEnvironmentProvider>,
    )

    // set description
    await user.type(screen.getByLabelText('Description'), 'this is the description')

    // pick repositories
    await pickRepository(user, environment)

    await user.click(screen.getByRole('button', {name: 'Save'}))
    await screen.findByText('Name must not be blank')
    expect(onSave).toHaveBeenCalledTimes(0)
  })

  it('does not require name change for edit', async () => {
    const environment = createMockEnvironment()
    const onSave = jest.fn()
    const initialDocset: Docset = {
      id: '1',
      name: 'cool-docset',
      description: 'this is the description',
      createdByID: 123,
      ownerID: 123,
      ownerLogin: 'cool-org',
      ownerType: 'organization',
      visibility: 'private',
      scopingQuery: '',
      repos: [],
      sourceRepos: [],
      visibleOutsideOrg: false,
      iconHtml: '' as SafeHTMLString,
      avatarUrl: '',
      adminableByUser: true,
      protectedOrganizations: [],
    }
    const {user} = render(
      <RelayEnvironmentProvider environment={environment}>
        <KnowledgeBaseForm onSave={onSave} initialDocset={initialDocset} docsetOwner={docsetOwner} />
      </RelayEnvironmentProvider>,
    )

    // Pick repositories because the passed in repos value is not used. This
    // allows us to avoid writing a large scopingQuery
    await pickRepository(user, environment)

    await user.click(screen.getByRole('button', {name: 'Save'}))
    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled()
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('requires a repository', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(checkNameUrl, {available: true})
    const onSave = jest.fn()
    const {user} = render(
      <RelayEnvironmentProvider environment={environment}>
        <KnowledgeBaseForm onSave={onSave} docsetOwner={docsetOwner} />
      </RelayEnvironmentProvider>,
    )

    // set name and wait for call to see if the name is available
    await user.type(getNameField(), 'this is the name')
    act(() => {
      jest.runAllTimers() // Trigger the debounced fetch
    })
    await screen.findByText('Available!')

    // set description
    await user.type(screen.getByLabelText('Description'), 'this is the description')

    // save
    await user.click(screen.getByRole('button', {name: 'Save'}))
    await screen.findByText('At least one repository must be selected')
    expect(onSave).toHaveBeenCalledTimes(0)
  })

  it('displays knowledge base index status', async () => {
    const environment = createMockEnvironment()
    const onSave = jest.fn()
    const initialRepo = getRepoDataPayload()

    const initialDocset: Docset = {
      id: '1',
      name: 'cool-docset',
      description: 'this is the description',
      createdByID: 123,
      ownerID: 123,
      ownerLogin: 'cool-org',
      ownerType: 'organization',
      visibility: 'private',
      scopingQuery: '',
      repos: [],
      sourceRepos: [{id: 1, ownerID: 1, paths: []}],
      visibleOutsideOrg: false,
      iconHtml: '' as SafeHTMLString,
      avatarUrl: '',
      adminableByUser: true,
      protectedOrganizations: [],
    }
    const queryClient = getQueryClient()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={queryClient}>
          <KnowledgeBaseForm
            onSave={onSave}
            initialDocset={initialDocset}
            docsetOwner={docsetOwner}
            initialRepos={[initialRepo]}
          />
        </QueryClientProvider>
      </RelayEnvironmentProvider>,
    )

    expect(screen.getByText('This knowledge base is available for chat.')).toBeInTheDocument()
  })

  it('does not display knowledge base index status if no initial repos exist', async () => {
    const environment = createMockEnvironment()
    const onSave = jest.fn()

    const queryClient = getQueryClient()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={queryClient}>
          <KnowledgeBaseForm onSave={onSave} docsetOwner={docsetOwner} />
        </QueryClientProvider>
      </RelayEnvironmentProvider>,
    )

    expect(screen.queryByText('This knowledge base is available for chat.')).not.toBeInTheDocument()
  })
})

async function pickRepository(user: User, environment: MockEnvironment) {
  await user.click(screen.getByRole('button', {name: DIALOG_LABEL}))
  await screen.findByRole('heading', {name: DIALOG_LABEL, level: 1})
  resolveRepoSearch(environment)
  await screen.findByText('cool-org/cool-repo', {exact: false})
  await user.click(screen.getByRole('checkbox', {name: 'Select: cool-org/cool-repo'}))
  await user.click(screen.getByRole('button', {name: 'Apply'}))
}

function resolveRepoSearch(environment: MockEnvironment) {
  act(() =>
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection: () => ({
          nodes: repositories,
        }),
      }),
    ),
  )
}

function getQueryClient(overrides?: QueryClientConfig) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    ...overrides,
  })
}
