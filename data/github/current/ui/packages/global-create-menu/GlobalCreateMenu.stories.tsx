import type {Meta, StoryObj} from '@storybook/react'
import {within} from '@storybook/test'
import {expect} from '@storybook/jest'
import {storyWrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'react-relay'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import type {RepositoryAndTemplatePickerDialogQuery} from '@github-ui/issue-create/RepositoryAndTemplatePickerDialogQuery.graphql'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import {buildMockRepository} from '@github-ui/issue-create/__tests__/helpers'
import {GlobalCreateMenu, type GlobalCreateMenuProps} from './GlobalCreateMenu'

type Story = StoryObj<typeof GlobalCreateMenu>

const meta = {
  title: 'Apps/Global Nav/Create Menu',
  component: GlobalCreateMenu,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  decorators: [storyWrapper()],
} satisfies Meta<typeof GlobalCreateMenu>

export default meta

const playOpenMenu: Story['play'] = async ({canvasElement, step}) => {
  const canvas = within(canvasElement)

  await step('open the menu', async () => {
    const menuButton = canvas.getByRole('button', {name: 'Create New...'})
    expect(menuButton).toBeInTheDocument()
    // TODO: Fix bug and use `userEvent` https://github.com/github/core-ux/issues/248
    await menuButton.click()
    expect(await canvas.findByRole('menuitem', {name: 'New repository'})).toBeInTheDocument()
  })
}

type CreateIssueDialogEntryQueries = {
  repositoryPickerTopRepositoriesQuery: RepositoryPickerTopRepositoriesQuery
  repositoryAndTemplatePickerDialogQuery0: RepositoryAndTemplatePickerDialogQuery
  repositoryAndTemplatePickerDialogQuery1: RepositoryAndTemplatePickerDialogQuery
  repositoryAndTemplatePickerDialogQuery2: RepositoryAndTemplatePickerDialogQuery
}

type CreateIssueDialogWithRepoEntryQueries = CreateIssueDialogEntryQueries & {
  repositoryPickerCurrentRepoQuery: RepositoryPickerCurrentRepoQuery
}

const mockedRepos = [
  buildMockRepository({owner: 'orgA', name: 'repoA1', id: 'repoA1_id'}),
  buildMockRepository({owner: 'orgA', name: 'repoA2', id: 'repoA2_id'}),
  buildMockRepository({owner: 'orgB', name: 'repoB1', id: 'repoB1_id'}),
] as const

const repositoryAndTemplatePickerDialogQuery = graphql`
  query GlobalCreateMenuStoriesRepositoryAndTemplatePickerDialogQuery($id: ID!) @relay_test_operation {
    node(id: $id) {
      ... on Repository {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...RepositoryPickerRepositoryIssueTemplates
      }
    }
  }
`

export const AllLinks = {
  args: {
    codespaces: true,
    gist: true,
    importRepo: true,
    createOrg: true,
    createProject: true,
    createProjectUrl: '/monalisa?tab=projects',
    createLegacyProject: false,
    createIssue: true,
    org: {
      addWord: 'Invite',
      login: 'my-org',
    },
  } as GlobalCreateMenuProps,
  decorators: [relayDecorator<typeof GlobalCreateMenu, CreateIssueDialogEntryQueries>],
  parameters: {
    relay: {
      queries: {
        repositoryPickerTopRepositoriesQuery: {
          query: graphql`
            query GlobalCreateMenuStoriesRepositoryPickerTopRepositoriesQuery($owner: String) @relay_test_operation {
              viewer {
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...RepositoryPickerTopRepositories
                  @arguments(topRepositoriesFirst: 5, hasIssuesEnabled: true, owner: $owner)
              }
            }
          `,
          type: 'fragment',
          variables: {owner: null},
        },
        repositoryAndTemplatePickerDialogQuery0: {
          query: repositoryAndTemplatePickerDialogQuery,
          type: 'fragment',
          variables: {id: mockedRepos[0].id},
        },
        repositoryAndTemplatePickerDialogQuery1: {
          query: repositoryAndTemplatePickerDialogQuery,
          type: 'fragment',
          variables: {id: mockedRepos[1].id},
        },
        repositoryAndTemplatePickerDialogQuery2: {
          query: repositoryAndTemplatePickerDialogQuery,
          type: 'fragment',
          variables: {id: mockedRepos[2].id},
        },
      },
      mockResolvers: {
        RepositoryConnection() {
          return {
            edges: [{node: mockedRepos[0]}, {node: mockedRepos[1]}, {node: mockedRepos[2]}],
          }
        },
        Query() {
          return {node: mockedRepos[2]}
        },
      },
    },
  },
  play: playOpenMenu,
} satisfies RelayStoryObj<typeof GlobalCreateMenu, CreateIssueDialogEntryQueries>

export const LegacyProjectLink = {
  args: {createLegacyProject: true} as GlobalCreateMenuProps,
  play: playOpenMenu,
} satisfies Story

export const MinimumLinks = {
  args: {} as GlobalCreateMenuProps,
  play: playOpenMenu,
} satisfies Story

export const CreateIssueDialog = {
  ...AllLinks,
  args: {
    createIssue: true,
  },
  play: async context => {
    const {canvasElement, step} = context
    const canvas = within(canvasElement)

    await playOpenMenu(context)

    await step('click the "New issue" link', async () => {
      const newIssueLink = await canvas.findByRole('menuitem', {name: 'New issue'})
      expect(newIssueLink).toBeInTheDocument()
      // TODO: Fix bug and use `userEvent` https://github.com/github/core-ux/issues/248
      await newIssueLink.click()
      expect(await canvas.findByRole('dialog', {name: 'Create new issue'}, {timeout: 3000})).toBeInTheDocument()
    })
  },
} satisfies RelayStoryObj<typeof GlobalCreateMenu, CreateIssueDialogEntryQueries>

export const CreateIssueDialogWithRepo = {
  ...CreateIssueDialog,
  args: {
    createIssue: true,
    owner: 'orgB',
    repo: 'repoB1',
  },
  decorators: [relayDecorator<typeof GlobalCreateMenu, CreateIssueDialogWithRepoEntryQueries>],
  parameters: {
    relay: {
      queries: {
        ...CreateIssueDialog.parameters.relay.queries,
        repositoryPickerCurrentRepoQuery: {
          query: graphql`
            query GlobalCreateMenuStoriesRepositoryPickerCurrentRepoQuery(
              $owner: String!
              $name: String!
              $includeTemplates: Boolean = false
            ) @relay_test_operation {
              repository(owner: $owner, name: $name) {
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...RepositoryPickerRepository
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...RepositoryPickerRepositoryIssueTemplates @include(if: $includeTemplates)
              }
            }
          `,
          type: 'fragment',
          variables: {owner: 'orgB', name: 'repoB1', includeTemplates: true},
        },
      },
      mockResolvers: {
        ...CreateIssueDialog.parameters.relay.mockResolvers,
        Repository(ctx) {
          if (ctx.name === 'repository') {
            return mockedRepos[2]
          }
        },
      },
    },
  },
} satisfies RelayStoryObj<typeof GlobalCreateMenu, CreateIssueDialogWithRepoEntryQueries>
