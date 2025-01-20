import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {Meta} from '@storybook/react'
import {RepositoryAndIssuePicker} from './RepositoryAndIssuePicker'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {IssuePickerSearchGraphQLQuery} from '@github-ui/item-picker/IssuePicker'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import PRELOAD_CURRENT_REPOSITORY_QUERY from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {buildIssue, buildRepository} from '../test-utils/helpers'
import type {IssuePickerSearchQuery} from '@github-ui/item-picker/IssuePickerSearchQuery.graphql'

const meta = {
  title: 'RepositoryAndIssuePicker',
  component: RepositoryAndIssuePicker,
} satisfies Meta<typeof RepositoryAndIssuePicker>

export default meta

type Queries = {
  topRepositories: RepositoryPickerTopRepositoriesQuery
  issuePickerSearchGraphQLQuery: IssuePickerSearchQuery
  repositoryPickerCurrentRepoQuery: RepositoryPickerCurrentRepoQuery
  preloadCurrentRepositoryQuery: RepositoryPickerCurrentRepoQuery
  repositoryPickerCurrentRepoQueryB: RepositoryPickerCurrentRepoQuery
  preloadCurrentRepositoryQueryB: RepositoryPickerCurrentRepoQuery
}

export const PickerWithDefaultOrganizationExample = {
  decorators: [relayDecorator<typeof RepositoryAndIssuePicker, Queries>],
  args: {
    defaultRepositoryNameWithOwner: 'orgA/repoA',
    organization: 'orgA',
    anchorElement: props => <button {...props}>Click me</button>,
  },
  parameters: {
    actions: {argTypesRegex: '^on.*'},
    relay: {
      queries: {
        topRepositories: {
          type: 'preloaded',
          query: TopRepositories,
          variables: {topRepositoriesFirst: 5, hasIssuesEnabled: true, owner: null},
        },
        issuePickerSearchGraphQLQuery: {
          type: 'preloaded',
          query: IssuePickerSearchGraphQLQuery,
          variables: {
            commenters: `commenter:@me`,
            mentions: `mentions:@me`,
            assignee: `assignee:@me`,
            author: `author:@me`,
            open: `state:open`,
            resource: '',
            queryIsUrl: false,
          },
        },
        repositoryPickerCurrentRepoQuery: {
          type: 'preloaded',
          query: CurrentRepository,
          variables: {owner: 'orgA', name: 'repoA'},
        },
        preloadCurrentRepositoryQuery: {
          type: 'preloaded',
          query: PRELOAD_CURRENT_REPOSITORY_QUERY,
          variables: {owner: 'orgA', name: 'repoA', includeTemplates: false},
        },
        repositoryPickerCurrentRepoQueryB: {
          type: 'preloaded',
          query: CurrentRepository,
          variables: {owner: 'orgA', name: 'repoB'},
        },
        preloadCurrentRepositoryQueryB: {
          type: 'preloaded',
          query: PRELOAD_CURRENT_REPOSITORY_QUERY,
          variables: {owner: 'orgA', name: 'repoB', includeTemplates: false},
        },
      },
      mockResolvers: {
        Repository({args}) {
          if (!args?.name || !args?.owner) {
            return {}
          }
          return buildRepository({name: args.name as string, owner: args.owner as string})
        },
        RepositoryConnection() {
          return {
            edges: [
              {node: buildRepository({owner: 'orgA', name: 'repoA'})},
              {node: buildRepository({owner: 'orgA', name: 'repoB'})},
              {node: buildRepository({owner: 'orgB', name: 'repoC'})},
            ],
          }
        },
        Query() {
          return {
            commenters: {
              nodes: [buildIssue({title: 'issueA', databaseId: 1})],
            },
            mentions: {
              nodes: [buildIssue({title: 'mentions', databaseId: 2})],
            },
            assignee: {
              nodes: [buildIssue({title: 'assignee', databaseId: 3})],
            },
            author: {
              nodes: [buildIssue({title: 'author', databaseId: 4})],
            },
            open: {
              nodes: [buildIssue({title: 'open', databaseId: 5})],
            },
          }
        },
      },
    },
  },
} satisfies RelayStoryObj<typeof RepositoryAndIssuePicker, Queries>
