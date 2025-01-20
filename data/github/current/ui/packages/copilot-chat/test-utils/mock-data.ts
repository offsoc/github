import type {CopilotChatProps} from '../CopilotChat'
import type {CopilotChatState} from '../utils/copilot-chat-reducer'
import type {
  CodeNavSymbolReference,
  CopilotChatMessage,
  CopilotChatMode,
  CopilotChatReference,
  CopilotChatRepo,
  CopilotChatThread,
  Docset,
  MessageStreamingResponseComplete,
  RepositoryReference,
  SnippetReference,
} from '../utils/copilot-chat-types'
import type {CopilotChatProviderProps} from '../utils/CopilotChatContext'

export function getCopilotChatProps(): CopilotChatProps {
  return {
    currentUserLogin: 'monalisa',
    apiURL: 'https://github.com/github-copilot/chat',
    currentTopic: getRepositoryMock(),
    findFileWorkerPath: '@/find-file-worker.js',
    ssoOrganizations: [],
    agentsPath: '/agents',
    optedInToUserFeedback: true,
    reviewLab: false,
  }
}

export function getCopilotChatProviderProps(): CopilotChatProviderProps {
  return {
    ssoOrganizations: [],
    topic: getRepositoryMock(),
    login: 'currentUserLogin',
    apiURL: 'apiURL',
    workerPath: '@/find-file-worker.js',
    threadId: '0',
    refs: [],
    mode: 'assistive',
    agentsPath: '/agents',
    optedInToUserFeedback: true,
    reviewLab: false,
  }
}

export function getDefaultReducerState(
  threadId: string,
  topic: CopilotChatRepo | Docset | undefined,
  mode: CopilotChatMode,
): CopilotChatState {
  return {
    ssoOrganizations: [],
    threadsLoading: {state: 'pending', error: null},
    messagesLoading: {state: 'pending', error: null},
    slashCommandLoading: {state: 'pending', error: null},
    knowledgeBasesLoading: {state: 'pending', error: null},
    knowledgeBases: [],
    showTopicPicker: false,
    topicLoading: {state: 'pending', error: null},
    threads: new Map<string, CopilotChatThread>(),
    messages: [],
    streamer: null,
    streamingMessage: null,
    selectedThreadID: threadId,
    currentTopic: topic,
    chatIsCollapsed: false,
    chatIsOpen: false,
    isWaitingOnCopilot: false,
    currentUserLogin: 'currentUserLogin',
    apiUrl: 'apiURL',
    currentReferences: [],
    findFileWorkerPath: 'workerPath',
    threadActionMenuIsOpened: false,
    currentView: 'thread',
    selectedReference: null,
    mode,
    topRepositoriesCache: undefined,
    agents: [],
    agentsPath: '/agents',
    optedInToUserFeedback: true,
    reviewLab: false,
  }
}

export function getReducerStateMock(): CopilotChatState {
  return {
    ssoOrganizations: [],
    threadsLoading: {state: 'pending', error: null},
    messagesLoading: {state: 'pending', error: null},
    slashCommandLoading: {state: 'pending', error: null},
    knowledgeBasesLoading: {state: 'pending', error: null},
    knowledgeBases: [],
    showTopicPicker: false,
    topicLoading: {state: 'pending', error: null},
    threads: new Map<string, CopilotChatThread>(),
    messages: [],
    streamer: null,
    streamingMessage: null,
    selectedThreadID: 'threadId',
    currentTopic: {
      id: 1,
      name: 'github',
      ownerLogin: 'github',
      ownerType: 'Organization',
      commitOID: '1234',
      ref: 'refs/heads/main',
      refInfo: {
        name: 'main',
        type: 'branch',
      },
      visibility: 'public',
    },
    chatIsCollapsed: false,
    chatIsOpen: false,
    isWaitingOnCopilot: false,
    currentUserLogin: 'login',
    apiUrl: 'apiURL',
    currentReferences: [],
    findFileWorkerPath: 'workerPath',
    threadActionMenuIsOpened: false,
    currentView: 'thread',
    mode: 'assistive',
    selectedReference: null,
    topRepositoriesCache: undefined,
    agents: [],
    optedInToUserFeedback: true,
    reviewLab: false,
  }
}

export function getSymbolReferenceMock(): CodeNavSymbolReference {
  return {
    type: 'symbol',
    kind: 'codeNavSymbol',
    name: 'name',
    codeNavDefinitions: [
      {
        ident: {
          start: {line: 1, column: 1},
          end: {line: 1, column: 1},
        },
        extent: {
          start: {line: 1, column: 1},
          end: {line: 1, column: 1},
        },
        kind: 'kind',
        fullyQualifiedName: 'fullyQualifiedName',
        repoID: 1,
        repoOwner: 'repoOwner',
        repoName: 'repoName',
        ref: 'ref',
        commitOID: 'commitOID',
        path: 'path',
      },
    ],
    codeNavReferences: [],
  }
}

export function getRepositoryReferenceMock(): RepositoryReference {
  return {
    id: 1,
    name: 'Repository',
    ownerLogin: 'Owner',
    ownerType: 'User',
    type: 'repository',
    commitOID: '1234',
    ref: 'refs/heads/main',
    refInfo: {
      name: 'main',
      type: 'branch',
    },
    visibility: 'private',
  }
}

export function getSnippetReferenceMock(): SnippetReference {
  return {
    type: 'snippet',
    url: 'https://github.com',
    path: '/path/to/file',
    repoID: 123,
    repoOwner: 'owner',
    repoName: 'repo',
    ref: '1234',
    commitOID: '5678',
    range: {
      start: 1,
      end: 5,
    },
  }
}

export function getThreadMock(): CopilotChatThread {
  return {
    id: '0',
    name: 'thread',
    currentReferences: [],
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  }
}

export function getMessageMock(): CopilotChatMessage {
  return {
    id: '0',
    role: 'user',
    content: 'content',
    createdAt: '2020-01-01T00:00:00Z',
    threadID: '0',
    references: [],
  }
}

export function getMessageStreamingResponseMock(): MessageStreamingResponseComplete {
  return {
    type: 'complete',
    id: '0',
    turnID: '0',
    createdAt: '2020-01-01T00:00:00Z',
    references: [],
    intent: 'conversation',
  }
}

export function getRepositoryMock(): CopilotChatRepo {
  return {
    id: 1,
    name: 'github',
    ownerLogin: 'github',
    ownerType: 'Organization',
    commitOID: '1234',
    ref: 'refs/heads/main',
    refInfo: {
      name: 'main',
      type: 'branch',
    },
    visibility: 'public',
  }
}

export function getReferencesMock(): CopilotChatReference[] {
  return [
    {
      type: 'snippet',
      repoID: 1,
      repoOwner: 'github',
      repoName: 'github',
      ref: 'main',
      commitOID: 'abcdef',
      range: {start: 1, end: 10},
      title: 'bing',
      path: '/bing',
      url: 'http://bing.com',
    },
    {
      type: 'snippet',
      repoID: 1,
      repoOwner: 'github',
      repoName: 'github',
      ref: 'main',
      commitOID: 'abcdef',
      range: {start: 1, end: 10},
      title: 'google',
      path: '/google',
      url: 'http://google.com',
    },
    {
      type: 'snippet',
      repoID: 1,
      repoOwner: 'github',
      repoName: 'github',
      ref: 'main',
      commitOID: 'abcdef',
      range: {start: 1, end: 10},
      title: 'altavista',
      path: '/altavista',
      url: 'http://altavista.com',
    },
    {
      type: 'snippet',
      repoID: 1,
      repoOwner: 'github',
      repoName: 'github',
      ref: 'main',
      commitOID: 'abcdef',
      range: {start: 1, end: 10},
      title: 'lycos',
      path: '/lycos',
      url: 'http://lycos.com',
    },
  ]
}

export function getDocsetMock(props?: Partial<Docset>): Docset {
  return {
    id: '6cacfde5-0363-4cf0-b8ff-c057c04ffb48',
    name: 'GitHub Engineering',
    createdByID: 1149246,
    scopingQuery:
      'repo:github/blackbird OR repo:github/delivery-org OR repo:github/deploys OR repo:github/github OR repo:github/heaven OR repo:github/hubbernetes OR repo:github/ops OR (repo:github/thehub path:/^docs\\/epd\\/engineering\\//)',
    ownerID: 9919,
    ownerType: 'organization',
    repos: [
      'github/blackbird',
      'github/delivery-org',
      'github/deploys',
      'github/github',
      'github/heaven',
      'github/hubbernetes',
      'github/ops',
      'github/thehub',
    ],
    sourceRepos: [
      {
        id: 1,
        ownerID: 9919,
        paths: [],
      },
      {
        id: 2,
        ownerID: 9919,
        paths: [],
      },
      {
        id: 3,
        ownerID: 9919,
        paths: [],
      },
      {
        id: 4,
        ownerID: 9919,
        paths: [],
      },
      {
        id: 5,
        ownerID: 9919,
        paths: [],
      },
      {
        id: 6,
        ownerID: 9919,
        paths: [],
      },
      {
        id: 7,
        ownerID: 19919,
        paths: [],
      },
      {
        id: 8,
        ownerID: 9919,
        paths: ['/^docs\\/epd\\/engineering\\//'],
      },
    ],
    visibility: 'private',
    adminableByUser: false,
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    ownerLogin: 'github',
    protectedOrganizations: [],
    description: '',
    visibleOutsideOrg: false,
    ...props,
  }
}
