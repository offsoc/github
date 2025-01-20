import {CopilotAuthTokenProvider} from '@github-ui/copilot-auth-token'
import {AuthToken} from '@github-ui/copilot-auth-token/auth-token'
import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {screen, waitFor} from '@testing-library/react'

import {getCopilotChatProviderProps, getDefaultReducerState, getDocsetMock} from '../../test-utils/mock-data'
import type {CopilotChatReference, Docset, DocsetReference} from '../../utils/copilot-chat-types'
import {CopilotChatProvider} from '../../utils/CopilotChatContext'
import {CurrentChatReferences} from '../CurrentChatReferences'
import {MenuPortalContainer} from '../PortalContainerUtils'

const docset: Docset = {
  id: '1',
  name: 'test',
  ownerID: 1,
  ownerType: 'user',
  visibility: 'private',
  repos: ['foo/bar', 'baz/qux'],
  sourceRepos: [
    {
      id: 1,
      ownerID: 1,
      paths: [],
    },
  ],
  description: 'test description',
  createdByID: 1,
  ownerLogin: 'testUser',
  scopingQuery: 'test query',
  visibleOutsideOrg: false,
  iconHtml: '' as SafeHTMLString,
  avatarUrl: '',
  adminableByUser: false,
  protectedOrganizations: [],
}

const docsetReference: DocsetReference = {
  type: 'docset',
  id: docset.id,
  name: docset.name,
  avatarUrl: '',
  scopingQuery: 'unusedtestdata',
  description: 'test description',
  repos: undefined,
}

describe('rendering a knowledge base reference', () => {
  beforeEach(() => {
    const provider = new CopilotAuthTokenProvider([])
    provider.setLocalStorageAuthToken(new AuthToken('buttercakes', 'whenever', []))
    setupResizeObserverMock()
  })

  test('Shows 0 repositories when the knowledge base reference repos are undefined', async () => {
    const currentReferences = [docsetReference]
    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', undefined, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )
    expect(await screen.findByText(/Loading repositories\.\.\./)).toBeInTheDocument()
  })

  test('Does not render the reference if the knowledge base was deleted', async () => {
    mockFetch.mockRoute(
      '/github-copilot/docs/docsets',
      {
        knowledgeBases: [], // empty payload simulates the knowledge base being deleted
        administratedCopilotEnterpriseOrganizations: [],
      },
      {
        status: 200,
        ok: true,
      },
    )

    const currentReferences = [docsetReference]

    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', undefined, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )

    await waitFor(() => {
      expect(screen.queryByTestId('docset-reference')).not.toBeInTheDocument()
    })
  }, 10000)

  test('Makes an API request to supplement the repository count and updates the UI', async () => {
    mockFetch.mockRoute(
      '/github-copilot/docs/docsets',
      {
        knowledgeBases: [
          getDocsetMock({
            scopingQuery: 'unusedtestdata',
            id: docset.id,
            ownerType: 'Organization',
            ownerID: 42,
            name: 'test name',
            ownerLogin: 'github',
            repos: ['doesnt/matter'],
            description: 'GitHub Docs description',
          }),
        ],
        administratedCopilotEnterpriseOrganizations: [],
      },
      {
        status: 200,
        ok: true,
      },
    )

    const currentReferences = [docsetReference]
    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', undefined, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )

    expect(await screen.findByText(/1 repository/)).toBeInTheDocument()
  }, 10000)

  test('Shows 1 repository when the knowledge base reference repos are a single item', async () => {
    const currentReferences = [{...docsetReference, ...{repos: ['github/github']}}]

    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', docset, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )

    expect(await screen.findByText(/Chatting with test/)).toBeInTheDocument()
    expect(await screen.findByText(/1 repository/)).toBeInTheDocument()
  }, 10000)

  test(`Shows 'repositories' when the knowledge base reference repos are > 1 item`, async () => {
    const currentReferences = [{...docsetReference, ...{repos: ['github/github', 'github/thehub']}}]
    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', docset, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )
    expect(await screen.findByText(/2 repositories/)).toBeInTheDocument()
  })

  test('Can click number of repositories link to see a list of the repositories', async () => {
    const currentReferences = [{...docsetReference, ...{repos: ['github/github', 'github/thehub']}}]
    const {user} = render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', docset, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <MenuPortalContainer />
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )

    const repositoriesLink = await screen.findByText('2 repositories')
    await user.click(repositoriesLink)

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('test description')).toBeInTheDocument()
    expect(screen.getByText('github/github')).toBeInTheDocument()
    expect(screen.getByText('github/thehub')).toBeInTheDocument()
  })
})

describe('rendering an attachment', () => {
  beforeEach(() => {
    setupResizeObserverMock()
  })
  test('Shows the count of attachments and a token for each', () => {
    const currentReferences = [
      {
        type: 'file' as const,
        url: 'testUrl',
        path: 'path/to/testFile.md',
        repoID: 42,
        repoOwner: 'testRepoOwner',
        repoName: 'testRepoName',
        ref: 'testRef',
        commitOID: 'testCommitOID',
      },
    ]
    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', undefined, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )

    expect(screen.getByText(/Chatting with 1 attachment/)).toBeInTheDocument()
    expect(screen.getByText(/testFile.md/)).toBeInTheDocument()
  })

  test('pluralizes correctly', () => {
    const currentReferences = [
      {
        type: 'file' as const,
        url: 'testUrl1',
        path: 'path/to/file2.md',
        repoID: 42,
        repoOwner: 'testRepoOwner',
        repoName: 'testRepoName',
        ref: 'testRef',
        commitOID: 'testCommitOID',
      },
      {
        type: 'file' as const,
        url: 'testUrl2',
        path: 'path/to/file1.md',
        repoID: 42,
        repoOwner: 'testRepoOwner',
        repoName: 'testRepoName',
        ref: 'testRef',
        commitOID: 'testCommitOID',
      },
    ]
    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', undefined, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )

    expect(screen.getByText(/Chatting with 2 attachments/)).toBeInTheDocument()
    expect(screen.getByText(/file1.md/)).toBeInTheDocument()
    expect(screen.getByText(/file2.md/)).toBeInTheDocument()
  })
})

test('Handles undefined visibleReferences gracefully', () => {
  const renderComponent = () => {
    const currentReferences: CopilotChatReference[] = []
    render(
      <CopilotChatProvider
        {...getCopilotChatProviderProps()}
        testReducerState={{
          ...getDefaultReducerState('2', docset, 'immersive'),
          topicLoading: {state: 'loaded', error: null},
          messagesLoading: {state: 'loaded', error: null},
          knowledgeBasesLoading: {state: 'loaded', error: null},
          currentReferences,
        }}
      >
        <CurrentChatReferences />
      </CopilotChatProvider>,
    )
  }
  expect(renderComponent).not.toThrow()
})

function setupResizeObserverMock() {
  class MockResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  })
}
