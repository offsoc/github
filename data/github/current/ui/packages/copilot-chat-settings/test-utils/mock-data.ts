import type {RepoData, Docset} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import type {ChatSettingsPayload} from '../routes/ChatSettings'
import type {NewKnowledgeBasePayload, EditKnowledgeBasePayload, ShowKnowledgeBasePayload} from '../routes/payloads'

export function getChatSettingsRoutePayload(): ChatSettingsPayload {
  return {
    newKnowledgeBasePath: '/new-path',
    currentOrganizationLogin: 'my-org',
  }
}

export function getNewKnowledgeBaseFormRoutePayload(): NewKnowledgeBasePayload {
  return {
    docsetOwner: {
      databaseId: 1,
      id: 1,
      isOrganization: true,
      displayLogin: 'my-org',
    },
    currentOrganizationLogin: 'my-org',
  }
}

export function getEditKnowledgeBaseFormRoutePayload(): EditKnowledgeBasePayload {
  return {
    currentOrganizationLogin: 'my-org',
    knowledgeBaseId: '42',
  }
}

export function getShowKnowledgeBasePayload(withRepos = false): ShowKnowledgeBasePayload {
  return {
    docset: getKnowledgeBase(withRepos),
    repoData: [getRepoDataPayload()],
    docsetOwner: {
      databaseId: 2,
      id: 1,
      isOrganization: true,
      displayLogin: 'my-org',
    },
  }
}

export function getRepoDataPayload(): RepoData {
  return {
    databaseId: 1,
    name: 'bar',
    nameWithOwner: 'foo/bar',
    isInOrganization: true,
    shortDescriptionHTML: 'this is a repo',
    paths: [],
    owner: {
      databaseId: 1,
      login: 'foo',
      avatarUrl: '',
    },
  }
}

export function getKnowledgeBase(withRepos = false): Docset {
  return {
    id: '1',
    name: 'my knowledge base',
    description: 'my knowledge base description',
    visibility: 'private',
    repos: withRepos ? ['foo/bar'] : [],
    scopingQuery: withRepos ? 'repo:foo/bar' : '',
    createdByID: 1,
    sourceRepos: withRepos
      ? [
          {
            id: 1,
            ownerID: 1,
            paths: [],
          },
        ]
      : [],
    ownerID: 1,
    ownerLogin: 'my-org',
    ownerType: 'organization',
    visibleOutsideOrg: false,
    avatarUrl: '',
    adminableByUser: true,
    protectedOrganizations: [],
  }
}
