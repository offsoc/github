/* eslint eslint-comments/no-use: off */

import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import type {RepositoryPickerRepository$data} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerRepositoryIssueTemplates$data} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import {IssueCreationKind} from '../utils/model'

export type MockRepository = Omit<RepositoryPickerRepository$data, ' $fragmentType'> &
  Omit<RepositoryPickerRepositoryIssueTemplates$data, ' $fragmentType'>

export function buildMockRepository({
  id,
  name,
  owner,
  hasSecurityPolicy,
  hasIssuesEnabled,
  viewerCanWrite,
  viewerCanType,
  noTemplates,
  noContactLinks,
  overrides,
}: {
  id?: string
  name: string
  owner: string
  hasSecurityPolicy?: boolean
  hasIssuesEnabled?: boolean
  viewerCanWrite?: boolean
  viewerCanType?: boolean
  disableWriteAccess?: boolean
  noTemplates?: boolean
  noContactLinks?: boolean
  overrides?: Partial<MockRepository>
}): MockRepository {
  return {
    databaseId: 1,
    id: id ?? mockRelayId(),
    name,
    nameWithOwner: `${owner}/${name}`,
    owner: {
      databaseId: 1,
      login: owner,
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
    shortDescriptionHTML: 'short description',
    hasIssuesEnabled: hasIssuesEnabled ?? true,
    isSecurityPolicyEnabled: hasSecurityPolicy ?? false,
    securityPolicyUrl: hasSecurityPolicy ? '/security/policy' : null,
    isPrivate: false,
    isArchived: false,
    isInOrganization: false,
    isBlankIssuesEnabled: true,
    slashCommandsEnabled: false,
    viewerCanPush: viewerCanWrite ?? false,
    templateTreeUrl: '/template/tree/url',
    issueTemplates: noTemplates
      ? []
      : [
          {
            name: `template name 1 - ${name}`,
            filename: `template1.yml`,
            title: 'template title 1',
            body: 'template body 1',
            about: 'about template 1',
            assignees: {edges: [], totalCount: 0},
            labels: {edges: [], totalCount: 0},
            __typename: 'IssueTemplate',
            __id: mockRelayId(),
            type: null,
          },
          {
            name: 'template name 2',
            title: 'template title 2',
            filename: `template2.yml`,
            body: 'template body  2',
            about: 'about template 2',
            assignees: {edges: [], totalCount: 0},
            labels: {edges: [], totalCount: 0},
            __typename: 'IssueTemplate',
            __id: mockRelayId(),
            type: null,
          },
        ],
    issueForms: noTemplates
      ? []
      : [
          {
            name: 'Form name 1',
            title: 'Form title 1',
            description: 'Form description 1',
            assignees: {edges: [], totalCount: 0},
            labels: {edges: [], totalCount: 0},
            type: null,
            filename: 'formname1.yml',
            projects: {edges: []},
            __typename: 'IssueForm',
            __id: mockRelayId(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ' $fragmentSpreads': [] as any,
          },
        ],
    viewerIssueCreationPermissions: {
      labelable: viewerCanWrite ?? true,
      milestoneable: viewerCanWrite ?? true,
      assignable: viewerCanWrite ?? true,
      triageable: viewerCanWrite ?? true,
      typeable: viewerCanType ?? true,
    },
    contactLinks: noContactLinks
      ? []
      : [
          {
            __typename: 'RepositoryContactLink',
            name: 'external link 1',
            url: 'https://github.com',
            about: 'link about',
            __id: mockRelayId(),
          },
          {
            __typename: 'RepositoryContactLink',
            name: 'link name 2',
            url: 'https://github.com/foo',
            about: 'link about 2',
            __id: mockRelayId(),
          },
        ],
    contributingFileUrl: 'contributingURL',
    codeOfConductFileUrl: 'codeofconductURL',
    planFeatures: {
      maximumAssignees: 10,
    },
    ...overrides,
  }
}

export function buildMockTemplate({
  name,
  fileName,
  kind,
}: {
  name?: string
  fileName?: string
  kind?: IssueCreationKind
}) {
  return {
    name: name ?? 'MockTemplate',
    kind: kind ?? IssueCreationKind.IssueTemplate,
    fileName: fileName ?? 'MockTemplate.md',
    data: {
      title: 'MockTemplateTitle',
      body: 'MockTemplateBody',
      repository: {
        name: 'MockRepository',
        owner: {
          login: 'MockRepositoryOwner',
        },
      },
    },
  }
}
